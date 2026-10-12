[README](../../README.md) › [Docs](../README.md) › ADR 004

# ADR 004: Store UTC, show the center's time zone

**Status:** Accepted

## Context

Families and staff think in the center's local time. A parent traveling, or a server in UTC, shouldn't shift a 3:30 PM session. Clock changes (Nov 1, 2026) must not break booking.

## Decision

Store `timestamptz` (UTC). Each center has an IANA `timezone`. All display goes through `lib/time.ts` in the center's zone with the abbreviation (EDT or EST). Provider hours are wall-clock times in center time; slots are built in center time and converted to UTC. `book_appointment()` checks slot alignment and hours in center time too.

## Consequences

Same answer on any device or server. Unit tests cover the DST change. A second center in another zone would work without code changes.

---

‹ [003](003-soft-cancel-vs-delete.md) · Next: [005](005-rule-placement.md) ›
