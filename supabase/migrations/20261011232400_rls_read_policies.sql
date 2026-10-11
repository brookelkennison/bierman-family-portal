-- RLS read policies (#17).
--
-- Parents see only their own children's records. Reference tables (the
-- booking menu) are readable by any signed-in user. Logged-out visitors get
-- nothing. The audit log is never readable through the API.

-- ---------------------------------------------------------------------------
-- Helper: the logged-in parent's children
--
-- Every child-scoped policy uses this, so "whose kids are these" lives in one
-- place. security definer lets it read guardianships without recursing
-- through guardianships' own policy. search_path = '' blocks schema tricks.
-- ---------------------------------------------------------------------------

create function public.my_patient_ids()
returns setof uuid
language sql
stable
security definer
set search_path = ''
as $$
  select g.patient_id
  from public.guardianships g
  where g.guardian_id = (select auth.uid());
$$;

revoke execute on function public.my_patient_ids() from public, anon;
grant execute on function public.my_patient_ids() to authenticated;

-- ---------------------------------------------------------------------------
-- Logged-out visitors: no table access at all, on top of RLS
-- ---------------------------------------------------------------------------

revoke all on all tables in schema public from anon;
alter default privileges in schema public revoke all on tables from anon;

-- ---------------------------------------------------------------------------
-- Child-scoped tables: own children only
-- ---------------------------------------------------------------------------

create policy "patients: read own children"
  on public.patients
  for select
  to authenticated
  using (id in (select public.my_patient_ids()));

create policy "appointments: read own children"
  on public.appointments
  for select
  to authenticated
  using (patient_id in (select public.my_patient_ids()));

create policy "care_team: read own children"
  on public.care_team
  for select
  to authenticated
  using (patient_id in (select public.my_patient_ids()));

-- Only your own guardianship rows, so a co-parent's link stays hidden.
create policy "guardianships: read own rows"
  on public.guardianships
  for select
  to authenticated
  using (guardian_id = (select auth.uid()));

-- ---------------------------------------------------------------------------
-- Reference tables: read-only for any signed-in user
-- ---------------------------------------------------------------------------

create policy "centers: read"
  on public.centers for select to authenticated using (true);

create policy "providers: read"
  on public.providers for select to authenticated using (true);

create policy "provider_hours: read"
  on public.provider_hours for select to authenticated using (true);

create policy "appointment_types: read"
  on public.appointment_types for select to authenticated using (true);

revoke insert, update, delete on
  public.centers,
  public.providers,
  public.provider_hours,
  public.appointment_types,
  public.care_team
from authenticated;

-- ---------------------------------------------------------------------------
-- audit_log: RLS on, zero policies, and no grants. Only security definer
-- functions and triggers (#18) write to it.
-- ---------------------------------------------------------------------------

revoke all on public.audit_log from anon, authenticated;

-- ---------------------------------------------------------------------------
-- appointments insert: second lock
--
-- #18 revokes direct table writes, so all bookings go through
-- book_appointment(). This policy only matters if that grant ever came back:
-- even then, a parent could insert only a scheduled, family-bookable
-- appointment for their own child, created as themselves.
-- ---------------------------------------------------------------------------

create policy "appointments: insert own child, family bookable"
  on public.appointments
  for insert
  to authenticated
  with check (
    patient_id in (select public.my_patient_ids())
    and status = 'scheduled'
    and created_by = (select auth.uid())
    and exists (
      select 1
      from public.appointment_types t
      where t.code = appointments.type
        and t.family_bookable
    )
  );
