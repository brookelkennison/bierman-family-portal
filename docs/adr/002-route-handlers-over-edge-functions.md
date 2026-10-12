[README](../../README.md) › [Docs](../README.md) › ADR 002

# ADR 002: Next.js route handlers instead of Edge Functions

**Status:** Accepted

## Context

The brief allows either Next.js API routes or Supabase Edge Functions.

## Decision

Use Next.js route handlers (`app/api/appointments`). They run as the signed-in parent with the user-scoped Supabase client and call Postgres functions for anything that writes.

## Consequences

One codebase, one deploy, one set of types shared between UI and API. The handlers stay thin because the rules live in Postgres (ADR 005), so moving them to Edge Functions later would be a small change. Edge Functions would add a second runtime and deploy for no security gain here.

---

‹ [001](001-guardian-model.md) · Next: [003](003-soft-cancel-vs-delete.md) ›
