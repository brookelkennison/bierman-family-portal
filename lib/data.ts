import { createClient } from "@/lib/supabase/server";
import type { Database } from "@/lib/database.types";
import { ageInYears } from "@/lib/time";

type Enums = Database["public"]["Enums"];

export type Center = {
  id: string;
  name: string;
  address: string;
  city: string;
  state: string;
  postalCode: string;
  phone: string;
  timezone: string;
};

export type Child = {
  id: string;
  firstName: string;
  age: number;
  program: Enums["program"];
  weeklyAbaHours: number;
  carePlanNote: string | null;
  center: Center;
};

/** Who put this on the calendar, for the badge. */
export type BookedBy = "careTeam" | "you" | "otherCaregiver";

export type Appointment = {
  id: string;
  childId: string;
  childFirstName: string;
  title: string;
  shortLabel: string;
  startsAt: string;
  endsAt: string;
  status: Enums["appointment_status"];
  cancelledByKind: Enums["cancelled_by_kind"] | null;
  bookedBy: BookedBy;
  provider: string;
  timezone: string;
};

export type FamilyData = {
  kids: Child[];
  appointments: Appointment[];
};

/**
 * Everything the dashboard needs for the logged-in parent. Every query runs
 * as that parent with RLS on, so it can only ever return their own children
 * and their appointments, even if this code had a bug.
 */
export async function getFamilyData(parentId: string): Promise<FamilyData> {
  const supabase = await createClient();

  const { data: patients, error: patientsError } = await supabase
    .from("patients")
    .select(
      "id, first_name, date_of_birth, program, weekly_aba_hours, care_plan_note, center:centers(id, name, address, city, state, postal_code, phone, timezone)",
    )
    .order("date_of_birth", { ascending: true });
  if (patientsError) throw patientsError;

  const nowIso = new Date().toISOString();
  const kids: Child[] = (patients ?? []).map((p) => ({
    id: p.id,
    firstName: p.first_name,
    age: ageInYears(p.date_of_birth, nowIso),
    program: p.program,
    weeklyAbaHours: p.weekly_aba_hours,
    carePlanNote: p.care_plan_note,
    center: {
      id: p.center.id,
      name: p.center.name,
      address: p.center.address,
      city: p.center.city,
      state: p.center.state,
      postalCode: p.center.postal_code,
      phone: p.center.phone,
      timezone: p.center.timezone,
    },
  }));
  if (kids.length === 0) return { kids, appointments: [] };

  // A window around today: recent history for "Past", plenty ahead for "Upcoming".
  const from = new Date(Date.now() - 30 * 86_400_000).toISOString();
  const to = new Date(Date.now() + 60 * 86_400_000).toISOString();

  const { data: rows, error: apptError } = await supabase
    .from("appointments")
    .select(
      "id, patient_id, starts_at, ends_at, status, cancelled_by_kind, created_by, kind:appointment_types(label, short_label, family_bookable), provider:providers(display_name, credential, center:centers(timezone))",
    )
    .gte("starts_at", from)
    .lte("starts_at", to)
    .order("starts_at", { ascending: true });
  if (apptError) throw apptError;

  const firstNameById = new Map(kids.map((c) => [c.id, c.firstName]));

  const appointments: Appointment[] = (rows ?? []).map((a) => ({
    id: a.id,
    childId: a.patient_id,
    childFirstName: firstNameById.get(a.patient_id) ?? "your child",
    title: a.kind.label,
    shortLabel: a.kind.short_label,
    startsAt: a.starts_at,
    endsAt: a.ends_at,
    status: a.status,
    cancelledByKind: a.cancelled_by_kind,
    // Parents can't read other profiles, so a co-parent's booking is only
    // known as "not you".
    bookedBy: !a.kind.family_bookable
      ? "careTeam"
      : a.created_by === parentId
        ? "you"
        : "otherCaregiver",
    provider: [a.provider.display_name, a.provider.credential]
      .filter(Boolean)
      .join(", "),
    timezone: a.provider.center.timezone,
  }));

  return { kids, appointments };
}
