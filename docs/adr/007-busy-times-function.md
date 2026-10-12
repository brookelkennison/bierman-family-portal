[README](../../README.md) › [Docs](../README.md) › ADR 007

# ADR 007: Busy times without exposing appointments

**Status:** Accepted

## Context

The time picker should show which times are taken. RLS rightly hides other families' appointments, so the app can't see them to compute busy slots.

## Decision

Add `provider_busy_times(provider, from, to)`: `security definer`, returns only start and end times, only for providers at a center where the caller has a child, only scheduled visits, at most 62 days per call. Anything else returns nothing or an error.

## Consequences

The picker shows "Taken" honestly, and parents rarely hit a booking race. Nothing about who the other visit is for can leak. The race itself is still handled by the exclusion constraint and the slot-taken screen. Seven pgTAP tests cover the guard rails.

---

‹ [006](006-single-write-path.md) · Next: [008](008-accounts-and-children-provisioned.md) ›
