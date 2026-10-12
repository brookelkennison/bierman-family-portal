import { getFamilyData, type Child } from "@/lib/data";
import { createClient } from "@/lib/supabase/server";
import type { BusyTime, HoursRow } from "./slots";

export type BookableProvider = {
  id: string;
  name: string;
  credential: string | null;
  centerId: string;
  hours: HoursRow[];
  busy: BusyTime[];
};

export type BookingData = {
  kids: Child[];
  providers: BookableProvider[];
  durationMinutes: number;
  /** Each child's own upcoming visits, so we don't offer a time they're busy. */
  childBusy: Record<string, BusyTime[]>;
  nowIso: string;
  /** Matches book_appointment()'s 60-day limit. */
  latestIso: string;
};

const BOOKING_WINDOW_DAYS = 60;

/**
 * Everything /book needs, loaded once on the server as the signed-in parent.
 * Busy times come from provider_busy_times(), which returns start and end
 * only, never who the other visit is for.
 */
export async function getBookingData(parentId: string): Promise<BookingData> {
  const supabase = await createClient();
  const nowIso = new Date().toISOString();
  const latestIso = new Date(
    Date.now() + BOOKING_WINDOW_DAYS * 86_400_000,
  ).toISOString();

  const family = await getFamilyData(parentId);
  const centerIds = [...new Set(family.kids.map((k) => k.center.id))];

  const childBusy: Record<string, BusyTime[]> = {};
  for (const a of family.appointments) {
    if (a.status !== "scheduled" || a.endsAt < nowIso) continue;
    (childBusy[a.childId] ??= []).push({
      startsAt: a.startsAt,
      endsAt: a.endsAt,
    });
  }

  if (centerIds.length === 0) {
    return {
      kids: [],
      providers: [],
      durationMinutes: 60,
      childBusy,
      nowIso,
      latestIso,
    };
  }

  const [
    { data: type, error: typeError },
    { data: rows, error: providerError },
  ] = await Promise.all([
    supabase
      .from("appointment_types")
      .select("duration_minutes")
      .eq("code", "parent_training")
      .single(),
    supabase
      .from("providers")
      .select(
        "id, display_name, credential, center_id, hours:provider_hours(weekday, starts_at, ends_at)",
      )
      .eq("discipline", "aba")
      .in("center_id", centerIds)
      .order("display_name"),
  ]);
  if (typeError) throw typeError;
  if (providerError) throw providerError;

  const providers = await Promise.all(
    (rows ?? []).map(async (p): Promise<BookableProvider> => {
      const { data: busy, error } = await supabase.rpc("provider_busy_times", {
        p_provider_id: p.id,
        p_from: nowIso,
        p_to: latestIso,
      });
      if (error) throw error;
      return {
        id: p.id,
        name: p.display_name,
        credential: p.credential,
        centerId: p.center_id,
        hours: p.hours.map((h) => ({
          weekday: h.weekday,
          startsAt: h.starts_at,
          endsAt: h.ends_at,
        })),
        busy: (busy ?? []).map((b) => ({
          startsAt: b.starts_at,
          endsAt: b.ends_at,
        })),
      };
    }),
  );

  return {
    kids: family.kids,
    providers,
    durationMinutes: type.duration_minutes,
    childBusy,
    nowIso,
    latestIso,
  };
}
