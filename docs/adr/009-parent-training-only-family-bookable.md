[README](../../README.md) › [Docs](../README.md) › ADR 009

# ADR 009: Only parent training is family-bookable

**Status:** Accepted

## Context

ABA, speech, and OT run on a weekly schedule set by the care team and tied to insurance-authorized hours. Letting parents book or move them would break authorizations and staffing.

## Decision

`appointment_types.family_bookable` is true only for parent training. `book_appointment()` rejects anything else (`not_family_bookable`). The UI lists therapy types as "Set by care team" with an explanation.

## Consequences

Parents get real self-service where it makes sense, and the care team keeps control of therapy. Report absence is the parent's action on therapy visits, designed and shown as Coming soon.

---

‹ [008](008-accounts-and-children-provisioned.md) · Next: [010](010-provider-hours.md) ›
