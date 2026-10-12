/**
 * Seed data and demo logins (#20).
 *
 * Run from your machine only:  pnpm seed
 * Needs .env.local (project URL) and .env.seed (secret key + demo password).
 * The secret key bypasses RLS, so it never goes in the app, Vercel, or git.
 *
 * Safe to re-run: reference rows are upserted, demo users are reused, and
 * appointments are regenerated relative to today so the demo stays current.
 * All names and data are fake.
 */
import { createClient } from "@supabase/supabase-js";
import type { Database } from "../lib/database.types";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const secretKey = process.env.SUPABASE_SECRET_KEY;
const demoPassword = process.env.DEMO_PASSWORD;

if (!url || !secretKey || !demoPassword) {
  throw new Error(
    "Missing NEXT_PUBLIC_SUPABASE_URL (.env.local), or SUPABASE_SECRET_KEY / DEMO_PASSWORD (.env.seed)",
  );
}

const db = createClient<Database>(url, secretKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const TZ = "America/Indiana/Indianapolis";

// Fixed ids so re-runs update instead of duplicating.
const ID = {
  center: "10000000-0000-4000-8000-000000000001",
  taylor: "20000000-0000-4000-8000-000000000001",
  priya: "20000000-0000-4000-8000-000000000002",
  sam: "20000000-0000-4000-8000-000000000003",
  morgan: "20000000-0000-4000-8000-000000000004",
  dana: "20000000-0000-4000-8000-000000000005",
  riley: "20000000-0000-4000-8000-000000000006",
  maya: "30000000-0000-4000-8000-000000000001",
  leo: "30000000-0000-4000-8000-000000000002",
  ava: "30000000-0000-4000-8000-000000000003",
} as const;

// ---------------------------------------------------------------------------
// Time helpers: build a UTC instant from a center-local date and time.
// ---------------------------------------------------------------------------

function tzOffsetMs(instant: Date, timeZone: string): number {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone,
    hourCycle: "h23",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  }).formatToParts(instant);
  const get = (type: string) =>
    Number(parts.find((p) => p.type === type)?.value);
  const asUtc = Date.UTC(
    get("year"),
    get("month") - 1,
    get("day"),
    get("hour"),
    get("minute"),
    get("second"),
  );
  return asUtc - instant.getTime();
}

/** Center-local wall time on a given local calendar day, as a UTC Date. */
function localTime(
  day: { y: number; m: number; d: number },
  hhmm: string,
): Date {
  const [h, min] = hhmm.split(":").map(Number);
  const guess = Date.UTC(day.y, day.m - 1, day.d, h ?? 0, min ?? 0);
  return new Date(guess - tzOffsetMs(new Date(guess), TZ));
}

/** Today's date in the center's time zone, shifted by `offsetDays`. */
function localDay(offsetDays: number) {
  const now = new Date(Date.now() + offsetDays * 86_400_000);
  const [y, m, d] = new Intl.DateTimeFormat("en-CA", { timeZone: TZ })
    .format(now)
    .split("-")
    .map(Number);
  return {
    y: y!,
    m: m!,
    d: d!,
    weekday: new Date(Date.UTC(y!, m! - 1, d!)).getUTCDay(),
  };
}

// ---------------------------------------------------------------------------
// Reference data
// ---------------------------------------------------------------------------

async function seedReference() {
  await must(
    db.from("centers").upsert({
      id: ID.center,
      name: "Westfield center",
      address: "16414 Southpark Dr",
      city: "Westfield",
      state: "IN",
      postal_code: "46074",
      phone: "(317) 678-0945",
      timezone: TZ,
    }),
  );

  await must(
    db.from("providers").upsert([
      {
        id: ID.taylor,
        center_id: ID.center,
        display_name: "Taylor Brooks",
        discipline: "aba",
        credential: "BCBA",
      },
      {
        id: ID.priya,
        center_id: ID.center,
        display_name: "Priya Shah",
        discipline: "aba",
        credential: "BCBA",
      },
      {
        id: ID.sam,
        center_id: ID.center,
        display_name: "Sam Patel",
        discipline: "aba",
        credential: "BCBA",
      },
      {
        id: ID.morgan,
        center_id: ID.center,
        display_name: "Morgan Hayes",
        discipline: "aba",
        credential: "BCBA",
      },
      {
        id: ID.dana,
        center_id: ID.center,
        display_name: "Dana Kim",
        discipline: "speech",
        credential: "SLP",
      },
      {
        id: ID.riley,
        center_id: ID.center,
        display_name: "Riley Ortiz",
        discipline: "ot",
        credential: "OTR/L",
      },
    ]),
  );

  // Parent training hours for the four BCBAs (weekday 0 = Sunday).
  const hours = [
    {
      provider_id: ID.taylor,
      days: [2, 4],
      starts_at: "09:00",
      ends_at: "12:00",
    },
    {
      provider_id: ID.priya,
      days: [1, 3],
      starts_at: "16:00",
      ends_at: "19:00",
    },
    {
      provider_id: ID.sam,
      days: [1, 3, 5],
      starts_at: "14:30",
      ends_at: "17:00",
    },
    {
      provider_id: ID.morgan,
      days: [2, 4],
      starts_at: "08:00",
      ends_at: "10:00",
    },
  ].flatMap(({ days, ...rest }) =>
    days.map((weekday) => ({ ...rest, weekday })),
  );
  await must(db.from("provider_hours").upsert(hours));

  await must(
    db.from("appointment_types").upsert([
      {
        code: "parent_training",
        label: "Parent training",
        short_label: "Parent training",
        duration_minutes: 60,
        discipline: "aba",
        family_bookable: true,
      },
      {
        code: "aba_session",
        label: "ABA session",
        short_label: "ABA",
        duration_minutes: 120,
        discipline: "aba",
        family_bookable: false,
      },
      {
        code: "speech_session",
        label: "Speech therapy",
        short_label: "Speech",
        duration_minutes: 45,
        discipline: "speech",
        family_bookable: false,
      },
      {
        code: "ot_session",
        label: "Occupational therapy",
        short_label: "OT",
        duration_minutes: 45,
        discipline: "ot",
        family_bookable: false,
      },
    ]),
  );

  // Birthdays chosen so Maya is 7, Leo is 3, Ava is 5.
  await must(
    db.from("patients").upsert([
      {
        id: ID.maya,
        first_name: "Maya",
        last_name: "Rivera",
        date_of_birth: "2019-03-14",
        program: "focused_aba",
        weekly_aba_hours: 6,
        home_center_id: ID.center,
        care_plan_note: "After school, since Maya is in first grade.",
      },
      {
        id: ID.leo,
        first_name: "Leo",
        last_name: "Rivera",
        date_of_birth: "2023-05-02",
        program: "comprehensive_aba",
        weekly_aba_hours: 25,
        home_center_id: ID.center,
        care_plan_note:
          "Full days at the center, the usual early intervention schedule.",
      },
      {
        id: ID.ava,
        first_name: "Ava",
        last_name: "Nguyen",
        date_of_birth: "2021-01-20",
        program: "focused_aba",
        weekly_aba_hours: 6,
        home_center_id: ID.center,
        care_plan_note: "Two mornings a week before preschool.",
      },
    ]),
  );

  await must(
    db.from("care_team").upsert([
      {
        patient_id: ID.maya,
        provider_id: ID.taylor,
        role: "BCBA",
        schedule_summary: "Mon, Wed, Thu after school",
      },
      {
        patient_id: ID.maya,
        provider_id: ID.dana,
        role: "Speech therapist",
        schedule_summary: "Tuesdays with Dana Kim, SLP",
      },
      {
        patient_id: ID.leo,
        provider_id: ID.sam,
        role: "BCBA",
        schedule_summary: "Weekdays, 9:00 AM to 2:00 PM",
      },
      {
        patient_id: ID.leo,
        provider_id: ID.riley,
        role: "Occupational therapist",
        schedule_summary: "Wednesdays with Riley Ortiz",
      },
      {
        patient_id: ID.ava,
        provider_id: ID.morgan,
        role: "BCBA",
        schedule_summary: "Tue and Thu mornings",
      },
    ]),
  );
}

// ---------------------------------------------------------------------------
// Demo users
// ---------------------------------------------------------------------------

async function ensureUser(email: string, fullName: string): Promise<string> {
  const { data, error } = await db.auth.admin.listUsers({ perPage: 1000 });
  if (error) throw error;
  const existing = data.users.find((u) => u.email === email);
  if (existing) {
    // Keep the password in sync with .env.seed.
    const { error: updateError } = await db.auth.admin.updateUserById(
      existing.id,
      { password: demoPassword },
    );
    if (updateError) throw updateError;
    return existing.id;
  }
  const { data: created, error: createError } = await db.auth.admin.createUser({
    email,
    password: demoPassword,
    email_confirm: true,
    user_metadata: { full_name: fullName },
  });
  if (createError) throw createError;
  return created.user.id;
}

// ---------------------------------------------------------------------------
// Appointments: weekly care-team schedule, two weeks back to six weeks ahead
// ---------------------------------------------------------------------------

type Weekly = {
  patient_id: string;
  provider_id: string;
  type: string;
  days: number[];
  start: string;
  end: string;
};

const SCHEDULE: Weekly[] = [
  {
    patient_id: ID.maya,
    provider_id: ID.taylor,
    type: "aba_session",
    days: [1, 3, 4],
    start: "15:30",
    end: "17:30",
  },
  {
    patient_id: ID.maya,
    provider_id: ID.dana,
    type: "speech_session",
    days: [2],
    start: "16:00",
    end: "16:45",
  },
  {
    patient_id: ID.leo,
    provider_id: ID.sam,
    type: "aba_session",
    days: [1, 2, 3, 4, 5],
    start: "09:00",
    end: "14:00",
  },
  {
    patient_id: ID.leo,
    provider_id: ID.riley,
    type: "ot_session",
    days: [3],
    start: "14:15",
    end: "15:00",
  },
  {
    patient_id: ID.ava,
    provider_id: ID.morgan,
    type: "aba_session",
    days: [2, 4],
    start: "10:00",
    end: "13:00",
  },
];

async function seedAppointments(jordanId: string) {
  const patientIds = [ID.maya, ID.leo, ID.ava];
  await must(db.from("appointments").delete().in("patient_id", patientIds));

  const now = Date.now();
  type Row = Database["public"]["Tables"]["appointments"]["Insert"];
  const rows: Row[] = [];

  for (let offset = -14; offset <= 42; offset++) {
    const day = localDay(offset);
    for (const s of SCHEDULE) {
      if (!s.days.includes(day.weekday)) continue;
      const startsAt = localTime(day, s.start);
      const endsAt = localTime(day, s.end);
      rows.push({
        patient_id: s.patient_id,
        provider_id: s.provider_id,
        type: s.type,
        starts_at: startsAt.toISOString(),
        ends_at: endsAt.toISOString(),
        status: endsAt.getTime() < now ? "completed" : "scheduled",
      });
    }
  }

  // One past Leo session cancelled by the center.
  const cancelled = rows
    .filter(
      (r) =>
        r.patient_id === ID.leo &&
        r.type === "aba_session" &&
        r.status === "completed",
    )
    .at(-2);
  if (cancelled) {
    Object.assign(cancelled, {
      status: "cancelled",
      cancelled_at: new Date(
        new Date(cancelled.starts_at).getTime() - 3 * 3_600_000,
      ).toISOString(),
      cancel_reason: "Staff illness. The center will reach out to reschedule.",
      cancelled_by_kind: "center",
    });
  }

  // One booked parent training: Maya with Taylor, next Thursday 10:00 to 11:00.
  let offset = 1;
  while (localDay(offset).weekday !== 4) offset++;
  const thursday = localDay(offset);
  rows.push({
    patient_id: ID.maya,
    provider_id: ID.taylor,
    type: "parent_training",
    starts_at: localTime(thursday, "10:00").toISOString(),
    ends_at: localTime(thursday, "11:00").toISOString(),
    status: "scheduled",
    notes: "Bedtime routine ideas.",
    created_by: jordanId,
  });

  await must(db.from("appointments").insert(rows));
  return rows.length;
}

// ---------------------------------------------------------------------------

async function must<T extends { error: unknown }>(
  query: PromiseLike<T>,
): Promise<T> {
  const result = await query;
  if (result.error) throw result.error;
  return result;
}

async function main() {
  await seedReference();

  const jordan = await ensureUser("jordan@example.com", "Jordan Rivera");
  const casey = await ensureUser("casey@example.com", "Casey Nguyen");
  await ensureUser("jamie@example.com", "Jamie Park"); // no children: empty state

  await must(
    db.from("guardianships").upsert([
      { guardian_id: jordan, patient_id: ID.maya, relationship: "Parent" },
      { guardian_id: jordan, patient_id: ID.leo, relationship: "Parent" },
      { guardian_id: casey, patient_id: ID.ava, relationship: "Parent" },
    ]),
  );

  const count = await seedAppointments(jordan);
  console.log(
    `Seeded: 1 center, 6 providers, 3 children, 3 demo logins, ${count} appointments.`,
  );
}

main().catch((error: unknown) => {
  console.error(error);
  process.exit(1);
});
