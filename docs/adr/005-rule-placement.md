[README](../../README.md) › [Docs](../README.md) › ADR 005

# ADR 005: Where rules live: RLS, Postgres functions, Zod

**Status:** Accepted

## Context

Rules could live in the UI, the API, or the database. A parent's token can call Supabase directly, so anything only in the app can be skipped.

## Decision

Three layers, each with one job. **RLS** decides which rows a user can see. **Postgres functions** enforce business rules on every write. **Zod** checks request shape in the route handler for fast, friendly 422s. The UI mirrors rules (Off days, Taken times) for a good experience but is never trusted.

## Consequences

Rules hold no matter how the database is reached, and they're tested in pgTAP. Some rules exist twice (Zod and Postgres), which is deliberate: Zod for feedback, Postgres for truth.

---

‹ [004](004-utc-storage-center-timezones.md) · Next: [006](006-single-write-path.md) ›
