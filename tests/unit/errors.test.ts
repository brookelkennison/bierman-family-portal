import { describe, expect, it } from "vitest";
import { toApiError } from "@/lib/booking/errors";

describe("toApiError", () => {
  it("maps a taken slot to 409", () => {
    expect(toApiError({ code: "23P01", message: "slot_taken" })).toMatchObject({
      status: 409,
      code: "slot_taken",
    });
  });

  it("maps a busy child to 409", () => {
    expect(toApiError({ code: "23P01", message: "child_busy" }).status).toBe(
      409,
    );
  });

  it("maps another family's child to 403", () => {
    expect(
      toApiError({ code: "42501", message: "not_your_child" }).status,
    ).toBe(403);
  });

  it("maps rule failures to 422", () => {
    for (const code of [
      "in_past",
      "too_far_ahead",
      "outside_hours",
      "not_slot_aligned",
    ]) {
      expect(toApiError({ code: "22023", message: code }).status).toBe(422);
    }
  });

  it("treats a bare permission error as 403", () => {
    expect(
      toApiError({
        code: "42501",
        message: "permission denied for table appointments",
      }).status,
    ).toBe(403);
  });

  it("never leaks unknown database text", () => {
    const result = toApiError({
      code: "XX000",
      message: "relation secret_table does not exist",
    });
    expect(result.status).toBe(500);
    expect(result.message).not.toContain("secret_table");
  });

  it("handles things that aren't errors at all", () => {
    expect(toApiError(undefined).status).toBe(500);
  });
});
