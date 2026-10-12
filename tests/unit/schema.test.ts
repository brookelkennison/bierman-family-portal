import { describe, expect, it } from "vitest";
import { bookingInput, listQuery } from "@/lib/booking/schema";

const valid = {
  patientId: "30000000-0000-4000-8000-000000000001",
  providerId: "20000000-0000-4000-8000-000000000001",
  startsAt: "2026-10-22T10:00:00-04:00",
};

describe("bookingInput", () => {
  it("accepts a normal booking", () => {
    expect(bookingInput.safeParse(valid).success).toBe(true);
  });

  it("trims notes and drops empty ones", () => {
    expect(bookingInput.parse({ ...valid, notes: "  bedtime  " }).notes).toBe(
      "bedtime",
    );
    expect(
      bookingInput.parse({ ...valid, notes: "   " }).notes,
    ).toBeUndefined();
  });

  it("rejects notes over 500 characters", () => {
    expect(
      bookingInput.safeParse({ ...valid, notes: "x".repeat(501) }).success,
    ).toBe(false);
  });

  it("rejects ids that aren't UUIDs", () => {
    expect(
      bookingInput.safeParse({ ...valid, patientId: "maya" }).success,
    ).toBe(false);
  });

  it("rejects times without a zone offset", () => {
    expect(
      bookingInput.safeParse({ ...valid, startsAt: "2026-10-22T10:00:00" })
        .success,
    ).toBe(false);
  });

  it("rejects a missing provider", () => {
    expect(
      bookingInput.safeParse({ ...valid, providerId: undefined }).success,
    ).toBe(false);
  });
});

describe("listQuery", () => {
  it("accepts no filters", () => {
    expect(listQuery.safeParse({}).success).toBe(true);
  });

  it("rejects a range that ends before it starts", () => {
    expect(
      listQuery.safeParse({
        from: "2026-10-22T00:00:00Z",
        to: "2026-10-01T00:00:00Z",
      }).success,
    ).toBe(false);
  });
});
