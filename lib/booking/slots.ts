import type { SlotOption } from "@/components/ui/TimeSlots";
import { formatClock, localToUtc, weekdayOfKey } from "@/lib/time";

export type HoursRow = {
  /** 0 = Sunday */
  weekday: number;
  /** Center wall clock, "09:00:00" */
  startsAt: string;
  endsAt: string;
};

export type BusyTime = { startsAt: string; endsAt: string };

/** Visits start on the hour or half hour, like book_appointment() checks. */
const STEP_MINUTES = 30;

function toMinutes(hhmm: string) {
  const [h = 0, m = 0] = hhmm.split(":").map(Number);
  return h * 60 + m;
}

function toHhmm(minutes: number) {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

/**
 * Every start time on one day that fits inside the provider's hours. Times
 * that overlap a busy time are kept and marked taken, so the parent sees
 * why their usual time is missing. Past times and times beyond the booking
 * window are left out.
 */
export function slotsForDay({
  dayKey,
  hours,
  busy,
  timezone,
  durationMinutes,
  nowIso,
  latestIso,
}: {
  dayKey: string;
  hours: HoursRow[];
  busy: BusyTime[];
  timezone: string;
  durationMinutes: number;
  nowIso: string;
  latestIso: string;
}): SlotOption[] {
  const weekday = weekdayOfKey(dayKey);
  const now = Date.parse(nowIso);
  const latest = Date.parse(latestIso);
  const slots: SlotOption[] = [];

  for (const row of hours.filter((h) => h.weekday === weekday)) {
    const close = toMinutes(row.endsAt);
    for (
      let start = toMinutes(row.startsAt);
      start + durationMinutes <= close;
      start += STEP_MINUTES
    ) {
      const startsAt = localToUtc(dayKey, toHhmm(start), timezone);
      const begin = Date.parse(startsAt);
      if (begin <= now || begin > latest) continue;
      const end = begin + durationMinutes * 60_000;
      const taken = busy.some(
        (b) => Date.parse(b.startsAt) < end && Date.parse(b.endsAt) > begin,
      );
      slots.push({
        value: startsAt,
        label: formatClock(startsAt, timezone),
        taken,
      });
    }
  }

  return slots.sort((a, b) => a.value.localeCompare(b.value));
}

/** True when the provider has no hours on that weekday at all. */
export function isOffDay(dayKey: string, hours: HoursRow[]) {
  const weekday = weekdayOfKey(dayKey);
  return !hours.some((h) => h.weekday === weekday);
}
