-- provider_busy_times tests (#35).
-- Runs inside one transaction and rolls back.

begin;
create extension if not exists pgtap with schema extensions;
set local search_path = public, extensions;

select plan(7);

-- ---------------------------------------------------------------------------
-- Setup (as the database owner)
-- ---------------------------------------------------------------------------

insert into auth.users (id, email, raw_user_meta_data) values
  ('aaaaaaaa-0000-0000-0000-000000000003', 'parent.a3@example.test', '{"full_name": "Parent A"}'),
  ('bbbbbbbb-0000-0000-0000-000000000003', 'parent.b3@example.test', '{"full_name": "Parent B"}'),
  ('eeeeeeee-0000-0000-0000-000000000003', 'nokids3@example.test', '{"full_name": "No Kids"}');

insert into public.centers (id, name, address, city, state, postal_code, phone, timezone) values
  ('cccccccc-0000-0000-0000-000000000004', 'Busy Center', '1 Test St', 'Carmel', 'IN', '46032', '3175550100', 'America/Indiana/Indianapolis'),
  ('cccccccc-0000-0000-0000-000000000005', 'Far Center', '2 Test St', 'Fishers', 'IN', '46037', '3175550101', 'America/Indiana/Indianapolis');

insert into public.providers (id, center_id, display_name, discipline, credential) values
  ('dddddddd-0000-0000-0000-000000000006', 'cccccccc-0000-0000-0000-000000000004', 'BCBA Here', 'aba', 'BCBA'),
  ('dddddddd-0000-0000-0000-000000000007', 'cccccccc-0000-0000-0000-000000000005', 'BCBA Far', 'aba', 'BCBA');

insert into public.appointment_types (code, label, short_label, duration_minutes, discipline, family_bookable) values
  ('parent_training', 'Parent training', 'Parent training', 60, 'aba', true)
on conflict (code) do nothing;

insert into public.patients (id, first_name, last_name, date_of_birth, program, weekly_aba_hours, home_center_id) values
  ('a3a3a3a3-0000-0000-0000-000000000001', 'Kid', 'A', '2019-01-01', 'focused_aba', 6, 'cccccccc-0000-0000-0000-000000000004'),
  ('b3b3b3b3-0000-0000-0000-000000000001', 'Kid', 'B', '2020-01-01', 'focused_aba', 6, 'cccccccc-0000-0000-0000-000000000004'),
  ('b3b3b3b3-0000-0000-0000-000000000002', 'Kid', 'Far', '2020-01-01', 'focused_aba', 6, 'cccccccc-0000-0000-0000-000000000005');

insert into public.guardianships (guardian_id, patient_id, relationship) values
  ('aaaaaaaa-0000-0000-0000-000000000003', 'a3a3a3a3-0000-0000-0000-000000000001', 'Parent'),
  ('bbbbbbbb-0000-0000-0000-000000000003', 'b3b3b3b3-0000-0000-0000-000000000001', 'Parent'),
  ('bbbbbbbb-0000-0000-0000-000000000003', 'b3b3b3b3-0000-0000-0000-000000000002', 'Parent');

-- Inserted as the owner, so the table lock from #18 doesn't apply here.
-- Parent B's child has two visits with BCBA Here (one cancelled), and one
-- with BCBA Far.
insert into public.appointments (patient_id, provider_id, type, starts_at, ends_at, notes) values
  ('b3b3b3b3-0000-0000-0000-000000000001', 'dddddddd-0000-0000-0000-000000000006', 'parent_training',
   '2030-03-04 15:00+00', '2030-03-04 16:00+00', 'Private note'),
  ('b3b3b3b3-0000-0000-0000-000000000002', 'dddddddd-0000-0000-0000-000000000007', 'parent_training',
   '2030-03-04 15:00+00', '2030-03-04 16:00+00', null);

insert into public.appointments
  (patient_id, provider_id, type, starts_at, ends_at, status, cancelled_at, cancel_reason, cancelled_by_kind)
values
  ('b3b3b3b3-0000-0000-0000-000000000001', 'dddddddd-0000-0000-0000-000000000006', 'parent_training',
   '2030-03-05 15:00+00', '2030-03-05 16:00+00', 'cancelled', now(), 'Sick', 'caregiver');

-- ---------------------------------------------------------------------------
-- As Parent A (shares a center with Parent B, but not a child)
-- ---------------------------------------------------------------------------

set local role authenticated;
select set_config('request.jwt.claims', '{"sub": "aaaaaaaa-0000-0000-0000-000000000003", "role": "authenticated"}', true);

select results_eq(
  $$ select starts_at, ends_at from public.provider_busy_times(
       'dddddddd-0000-0000-0000-000000000006', '2030-03-01', '2030-03-10') $$,
  $$ values ('2030-03-04 15:00+00'::timestamptz, '2030-03-04 16:00+00'::timestamptz) $$,
  'Shows another family''s visit as a busy time, and skips cancelled ones'
);

select is(
  (select count(*) from public.appointments
   where provider_id = 'dddddddd-0000-0000-0000-000000000006')::int,
  0,
  'RLS still hides the appointment rows themselves'
);

select is_empty(
  $$ select * from public.provider_busy_times(
       'dddddddd-0000-0000-0000-000000000007', '2030-03-01', '2030-03-10') $$,
  'Providers at a center where you have no child return nothing'
);

select throws_ok(
  $$ select * from public.provider_busy_times(
       'dddddddd-0000-0000-0000-000000000006', '2030-01-01', '2030-06-01') $$,
  '22023', 'window_too_large', 'Windows over 62 days are rejected'
);

select throws_ok(
  $$ select * from public.provider_busy_times(
       'dddddddd-0000-0000-0000-000000000006', '2030-03-10', '2030-03-01') $$,
  '22023', 'window_too_large', 'An end before the start is rejected'
);

-- ---------------------------------------------------------------------------
-- A parent with no children linked
-- ---------------------------------------------------------------------------

select set_config('request.jwt.claims', '{"sub": "eeeeeeee-0000-0000-0000-000000000003", "role": "authenticated"}', true);

select is_empty(
  $$ select * from public.provider_busy_times(
       'dddddddd-0000-0000-0000-000000000006', '2030-03-01', '2030-03-10') $$,
  'A parent with no children sees nothing'
);

-- ---------------------------------------------------------------------------
-- Logged out
-- ---------------------------------------------------------------------------

reset role;
set local role anon;
select set_config('request.jwt.claims', '{"role": "anon"}', true);

select throws_ok(
  $$ select * from public.provider_busy_times(
       'dddddddd-0000-0000-0000-000000000006', '2030-03-01', '2030-03-10') $$,
  '42501', null, 'Logged-out users cannot call it'
);

reset role;
select * from finish();
rollback;
