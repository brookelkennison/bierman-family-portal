[README](../../README.md) › [Docs](../README.md) › ADR 008

# ADR 008: Accounts and children come from the center

**Status:** Accepted

## Context

Self-service sign-up plus "add your child" would let anyone claim to be any child's guardian. Real custody and identity checks happen at intake.

## Decision

Public sign-up is off in Supabase Auth. The center creates accounts and links children (here, the seed script does). Parents have no write path to `patients` or `guardianships`. A parent with no linked children sees an empty state pointing them to the center.

## Consequences

No way to self-attach to a child. No sign-up page means no "email already taken" enumeration. Production needs an intake tool for staff, listed as a gap.

---

‹ [007](007-busy-times-function.md) · Next: [009](009-parent-training-only-family-bookable.md) ›
