/**
 * Turns database errors into the API's answer. book_appointment() raises a
 * short code as its message (see the #18 migration), and each one gets a
 * status and a sentence a parent can act on. Anything unexpected becomes a
 * generic 500, so raw database text never reaches the browser.
 */

export type ApiError = {
  status: 401 | 403 | 409 | 422 | 500;
  code: string;
  message: string;
};

const known: Record<string, Omit<ApiError, "code">> = {
  not_signed_in: {
    status: 401,
    message: "Your session ended. Log in again to keep going.",
  },
  not_your_child: {
    status: 403,
    message:
      "You can't book for this child. Contact your center if something looks wrong.",
  },
  slot_taken: {
    status: 409,
    message: "Someone just booked that time. Pick another one.",
  },
  child_busy: {
    status: 409,
    message: "Your child already has a visit at that time. Pick another one.",
  },
  not_family_bookable: {
    status: 422,
    message:
      "Only parent training can be booked here. Therapy times are set by your care team.",
  },
  in_past: {
    status: 422,
    message: "That time has already passed. Pick a later one.",
  },
  too_far_ahead: {
    status: 422,
    message: "You can book up to 60 days ahead. Pick an earlier date.",
  },
  wrong_center: {
    status: 422,
    message: "That provider isn't at your child's center.",
  },
  wrong_provider: {
    status: 422,
    message: "That provider doesn't offer parent training.",
  },
  not_slot_aligned: {
    status: 422,
    message: "Visits start on the hour or half hour.",
  },
  outside_hours: {
    status: 422,
    message: "That time is outside the provider's hours.",
  },
  notes_too_long: {
    status: 422,
    message: "Notes can be up to 500 characters.",
  },
  window_too_large: {
    status: 422,
    message: "Pick a shorter date range.",
  },
};

const generic: ApiError = {
  status: 500,
  code: "server_error",
  message: "Something went wrong on our end. Nothing was booked. Try again.",
};

/** Accepts a Supabase/PostgREST error ({ code, message }) or anything else. */
export function toApiError(error: unknown): ApiError {
  if (error && typeof error === "object" && "message" in error) {
    const code = String((error as { message: unknown }).message);
    const match = known[code];
    if (match) return { code, ...match };
    // Permission denied without our own code: treat as not allowed.
    if ((error as { code?: unknown }).code === "42501") {
      return {
        code: "forbidden",
        status: 403,
        message: known.not_your_child!.message,
      };
    }
  }
  return generic;
}

/** 422 for input that failed the Zod schema. */
export const invalidInput: ApiError = {
  status: 422,
  code: "invalid_input",
  message:
    "Some details were missing or not valid. Check the form and try again.",
};
