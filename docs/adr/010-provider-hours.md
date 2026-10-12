[README](../../README.md) › [Docs](../README.md) › ADR 010

# ADR 010: Each provider has their own hours

**Status:** Accepted

## Context

Center opening hours don't say when a given BCBA is available for parent training. Parents need to see which days each BCBA works.

## Decision

`provider_hours` stores each provider's weekly hours in center wall-clock time. Booking shows only BCBAs at the child's home center, marks days with no hours as Off, and builds slots from those hours. `book_appointment()` checks the same hours on the server.

## Consequences

Accurate availability and an honest picker. Providers at more than one center would need hours per center (a `provider_centers` table), noted under production gaps.

---

‹ [009](009-parent-training-only-family-bookable.md) · Back to [Docs](../README.md)
