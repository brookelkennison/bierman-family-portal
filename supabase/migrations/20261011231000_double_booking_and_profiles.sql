-- Double-booking rules, profile-on-signup trigger, and role guard (#15).

-- ---------------------------------------------------------------------------
-- 1. No double-booking
--
-- A provider can't have two scheduled appointments that overlap, and neither
-- can a child. Only 'scheduled' rows count, so a cancelled slot frees up.
-- The database enforces this, so two parents booking the same slot at the
-- same moment can't both win. The loser gets error 23P01 (exclusion
-- violation), which the API maps to the "slot just taken" screen.
-- ---------------------------------------------------------------------------

create extension if not exists btree_gist with schema extensions;

alter table public.appointments
  add constraint appointments_no_provider_overlap
  exclude using gist (
    provider_id with =,
    tstzrange(starts_at, ends_at, '[)') with &&
  )
  where (status = 'scheduled');

alter table public.appointments
  add constraint appointments_no_patient_overlap
  exclude using gist (
    patient_id with =,
    tstzrange(starts_at, ends_at, '[)') with &&
  )
  where (status = 'scheduled');

-- '[)' means start is included and end is not, so a 3:00-4:00 session and a
-- 4:00-5:00 session back to back are allowed.

-- ---------------------------------------------------------------------------
-- 2. Profile created on signup
--
-- Every new login gets a profiles row with the same id. Role is always
-- 'guardian' (the column default). It is never read from signup metadata,
-- because the person signing up controls that metadata.
-- ---------------------------------------------------------------------------

create function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, full_name)
  values (
    new.id,
    left(
      coalesce(
        nullif(btrim(new.raw_user_meta_data ->> 'full_name'), ''),
        split_part(new.email, '@', 1)
      ),
      100
    )
  );
  return new;
end;
$$;

-- Only the trigger runs this, never a client.
revoke execute on function public.handle_new_user() from public, anon, authenticated;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ---------------------------------------------------------------------------
-- 3. Role escalation guard
--
-- Signed-in users can read and update only their own profile, and the only
-- column they can update is full_name. Updating role fails with a
-- permission error before RLS is even checked.
-- ---------------------------------------------------------------------------

revoke insert, update, delete on public.profiles from anon, authenticated;
grant update (full_name) on public.profiles to authenticated;

create policy "profiles: read own row"
  on public.profiles
  for select
  to authenticated
  using (id = (select auth.uid()));

create policy "profiles: update own name"
  on public.profiles
  for update
  to authenticated
  using (id = (select auth.uid()))
  with check (id = (select auth.uid()));
