-- Core schema for the Bierman Family Portal (#14).
-- Matches the ERD in FigJam (section "3. ERD").
--
-- Not in this file:
--   double-booking exclusion constraints  -> #15
--   profile-on-signup trigger              -> #16
--   RLS policies and my_patient_ids()      -> #17
--   booking functions and revoked writes   -> #18
--   audit triggers                         -> #19
--
-- Delete rules: medical records use RESTRICT. Columns that only record who
-- did something use SET NULL so the record survives. Nothing cascades except
-- profiles from auth.users.

-- ---------------------------------------------------------------------------
-- Enums
-- ---------------------------------------------------------------------------

create type public.user_role as enum ('guardian', 'clinician');
create type public.discipline as enum ('aba', 'speech', 'ot');
create type public.program as enum ('focused_aba', 'comprehensive_aba');
create type public.appointment_status as enum ('scheduled', 'completed', 'cancelled');
create type public.cancelled_by_kind as enum ('caregiver', 'center');

-- ---------------------------------------------------------------------------
-- updated_at trigger function
-- ---------------------------------------------------------------------------

create function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

-- ---------------------------------------------------------------------------
-- profiles: one row per login, same id as auth.users
-- ---------------------------------------------------------------------------

create table public.profiles (
  id          uuid primary key references auth.users (id) on delete cascade,
  role        public.user_role not null default 'guardian',
  full_name   text not null check (char_length(btrim(full_name)) between 1 and 100),
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- centers
-- ---------------------------------------------------------------------------

create table public.centers (
  id           uuid primary key default gen_random_uuid(),
  name         text not null check (char_length(btrim(name)) between 1 and 100),
  address      text not null check (char_length(btrim(address)) between 1 and 200),
  city         text not null check (char_length(btrim(city)) between 1 and 100),
  state        text not null check (state ~ '^[A-Z]{2}$'),
  postal_code  text not null check (postal_code ~ '^[0-9]{5}$'),
  phone        text not null check (char_length(phone) between 7 and 20),
  timezone     text not null check (char_length(timezone) between 1 and 64)
);

comment on column public.centers.timezone is 'IANA name, e.g. America/Indiana/Indianapolis';

-- ---------------------------------------------------------------------------
-- patients
-- ---------------------------------------------------------------------------

create table public.patients (
  id                uuid primary key default gen_random_uuid(),
  first_name        text not null check (char_length(btrim(first_name)) between 1 and 100),
  last_name         text not null check (char_length(btrim(last_name)) between 1 and 100),
  date_of_birth     date not null,
  program           public.program not null,
  weekly_aba_hours  integer not null check (weekly_aba_hours between 0 and 40),
  care_plan_note    text check (char_length(care_plan_note) <= 1000),
  home_center_id    uuid not null references public.centers (id) on delete restrict,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);

create index patients_home_center_id_idx on public.patients (home_center_id);

-- ---------------------------------------------------------------------------
-- guardianships: which guardian can see which child
-- ---------------------------------------------------------------------------

create table public.guardianships (
  guardian_id   uuid not null references public.profiles (id) on delete restrict,
  patient_id    uuid not null references public.patients (id) on delete restrict,
  relationship  text not null check (char_length(btrim(relationship)) between 1 and 50),
  primary key (guardian_id, patient_id)
);

create index guardianships_patient_id_idx on public.guardianships (patient_id);

-- ---------------------------------------------------------------------------
-- providers
-- ---------------------------------------------------------------------------

create table public.providers (
  id            uuid primary key default gen_random_uuid(),
  center_id     uuid not null references public.centers (id) on delete restrict,
  display_name  text not null check (char_length(btrim(display_name)) between 1 and 100),
  discipline    public.discipline not null,
  credential    text check (char_length(credential) <= 20),
  profile_id    uuid unique references public.profiles (id) on delete set null
);

comment on column public.providers.profile_id is
  'Future link to a clinician login. Unused in this version; always null.';

create index providers_center_id_idx on public.providers (center_id);

-- ---------------------------------------------------------------------------
-- provider_hours: each provider's weekly working hours (center local time)
-- ---------------------------------------------------------------------------

create table public.provider_hours (
  provider_id  uuid not null references public.providers (id) on delete restrict,
  weekday      smallint not null check (weekday between 0 and 6),
  starts_at    time not null,
  ends_at      time not null,
  primary key (provider_id, weekday, starts_at),
  check (ends_at > starts_at)
);

comment on column public.provider_hours.weekday is '0 = Sunday, matches extract(dow) and JS getDay()';

-- ---------------------------------------------------------------------------
-- care_team: a child's own BCBA and therapists
-- ---------------------------------------------------------------------------

create table public.care_team (
  patient_id        uuid not null references public.patients (id) on delete restrict,
  provider_id       uuid not null references public.providers (id) on delete restrict,
  schedule_summary  text check (char_length(schedule_summary) <= 200),
  role              text not null check (char_length(btrim(role)) between 1 and 50),
  primary key (patient_id, provider_id)
);

create index care_team_provider_id_idx on public.care_team (provider_id);

-- ---------------------------------------------------------------------------
-- appointment_types: lookup table, only parent training is family bookable
-- ---------------------------------------------------------------------------

create table public.appointment_types (
  code              text primary key check (code ~ '^[a-z][a-z_]{1,39}$'),
  label             text not null check (char_length(btrim(label)) between 1 and 100),
  short_label       text not null check (char_length(btrim(short_label)) between 1 and 30),
  duration_minutes  integer not null check (duration_minutes > 0 and duration_minutes % 15 = 0),
  discipline        public.discipline not null,
  family_bookable   boolean not null default false
);

-- ---------------------------------------------------------------------------
-- appointments
--
-- No center_id here on purpose: the center comes from the provider, so the
-- two can never disagree. Providers belong to one center in this version.
-- If providers move or work at several centers, add provider_centers, put
-- center_id on provider_hours, and store center_id on each appointment as a
-- record of where it happened.
-- ---------------------------------------------------------------------------

create table public.appointments (
  id                 uuid primary key default gen_random_uuid(),
  patient_id         uuid not null references public.patients (id) on delete restrict,
  provider_id        uuid not null references public.providers (id) on delete restrict,
  type               text not null references public.appointment_types (code) on delete restrict,
  starts_at          timestamptz not null,
  ends_at            timestamptz not null,
  status             public.appointment_status not null default 'scheduled',
  notes              text check (char_length(notes) <= 500),
  created_by         uuid references public.profiles (id) on delete set null,
  cancel_reason      text check (char_length(btrim(cancel_reason)) between 1 and 300),
  cancelled_by       uuid references public.profiles (id) on delete set null,
  cancelled_by_kind  public.cancelled_by_kind,
  cancelled_at       timestamptz,
  created_at         timestamptz not null default now(),
  updated_at         timestamptz not null default now(),

  constraint appointments_ends_after_starts check (ends_at > starts_at),

  -- A cancelled appointment must say when, why, and by which side.
  -- Anything else must have no cancel fields set.
  -- cancelled_by stays nullable: a center cancellation may have no login behind it.
  constraint appointments_cancel_fields check (
    (status = 'cancelled'
      and cancelled_at is not null
      and cancel_reason is not null
      and cancelled_by_kind is not null)
    or
    (status <> 'cancelled'
      and cancelled_at is null
      and cancel_reason is null
      and cancelled_by is null
      and cancelled_by_kind is null)
  )
);

create index appointments_patient_starts_idx on public.appointments (patient_id, starts_at);
create index appointments_provider_starts_idx on public.appointments (provider_id, starts_at);

-- ---------------------------------------------------------------------------
-- audit_log: append only. Field names only, never PHI values.
-- ---------------------------------------------------------------------------

create table public.audit_log (
  id              uuid primary key default gen_random_uuid(),
  actor_id        uuid references public.profiles (id) on delete set null,
  action          text not null check (char_length(action) between 1 and 50),
  table_name      text not null check (char_length(table_name) between 1 and 63),
  record_id       uuid not null,
  changed_fields  text[] not null default '{}',
  at              timestamptz not null default now()
);

comment on column public.audit_log.changed_fields is 'Column names only. Never values.';

create index audit_log_record_idx on public.audit_log (table_name, record_id);

-- ---------------------------------------------------------------------------
-- updated_at triggers
-- ---------------------------------------------------------------------------

create trigger profiles_set_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

create trigger patients_set_updated_at
  before update on public.patients
  for each row execute function public.set_updated_at();

create trigger appointments_set_updated_at
  before update on public.appointments
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- RLS on everywhere, zero policies = deny all until #17 adds read policies
-- ---------------------------------------------------------------------------

alter table public.profiles          enable row level security;
alter table public.centers           enable row level security;
alter table public.patients          enable row level security;
alter table public.guardianships     enable row level security;
alter table public.providers         enable row level security;
alter table public.provider_hours    enable row level security;
alter table public.care_team         enable row level security;
alter table public.appointment_types enable row level security;
alter table public.appointments      enable row level security;
alter table public.audit_log         enable row level security;
