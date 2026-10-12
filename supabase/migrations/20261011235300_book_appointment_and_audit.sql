-- book_appointment and the audit log (#18).
--
-- After this migration, the only way to create an appointment is
-- book_appointment(). It checks every business rule, then inserts.
-- A trigger records every appointment write in audit_log (field names only).

-- ---------------------------------------------------------------------------
-- 1. Lock the tables
--
-- RLS stays on with its policies. This removes the table permissions
-- themselves, so a direct write fails with "permission denied" before RLS
-- is checked. The insert policy from #17 stays as a backup.
-- ---------------------------------------------------------------------------

revoke insert, update, delete on
  public.appointments,
  public.patients,
  public.guardianships
from anon, authenticated;

-- ---------------------------------------------------------------------------
-- 2. book_appointment
--
-- Checks run in order and stop at the first failure. Each error message is a
-- short code the API maps to a friendly message:
--
--   not_signed_in        42501  no logged-in user
--   not_your_child       42501  caller isn't this child's guardian
--   not_family_bookable  22023  type isn't parent training (or doesn't exist)
--   in_past              22023  start time already passed
--   too_far_ahead        22023  more than 60 days out
--   wrong_center         22023  provider doesn't work at the child's home center
--   wrong_provider       22023  provider's discipline doesn't match the type
--   not_slot_aligned     22023  start isn't on :00 or :30 (center time)
--   outside_hours        22023  not inside the provider's hours that day
--   notes_too_long       22023  notes over 500 characters
--   slot_taken           23P01  provider already booked then (screen 09)
--   child_busy           23P01  child already has something then
--
-- The function sets ends_at from the type's duration and created_by from the
-- caller, so the client can't fake either. security definer lets it insert
-- even though the table is locked; it does its own ownership check instead.
-- ---------------------------------------------------------------------------

create function public.book_appointment(
  p_patient_id  uuid,
  p_provider_id uuid,
  p_type        text,
  p_starts_at   timestamptz,
  p_notes       text default null
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_uid          uuid := (select auth.uid());
  v_type         public.appointment_types%rowtype;
  v_provider     public.providers%rowtype;
  v_home_center  uuid;
  v_tz           text;
  v_local_start  timestamp;
  v_ends_at      timestamptz;
  v_local_end    timestamp;
  v_notes        text := nullif(btrim(p_notes), '');
  v_constraint   text;
  v_id           uuid;
begin
  if v_uid is null then
    raise exception 'not_signed_in' using errcode = '42501';
  end if;

  if not exists (
    select 1 from public.guardianships g
    where g.guardian_id = v_uid and g.patient_id = p_patient_id
  ) then
    raise exception 'not_your_child' using errcode = '42501';
  end if;

  select * into v_type from public.appointment_types t where t.code = p_type;
  if not found or not v_type.family_bookable then
    raise exception 'not_family_bookable' using errcode = '22023';
  end if;

  if p_starts_at <= now() then
    raise exception 'in_past' using errcode = '22023';
  end if;

  if p_starts_at > now() + interval '60 days' then
    raise exception 'too_far_ahead' using errcode = '22023';
  end if;

  select pa.home_center_id into v_home_center
  from public.patients pa where pa.id = p_patient_id;

  select * into v_provider from public.providers pr where pr.id = p_provider_id;
  if not found or v_provider.center_id <> v_home_center then
    raise exception 'wrong_center' using errcode = '22023';
  end if;

  if v_provider.discipline <> v_type.discipline then
    raise exception 'wrong_provider' using errcode = '22023';
  end if;

  -- Hours and slots are in the center's local time.
  select c.timezone into v_tz from public.centers c where c.id = v_home_center;
  v_local_start := p_starts_at at time zone v_tz;
  v_ends_at     := p_starts_at + make_interval(mins => v_type.duration_minutes);
  v_local_end   := v_ends_at at time zone v_tz;

  if extract(second from v_local_start) <> 0
     or extract(minute from v_local_start)::int % 30 <> 0 then
    raise exception 'not_slot_aligned' using errcode = '22023';
  end if;

  if v_local_end::date <> v_local_start::date
     or not exists (
       select 1 from public.provider_hours h
       where h.provider_id = p_provider_id
         and h.weekday = extract(dow from v_local_start)::int
         and h.starts_at <= v_local_start::time
         and h.ends_at   >= v_local_end::time
     ) then
    raise exception 'outside_hours' using errcode = '22023';
  end if;

  if char_length(v_notes) > 500 then
    raise exception 'notes_too_long' using errcode = '22023';
  end if;

  begin
    insert into public.appointments
      (patient_id, provider_id, type, starts_at, ends_at, notes, created_by)
    values
      (p_patient_id, p_provider_id, p_type, p_starts_at, v_ends_at, v_notes, v_uid)
    returning id into v_id;
  exception when exclusion_violation then
    get stacked diagnostics v_constraint = constraint_name;
    if v_constraint = 'appointments_no_patient_overlap' then
      raise exception 'child_busy' using errcode = '23P01';
    else
      raise exception 'slot_taken' using errcode = '23P01';
    end if;
  end;

  return v_id;
end;
$$;

revoke execute on function public.book_appointment(uuid, uuid, text, timestamptz, text)
  from public, anon;
grant execute on function public.book_appointment(uuid, uuid, text, timestamptz, text)
  to authenticated;

-- ---------------------------------------------------------------------------
-- 3. Audit log
--
-- One row per appointment write: who, what, which record, and which column
-- NAMES changed. Never values, so notes and other PHI stay out of the log.
-- updated_at is left out of the changed list since it changes every time.
-- ---------------------------------------------------------------------------

create function public.audit_appointments()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_fields    text[];
  v_record_id uuid;
begin
  if tg_op = 'INSERT' then
    v_record_id := new.id;
    select coalesce(array_agg(n.key order by n.key), '{}')
      into v_fields
    from jsonb_each(to_jsonb(new)) n
    where n.value <> 'null'::jsonb;
  elsif tg_op = 'UPDATE' then
    v_record_id := new.id;
    select coalesce(array_agg(n.key order by n.key), '{}')
      into v_fields
    from jsonb_each(to_jsonb(new)) n
    join jsonb_each(to_jsonb(old)) o using (key)
    where n.value is distinct from o.value
      and n.key <> 'updated_at';
  else
    v_record_id := old.id;
    v_fields := '{}';
  end if;

  insert into public.audit_log (actor_id, action, table_name, record_id, changed_fields)
  values ((select auth.uid()), lower(tg_op), tg_table_name, v_record_id, v_fields);

  return null;
end;
$$;

revoke execute on function public.audit_appointments() from public, anon, authenticated;

create trigger appointments_audit
  after insert or update or delete on public.appointments
  for each row execute function public.audit_appointments();
