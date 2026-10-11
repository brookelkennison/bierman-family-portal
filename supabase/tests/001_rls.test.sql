-- RLS tests (#17). Two fake families try to read each other's data.
-- Runs in CI against a throwaway database with `pnpm test:db`.
-- Everything happens inside one transaction and rolls back at the end.

begin;
create extension if not exists pgtap with schema extensions;
set local search_path = public, extensions;

select plan(16);

-- ---------------------------------------------------------------------------
-- Setup (as the database owner, so RLS doesn't apply yet)
-- ---------------------------------------------------------------------------

insert into auth.users (id, email, raw_user_meta_data) values
  ('aaaaaaaa-0000-0000-0000-000000000001', 'parent.a@example.test', '{"full_name": "Parent A"}'),
  ('bbbbbbbb-0000-0000-0000-000000000001', 'parent.b@example.test', '{"full_name": "Parent B", "role": "clinician"}');

insert into public.centers (id, name, address, city, state, postal_code, phone, timezone) values
  ('cccccccc-0000-0000-0000-000000000001', 'Test Center', '1 Test St', 'Carmel', 'IN', '46032', '3175550100', 'America/Indiana/Indianapolis');

insert into public.providers (id, center_id, display_name, discipline, credential) values
  ('dddddddd-0000-0000-0000-000000000001', 'cccccccc-0000-0000-0000-000000000001', 'Test BCBA', 'aba', 'BCBA');

insert into public.appointment_types (code, label, short_label, duration_minutes, discipline, family_bookable) values
  ('parent_training', 'Parent training', 'Parent training', 60, 'aba', true),
  ('aba_session', 'ABA session', 'ABA', 120, 'aba', false);

insert into public.patients (id, first_name, last_name, date_of_birth, program, weekly_aba_hours, home_center_id) values
  ('a1a1a1a1-0000-0000-0000-000000000001', 'Kid', 'A', '2019-01-01', 'focused_aba', 6, 'cccccccc-0000-0000-0000-000000000001'),
  ('b1b1b1b1-0000-0000-0000-000000000001', 'Kid', 'B', '2022-01-01', 'comprehensive_aba', 25, 'cccccccc-0000-0000-0000-000000000001');

insert into public.guardianships (guardian_id, patient_id, relationship) values
  ('aaaaaaaa-0000-0000-0000-000000000001', 'a1a1a1a1-0000-0000-0000-000000000001', 'Parent'),
  ('bbbbbbbb-0000-0000-0000-000000000001', 'b1b1b1b1-0000-0000-0000-000000000001', 'Parent');

insert into public.care_team (patient_id, provider_id, role) values
  ('a1a1a1a1-0000-0000-0000-000000000001', 'dddddddd-0000-0000-0000-000000000001', 'BCBA'),
  ('b1b1b1b1-0000-0000-0000-000000000001', 'dddddddd-0000-0000-0000-000000000001', 'BCBA');

insert into public.appointments (patient_id, provider_id, type, starts_at, ends_at) values
  ('a1a1a1a1-0000-0000-0000-000000000001', 'dddddddd-0000-0000-0000-000000000001', 'aba_session', '2030-01-07 15:00Z', '2030-01-07 17:00Z'),
  ('b1b1b1b1-0000-0000-0000-000000000001', 'dddddddd-0000-0000-0000-000000000001', 'aba_session', '2030-01-08 15:00Z', '2030-01-08 17:00Z');

-- Profile trigger (#15): both got profiles, and B's "clinician" was ignored.
select results_eq(
  $$ select role::text from public.profiles where id = 'bbbbbbbb-0000-0000-0000-000000000001' $$,
  $$ values ('guardian') $$,
  'Signup metadata cannot set role'
);

-- Double-booking (#15): same provider, overlapping time.
select throws_ok(
  $$ insert into public.appointments (patient_id, provider_id, type, starts_at, ends_at)
     values ('b1b1b1b1-0000-0000-0000-000000000001', 'dddddddd-0000-0000-0000-000000000001',
             'parent_training', '2030-01-07 16:00Z', '2030-01-07 17:00Z') $$,
  '23P01',
  null,
  'Provider cannot be double-booked'
);

-- ---------------------------------------------------------------------------
-- As Parent A
-- ---------------------------------------------------------------------------

set local role authenticated;
select set_config('request.jwt.claims', '{"sub": "aaaaaaaa-0000-0000-0000-000000000001", "role": "authenticated"}', true);

select results_eq(
  $$ select id from public.patients $$,
  $$ values ('a1a1a1a1-0000-0000-0000-000000000001'::uuid) $$,
  'Parent A sees only their own child'
);

select is(
  (select count(*)::int from public.appointments),
  1,
  'Parent A sees only their own child''s appointments'
);

select is(
  (select count(*)::int from public.appointments where patient_id = 'b1b1b1b1-0000-0000-0000-000000000001'),
  0,
  'Parent A cannot read Parent B''s appointments by id'
);

select is((select count(*)::int from public.care_team), 1, 'Parent A sees only their own child''s care team');
select is((select count(*)::int from public.guardianships), 1, 'Parent A sees only their own guardianship');
select is((select count(*)::int from public.profiles), 1, 'Parent A sees only their own profile');
select is((select count(*)::int from public.centers), 1, 'Signed-in users can read centers');
select is((select count(*)::int from public.appointment_types), 2, 'Signed-in users can read appointment types');

select throws_ok(
  $$ update public.profiles set role = 'clinician' where id = 'aaaaaaaa-0000-0000-0000-000000000001' $$,
  '42501',
  null,
  'Parent cannot change their own role'
);

select throws_ok(
  $$ select * from public.audit_log $$,
  '42501',
  null,
  'Parent cannot read the audit log'
);

select throws_ok(
  $$ insert into public.appointments (patient_id, provider_id, type, starts_at, ends_at, created_by)
     values ('b1b1b1b1-0000-0000-0000-000000000001', 'dddddddd-0000-0000-0000-000000000001',
             'parent_training', '2030-02-01 15:00Z', '2030-02-01 16:00Z',
             'aaaaaaaa-0000-0000-0000-000000000001') $$,
  '42501',
  null,
  'Parent A cannot book for Parent B''s child'
);

select throws_ok(
  $$ insert into public.centers (name, address, city, state, postal_code, phone, timezone)
     values ('Fake', '1 St', 'X', 'IN', '46000', '3175550199', 'America/Indiana/Indianapolis') $$,
  '42501',
  null,
  'Parent cannot write reference tables'
);

-- ---------------------------------------------------------------------------
-- As Parent B
-- ---------------------------------------------------------------------------

select set_config('request.jwt.claims', '{"sub": "bbbbbbbb-0000-0000-0000-000000000001", "role": "authenticated"}', true);

select results_eq(
  $$ select id from public.patients $$,
  $$ values ('b1b1b1b1-0000-0000-0000-000000000001'::uuid) $$,
  'Parent B sees only their own child'
);

-- ---------------------------------------------------------------------------
-- Logged out
-- ---------------------------------------------------------------------------

reset role;
set local role anon;
select set_config('request.jwt.claims', '{"role": "anon"}', true);

select throws_ok(
  $$ select * from public.patients $$,
  '42501',
  null,
  'Logged-out visitors cannot read patients'
);

select * from finish();
rollback;
