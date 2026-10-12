import { describe, expect, it } from "vitest";
import { isOffDay, slotsForDay } from "@/lib/booking/slots";
import { localToUtc } from "@/lib/time";

const TZ = "America/Indiana/Indianapolis";
const tuesdayHours = [{ weekday: 2, startsAt: "09:00:00", endsAt: "12:00:00" }];
const base = {
  hours: tuesdayHours,
  busy: [],
  timezone: TZ,
  durationMinutes: 60,
  nowIso: "2026-10-12T12:00:00Z",
  latestIso: "2026-12-11T12:00:00Z",
};

describe("localToUtc", () => {
  it("uses EDT before Nov 1 and EST after", () => {
    expect(localToUtc("2026-10-27", "10:00", TZ)).toBe(
      "2026-10-27T14:00:00.000Z",
    );
    expect(localToUtc("2026-11-03", "10:00", TZ)).toBe(
      "2026-11-03T15:00:00.000Z",
    );
  });
});

describe("slotsForDay", () => {
  it("offers every half hour that fits a 60 minute visit", () => {
    const slots = slotsForDay({ ...base, dayKey: "2026-10-27" });
    expect(slots.map((s) => s.label)).toEqual([
      "9:00 AM",
      "9:30 AM",
      "10:00 AM",
      "10:30 AM",
      "11:00 AM",
    ]);
  });

  it("marks times that overlap a busy time as taken", () => {
    const slots = slotsForDay({
      ...base,
      dayKey: "2026-10-27",
      busy: [
        { startsAt: "2026-10-27T14:00:00Z", endsAt: "2026-10-27T15:00:00Z" },
      ],
    });
    const taken = slots.filter((s) => s.taken).map((s) => s.label);
    expect(taken).toEqual(["9:30 AM", "10:00 AM", "10:30 AM"]);
  });

  it("keeps the same wall-clock times after the clocks change", () => {
    const slots = slotsForDay({ ...base, dayKey: "2026-11-03" });
    expect(slots[0]).toMatchObject({
      label: "9:00 AM",
      value: "2026-11-03T14:00:00.000Z",
    });
  });

  it("leaves out times that already passed", () => {
    const slots = slotsForDay({
      ...base,
      dayKey: "2026-10-27",
      nowIso: "2026-10-27T14:15:00Z", // 10:15 AM EDT
    });
    expect(slots.map((s) => s.label)).toEqual(["10:30 AM", "11:00 AM"]);
  });

  it("leaves out times past the booking window", () => {
    expect(
      slotsForDay({
        ...base,
        dayKey: "2026-12-15",
        latestIso: "2026-12-11T12:00:00Z",
      }),
    ).toEqual([]);
  });

  it("returns nothing on a day the provider is off", () => {
    expect(slotsForDay({ ...base, dayKey: "2026-10-26" })).toEqual([]);
    expect(isOffDay("2026-10-26", tuesdayHours)).toBe(true);
    expect(isOffDay("2026-10-27", tuesdayHours)).toBe(false);
  });
});
