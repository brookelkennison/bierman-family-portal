import { describe, expect, it } from "vitest";
import {
  addDays,
  dayKey,
  formatTimeRange,
  nextMonday,
  zoneName,
} from "@/lib/time";

const TZ = "America/Indiana/Indianapolis";

// Clocks fall back at 2:00 AM EDT on Sunday, Nov 1, 2026 (06:00 UTC).
describe("time zones across the Nov 1, 2026 change", () => {
  it("shows EDT the week before", () => {
    // Fri Oct 30, 10:00 to 11:00 AM EDT = 14:00 to 15:00 UTC
    expect(
      formatTimeRange("2026-10-30T14:00:00Z", "2026-10-30T15:00:00Z", TZ),
    ).toBe("10:00 to 11:00 AM EDT");
  });

  it("shows EST the week after, for the same wall-clock time", () => {
    // Mon Nov 2, 10:00 to 11:00 AM EST = 15:00 to 16:00 UTC
    expect(
      formatTimeRange("2026-11-02T15:00:00Z", "2026-11-02T16:00:00Z", TZ),
    ).toBe("10:00 to 11:00 AM EST");
  });

  it("keeps the center's calendar day, not UTC's", () => {
    // 11:30 PM EST on Nov 2 is already Nov 3 in UTC.
    expect(dayKey("2026-11-03T04:30:00Z", TZ)).toBe("2026-11-02");
    // 11:30 PM EDT on Oct 30 is already Oct 31 in UTC.
    expect(dayKey("2026-10-31T03:30:00Z", TZ)).toBe("2026-10-30");
  });

  it("adds days across the change without drifting", () => {
    expect(addDays("2026-10-30", 3)).toBe("2026-11-02");
    expect(nextMonday("2026-10-30")).toBe("2026-11-02");
  });

  it("gives screen readers the full zone name", () => {
    expect(zoneName(TZ, "2026-10-30T14:00:00Z")).toBe("Eastern Time");
    expect(zoneName(TZ, "2026-11-02T15:00:00Z")).toBe("Eastern Time");
  });
});
