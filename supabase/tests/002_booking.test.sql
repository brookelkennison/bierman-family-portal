-- book_appointment and audit log tests (#18).
-- One test per rule, plus a successful booking and its audit row.
-- Runs inside one transaction and rolls back.

begin;
create extension if not exists pgtap with schema extensions;
set local search_path = public, extensions;

select plan(18);

-- ---------------------------------------------------------------------------
-- Setup (as the database owner)
-- ---------------------------------------------------------------------------

insert into auth.users (id, email, raw_user_meta_data) values
  ('aaaaaaaa-0000-0000-0000-000000000002', 'parent.a2@example.test', '{"full_name": "Parent A"}'),
  ('bbbbbbbb-0000-0000-0000-000000000002', 'parent.b2@example.test', '{"full_name": "Parent B"}');

insert into public.centers (id, name, address, city, state, postal_code, phone, timezone) values
  ('cccccccc-0000-0000-0000-000000000002', 'Home Center', '1 Test St', 'Carmel', 'IN', '46032', '3175550100', 'America/Indiana/Indianapolis'),
  ('cccccccc-0000-0000-0000-000000000003', 'Other Center', '2 Test St', 'Fishers', 'IN', '46037', '3175550101', 'America/Indiana/Indianapolis');

insert into public.providers (id, center_id, display_name, discipline, credential) values
  ('dddddddd-0000-0000-0000-000000000002', 'cccccccc-0000-0000-0000-000000000002', 'BCBA One', 'aba', 'BCBA'),
  ('dddddddd-0000-0000-0000-000000000003', 'cccccccc-0000-0000-0000-000000000002', 'BCBA Two', 'aba', 'BCBA'),
  ('dddddddd-0000-0000-0000-000000000004', 'cccccccc-0000-0000-0000-000000000003', 'BCBA Elsewhere', 'aba', 'BCBA'),
  ('dddddddd-0000-0000-0000-000000000005', 'cccccccc-0000-0000-0000-000000000002', 'Speech Therapist', 'speech', 'CCC-SLP');

-- Mondays (weekday 1), 9:00 to 17:00 center time, for everyone.
insert into public.provider_hours (provider_id, weekday, starts_at, ends_at)
select id, 1, '09:00', '17:00' from public.providers
where id in ('dddddddd-0000-0000-0000-000000000002', 'dddddddd-0000-0000-0000-000000000003',
             'dddddddd-0000-0000-0000-000000000004', 'dddddddd-0000-0000-0000-000000000005');

insert into public.appointment_types (code, label, short_label, duration_minutes, discipline, family_bookable) values
  ('parent_training', 'Parent training', 'Parent training', 60, 'aba', true),
  ('aba_session', 'ABA session', 'ABA', 120, 'aba', false)
on conflict (code) do nothing;

insert into public.patients (id, first_name, last_name, date_of_birth, program, weekly_aba_hours, home_center_id) values
  ('a2a2a2a2-0000-0000-0000-000000000001', 'Kid', 'A1', '2019-01-01', 'focused_aba', 6, 'cccccccc-0000-0000-0000-000000000002'),
  ('a2a2a2a2-0000-0000-0000-000000000002', 'Kid', 'A2', '2022-01-01', 'comprehensive_aba', 25, 'cccccccc-0000-0000-0000-000000000002'),
  ('b2b2b2b2-0000-0000-0000-000000000001', 'Kid', 'B1', '2020-01-01', 'focused_aba', 6, 'cccccccc-0000-0000-0000-000000000002');

insert into public.guardianships (guardian_id, patient_id, relationship) values
  ('aaaaaaaa-0000-0000-0000-000000000002', 'a2a2a2a2-0000-0000-0000-000000000001', 'Parent'),
  ('aaaaaaaa-0000-0000-0000-000000000002', 'a2a2a2a2-0000-0000-0000-000000000002', 'Parent'),
  ('bbbbbbbb-0000-0000-0000-000000000002', 'b2b2b2b2-0000-0000-0000-000000000001', 'Parent');

-- Next week's Monday at a given center-local time, as timestamptz.
create function pg_temp.next_monday(p_time interval)
returns timestamptz language sql stable as $$
  select (date_trunc('week', now() at time zone 'America/Indiana/Indianapolis')
          + interval '7 days' + p_time) at time zone 'America/Indiana/Indianapolis'
$$;

create temp table booked (id uuid);
grant select, insert on booked to authenticated;

-- ---------------------------------------------------------------------------
-- As Parent A
-- ---------------------------------------------------------------------------

set local role authenticated;
select set_config('request.jwt.claims', '{"sub": "aaaaaaaa-0000-0000-0000-000000000002", "role": "authenticated"}', true);

insert into booked
select public.book_appointment(
  'a2a2a2a2-0000-0000-0000-000000000001', 'dddddddd-0000-0000-0000-000000000002',
  'parent_training', pg_temp.next_monday('15:00'), '  Want to talk about bedtime  ');

select isnt((select id from booked), null, 'Parent can book parent training for their child');

select results_eq(
  $$ select ends_at - starts_at, created_by, notes from public.appointments where id = (select id from booked) $$,
  $$ values (interval '60 minutes', 'aaaaaaaa-0000-0000-0000-000000000002'::uuid, 'Want to talk about bedtime') $$,
  'ends_at comes from the type, created_by from the caller, notes are trimmed'
);

select throws_ok(
  $$ select public.book_appointment('a2a2a2a2-0000-0000-0000-000000000002', 'dddddddd-0000-0000-0000-000000000002',
       'parent_training', pg_temp.next_monday('15:30')) $$,
  '23P01', 'slot_taken', 'Overlapping time with the same provider is slot_taken');

select throws_ok(
  $$ select public.book_appointment('a2a2a2a2-0000-0000-0000-000000000001', 'dddddddd-0000-0000-0000-000000000003',
       'parent_training', pg_temp.next_monday('15:00')) $$,
  '23P01', 'child_busy', 'Same child at an overlapping time is child_busy');

select lives_ok(
  $$ select public.book_appointment('a2a2a2a2-0000-0000-0000-000000000002', 'dddddddd-0000-0000-0000-000000000002',
       'parent_training', pg_temp.next_monday('16:00')) $$,
  'Back-to-back booking right after is allowed');

select throws_ok(
  $$ select public.book_appointment('b2b2b2b2-0000-0000-0000-000000000001', 'dddddddd-0000-0000-0000-000000000002',
       'parent_training', pg_temp.next_monday('10:00')) $$,
  '42501', 'not_your_child', 'Cannot book for another family''s child');

select throws_ok(
  $$ select public.book_appointment('a2a2a2a2-0000-0000-0000-000000000001', 'dddddddd-0000-0000-0000-000000000002',
       'aba_session', pg_temp.next_monday('10:00')) $$,
  '22023', 'not_family_bookable', 'Cannot book care-team session types');

select throws_ok(
  $$ select public.book_appointment('a2a2a2a2-0000-0000-0000-000000000001', 'dddddddd-0000-0000-0000-000000000002',
       'parent_training', pg_temp.next_monday('10:00') - interval '14 days') $$,
  '22023', 'in_past', 'Cannot book in the past');

select throws_ok(
  $$ select public.book_appointment('a2a2a2a2-0000-0000-0000-000000000001', 'dddddddd-0000-0000-0000-000000000002',
       'parent_training', pg_temp.next_monday('10:00') + interval '70 days') $$,
  '22023', 'too_far_ahead', 'Cannot book more than 60 days out');

select throws_ok(
  $$ select public.book_appointment('a2a2a2a2-0000-0000-0000-000000000001', 'dddddddd-0000-0000-0000-000000000004',
       'parent_training', pg_temp.next_monday('10:00')) $$,
  '22023', 'wrong_center', 'Provider must work at the child''s home center');

select throws_ok(
  $$ select public.book_appointment('a2a2a2a2-0000-0000-0000-000000000001', 'dddddddd-0000-0000-0000-000000000005',
       'parent_training', pg_temp.next_monday('10:00')) $$,
  '22023', 'wrong_provider', 'Provider discipline must match the type');

select throws_ok(
  $$ select public.book_appointment('a2a2a2a2-0000-0000-0000-000000000001', 'dddddddd-0000-0000-0000-000000000002',
       'parent_training', pg_temp.next_monday('10:15')) $$,
  '22023', 'not_slot_aligned', 'Start must be on :00 or :30');

select throws_ok(
  $$ select public.book_appointment('a2a2a2a2-0000-0000-0000-000000000001', 'dddddddd-0000-0000-0000-000000000002',
       'parent_training', pg_temp.next_monday('08:00')) $$,
  '22023', 'outside_hours', 'Cannot start before the provider''s hours');

select throws_ok(
  $$ select public.book_appointment('a2a2a2a2-0000-0000-0000-000000000001', 'dddddddd-0000-0000-0000-000000000002',
       'parent_training', pg_temp.next_monday('16:30')) $$,
  '22023', 'outside_hours', 'Session cannot run past the provider''s hours');

select throws_ok(
  $$ select public.book_appointment('a2a2a2a2-0000-0000-0000-000000000001', 'dddddddd-0000-0000-0000-000000000002',
       'parent_training', pg_temp.next_monday('10:00') + interval '1 day') $$,
  '22023', 'outside_hours', 'Cannot book on a day the provider is off');

select throws_ok(
  $$ insert into public.appointments (patient_id, provider_id, type, starts_at, ends_at, created_by)
     values ('a2a2a2a2-0000-0000-0000-000000000001', 'dddddddd-0000-0000-0000-000000000002',
             'parent_training', pg_temp.next_monday('11:00'), pg_temp.next_monday('12:00'),
             'aaaaaaaa-0000-0000-0000-000000000002') $$,
  '42501', null, 'Direct insert into appointments is denied');

-- ---------------------------------------------------------------------------
-- Logged out
-- ---------------------------------------------------------------------------

reset role;
set local role anon;
select set_config('request.jwt.claims', '{"role": "anon"}', true);

select throws_ok(
  $$ select public.book_appointment('a2a2a2a2-0000-0000-0000-000000000001', 'dddddddd-0000-0000-0000-000000000002',
       'parent_training', pg_temp.next_monday('11:00')) $$,
  '42501', null, 'Logged-out visitors cannot call book_appointment');

-- ---------------------------------------------------------------------------
-- Audit row (as the owner, since parents can't read the log)
-- ---------------------------------------------------------------------------

reset role;

select results_eq(
  $$ select action, actor_id, 'notes' = any(changed_fields), 'Want to talk about bedtime' = any(changed_fields)
     from public.audit_log where record_id = (select id from booked) $$,
  $$ values ('insert', 'aaaaaaaa-0000-0000-0000-000000000002'::uuid, true, false) $$,
  'Booking writes one audit row with field names, not values'
);

select * from finish();
rollback;
