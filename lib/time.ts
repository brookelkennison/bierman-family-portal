/**
 * Every time in the app is shown in the center's time zone, with the zone
 * label (EDT/EST). Never the browser's or the server's zone: Vercel runs in
 * UTC, and a parent traveling should still see the center's time.
 */

function parts(
  iso: string,
  timeZone: string,
  options: Intl.DateTimeFormatOptions,
) {
  return new Intl.DateTimeFormat("en-US", {
    timeZone,
    ...options,
  }).formatToParts(new Date(iso));
}

function part(
  list: Intl.DateTimeFormatPart[],
  type: Intl.DateTimeFormatPartTypes,
) {
  return list.find((p) => p.type === type)?.value ?? "";
}

/** "9:00 AM to 2:00 PM EDT", or "10:00 to 11:00 AM EDT" when both are AM or PM. */
export function formatTimeRange(
  startIso: string,
  endIso: string,
  timeZone: string,
) {
  const opts: Intl.DateTimeFormatOptions = {
    hour: "numeric",
    minute: "2-digit",
    timeZoneName: "short",
  };
  const start = parts(startIso, timeZone, opts);
  const end = parts(endIso, timeZone, opts);
  const clock = (p: Intl.DateTimeFormatPart[]) =>
    `${part(p, "hour")}:${part(p, "minute")}`;
  const startPeriod = part(start, "dayPeriod");
  const endPeriod = part(end, "dayPeriod");
  const zone = part(end, "timeZoneName");
  return startPeriod === endPeriod
    ? `${clock(start)} to ${clock(end)} ${endPeriod} ${zone}`
    : `${clock(start)} ${startPeriod} to ${clock(end)} ${endPeriod} ${zone}`;
}

/** Same as formatTimeRange without the zone, for tight spots like the week strip. */
export function formatTimeRangeShort(
  startIso: string,
  endIso: string,
  timeZone: string,
) {
  return formatTimeRange(startIso, endIso, timeZone).replace(/\s+\S+$/, "");
}

/** { weekday: "Thu", day: "8", month: "Oct" } for the date tile. */
export function dateTile(iso: string, timeZone: string) {
  const p = parts(iso, timeZone, {
    weekday: "short",
    day: "numeric",
    month: "short",
  });
  return {
    weekday: part(p, "weekday"),
    day: part(p, "day"),
    month: part(p, "month"),
  };
}

/** "Thursday, October 8" */
export function formatLongDate(iso: string, timeZone: string) {
  return new Intl.DateTimeFormat("en-US", {
    timeZone,
    weekday: "long",
    month: "long",
    day: "numeric",
  }).format(new Date(iso));
}

/** "Thu, Oct 22" */
export function formatShortDate(iso: string, timeZone: string) {
  return new Intl.DateTimeFormat("en-US", {
    timeZone,
    weekday: "short",
    month: "short",
    day: "numeric",
  }).format(new Date(iso));
}

/** Calendar day key like "2026-10-08" in the center's zone, for grouping. */
export function dayKey(iso: string, timeZone: string) {
  return new Intl.DateTimeFormat("en-CA", { timeZone }).format(new Date(iso));
}

/** "morning" | "afternoon" | "evening" at the center right now. */
export function partOfDay(nowIso: string, timeZone: string) {
  const hour = Number(
    parts(nowIso, timeZone, { hour: "numeric", hourCycle: "h23" }).find(
      (p) => p.type === "hour",
    )?.value,
  );
  if (hour < 12) return "morning";
  if (hour < 17) return "afternoon";
  return "evening";
}

/** Whole years between a birth date and today. */
export function ageInYears(dateOfBirth: string, nowIso: string) {
  const [y, m, d] = dateOfBirth.split("-").map(Number);
  const now = new Date(nowIso);
  let age = now.getUTCFullYear() - (y ?? 0);
  const beforeBirthday =
    now.getUTCMonth() + 1 < (m ?? 1) ||
    (now.getUTCMonth() + 1 === m && now.getUTCDate() < (d ?? 1));
  if (beforeBirthday) age -= 1;
  return age;
}

/*
 * Day-key math for the week strip. Keys are "YYYY-MM-DD" calendar days that
 * were already worked out in the center's zone, so plain UTC math on them is
 * safe (no daylight-saving surprises).
 */
function keyDate(key: string) {
  return new Date(`${key}T12:00:00Z`);
}

/** "2026-10-12" plus 3 days is "2026-10-15". */
export function addDays(key: string, days: number) {
  const d = keyDate(key);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

/** The Monday after the given day. On a Monday, that's next week's Monday. */
export function nextMonday(key: string) {
  const weekday = keyDate(key).getUTCDay(); // 0 is Sunday
  return addDays(key, (8 - weekday) % 7 || 7);
}

/** Labels for a day key: { weekday: "Mon", date: "Oct 12" }. */
export function dayKeyLabels(key: string) {
  const d = keyDate(key);
  const fmt = (o: Intl.DateTimeFormatOptions) =>
    new Intl.DateTimeFormat("en-US", { timeZone: "UTC", ...o }).format(d);
  return {
    weekday: fmt({ weekday: "short" }),
    longWeekday: fmt({ weekday: "long" }),
    date: fmt({ month: "short", day: "numeric" }),
  };
}

/** "Eastern Time" for America/Indiana/Indianapolis. */
export function zoneName(timeZone: string, nowIso: string) {
  return part(
    parts(nowIso, timeZone, { timeZoneName: "longGeneric" }),
    "timeZoneName",
  );
}
