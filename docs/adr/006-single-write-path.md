[README](../../README.md) › [Docs](../README.md) › ADR 006

# ADR 006: One write path per table

**Status:** Accepted

## Context

RLS answers "which rows," not "is this a valid booking." An insert policy can't easily check provider hours, slot alignment, or overlaps across other families' rows it can't see.

## Decision

Revoke `INSERT`, `UPDATE`, and `DELETE` on `appointments`, `patients`, and `guardianships` from `anon` and `authenticated`. Writes go through `security definer` functions callable only by `authenticated`. `book_appointment()` is the one built for this scope; reschedule, cancel, and delete would follow the same pattern.

## Consequences

Exactly one door, with every rule checked there. The function sets `created_by` and `ends_at` itself, so they can't be faked. Because these functions bypass RLS, each does its own ownership check and has its own tests ("Direct insert into appointments is denied").

---

‹ [005](005-rule-placement.md) · Next: [007](007-busy-times-function.md) ›
