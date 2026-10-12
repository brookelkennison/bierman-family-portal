[README](../../README.md) › [Docs](../README.md) › ADR 003

# ADR 003: Cancel keeps the record; delete is only for mistakes

**Status:** Accepted

## Context

Appointments are part of a child's care record. Care teams need to see missed and cancelled visits, and insurance hours depend on them.

## Decision

Cancelling sets `status = 'cancelled'` with a required reason, who cancelled (`caregiver` or `center`), and when. A check constraint makes those fields all-or-nothing. Hard delete is reserved for a family-booked visit made by mistake, and medical-record foreign keys use `restrict`, never `cascade`. For the take-home, both actions are designed and shown as Coming soon (scope is create and read).

## Consequences

History survives. The list and detail pages already show cancelled visits with the reason. The database is ready for the update functions when they're built.

---

‹ [002](002-route-handlers-over-edge-functions.md) · Next: [004](004-utc-storage-center-timezones.md) ›
