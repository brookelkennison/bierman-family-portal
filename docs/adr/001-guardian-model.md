[README](../../README.md) › [Docs](../README.md) › ADR 001

# ADR 001: Guardians, not patients, are the users

**Status:** Accepted

## Context

Children don't log in. Parents and guardians do, and families are often more complicated than one parent, one child: co-parents, siblings, a grandparent who does pickups.

## Decision

Users are `profiles` (one per login). Children are `patients`. A many-to-many `guardianships` table links them, so one parent can have several children and one child can have several guardians. Every child-scoped RLS policy goes through `my_patient_ids()`, which reads this table.

## Consequences

Co-parents each see the same child without sharing a login. Adding a guardian is one row. A guardian only sees their own `guardianships` rows, so a co-parent's link stays private. The cost is one join behind every policy, kept cheap by the helper and primary-key indexes.

---

‹ [Docs](../README.md) · Next: [002](002-route-handlers-over-edge-functions.md) ›
