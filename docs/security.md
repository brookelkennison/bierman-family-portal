[README](../README.md) › [Docs](README.md) › Security

# Security

The goal: a parent can only ever see and change what belongs to their own
family, and that holds even if the app has a bug or someone calls the
database API directly. So the database enforces it, and tests prove it.

## Layers

| Layer                | Job                                                                                             |
| -------------------- | ----------------------------------------------------------------------------------------------- |
| Postgres RLS         | Which rows a user can read. Child-scoped through `my_patient_ids()`.                            |
| Revoked table writes | There is no direct `INSERT`, `UPDATE`, or `DELETE` on appointments, patients, or guardianships. |
| Postgres functions   | The only write path. Every business rule is checked here.                                       |
| Route handlers       | Validate shape with Zod, check `Origin`, call the database as the user, map errors.             |
| Proxy and headers    | Session check, CSP with nonces, no caching, no framing, no referrer.                            |

## Policies, what they block, and the test that proves it

All tests are in `supabase/tests` (pgTAP, 41 tests) or `e2e/` (Playwright), and run in CI.

| Policy                                                                                       | Blocks                                                                   | Test                                                                                                                                           |
| -------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------- |
| `patients`, `appointments`, `care_team` readable only where `patient_id in my_patient_ids()` | Seeing another family's children or visits                               | "Parent A sees only their own child", "Parent B sees only their own child"; E2E "another family's appointment is a 404"                        |
| `guardianships`: own rows only                                                               | Learning who else is linked to your child                                | "Parent A sees only their own guardianship"                                                                                                    |
| `profiles`: own row; only `full_name` is updatable                                           | Role escalation                                                          | "Parent cannot change their own role", "Signup metadata cannot set role"                                                                       |
| `anon` has no grants on any table                                                            | Reading anything while logged out                                        | "Logged-out visitors cannot read patients"; E2E "the API answers 401 when logged out"                                                          |
| Writes revoked on appointments, patients, guardianships                                      | Booking around the rules with a raw API call                             | "Direct insert into appointments is denied"                                                                                                    |
| Reference tables are read-only                                                               | Changing centers, providers, hours, or types                             | "Parent cannot write reference tables"                                                                                                         |
| `audit_log`: RLS on with no policies                                                         | Reading or editing the audit trail                                       | "Parent cannot read the audit log"                                                                                                             |
| `book_appointment()` checks guardian, type, time, center, provider, hours, slot, notes       | Booking for someone else's child, a therapy session, the past, off hours | One test per rule in `002_booking.test.sql`                                                                                                    |
| Exclusion constraints on provider and child                                                  | Double booking, even in a race                                           | "Provider cannot be double-booked", "Overlapping time with the same provider is slot_taken", "Same child at an overlapping time is child_busy" |
| `provider_busy_times()`: times only, your center only, 62 days max                           | Scraping schedules or patient details                                    | All 7 tests in `003_busy_times.test.sql`                                                                                                       |
| Execute on functions granted to `authenticated` only                                         | Calling them while logged out                                            | "Logged-out visitors cannot call book_appointment"                                                                                             |

## Threat model

| Threat                                                                        | What stops it                                                                                                                                                                                                                                                                                                                                                      |
| ----------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **Guessing IDs** (opening `/appointments/<someone else's id>`)                | UUIDs, and RLS returns nothing, so the page is a plain 404 that looks the same as an ID that doesn't exist. E2E covers it.                                                                                                                                                                                                                                         |
| **Stolen session**                                                            | HTTP-only, `SameSite` cookies; strict CSP blocks injected scripts that could read the page; logout ends every session for the user; a revoked token is caught on the next page load.                                                                                                                                                                               |
| **Raw API booking** (a parent calls Supabase or `/api/appointments` directly) | Table writes are revoked. The only door is `book_appointment()`, which checks every rule and sets `created_by` and `ends_at` itself.                                                                                                                                                                                                                               |
| **Schedule scraping** (learning when other families come in)                  | Appointments are RLS-scoped. Busy times return start and end only, only for providers at your own center, 62 days at a time.                                                                                                                                                                                                                                       |
| **Role escalation**                                                           | Signup trigger always sets `guardian`; only `full_name` is updatable; no client can write `role`.                                                                                                                                                                                                                                                                  |
| **CSRF**                                                                      | Writes require a matching `Origin` header, cookies are `SameSite`, and server actions carry Next's own protection.                                                                                                                                                                                                                                                 |
| **User enumeration**                                                          | One login error for every failure. Sign-up is off, so there's no "email already taken" response.                                                                                                                                                                                                                                                                   |
| **PHI leaks**                                                                 | No PHI in URLs (the selected child lives in memory); `no-store` on every page; no analytics or third-party scripts; notes hidden from lists and capped at 500 characters with a "no medical details" hint; raw database errors never reach the browser; server logs record error codes, never emails or passwords; the audit log stores field names, never values. |
| **Clickjacking**                                                              | `frame-ancestors 'none'` and `X-Frame-Options: DENY`.                                                                                                                                                                                                                                                                                                              |

## Why accounts are provisioned, not self-service

If parents could sign up and add children, anyone could claim to be any
child's guardian. In practice the intake team verifies identity and
custody, then creates the account and links the child. So sign-up is off in
Supabase Auth (E2E checks a direct sign-up call is rejected), and the
`patients` and `guardianships` tables have no write path for parents at all.
See [ADR 008](adr/008-accounts-and-children-provisioned.md).

## Secrets

- The publishable key is the only key the app and browser use. RLS is what protects data, not key secrecy.
- The secret key bypasses RLS. It lives only in `.env.seed` (gitignored), is read only by `scripts/seed.ts`, and is never in `.env.local`, Vercel, or CI (CI uses a throwaway local Supabase with its own default keys).
- GitHub secret scanning, Dependabot, and CodeQL are on.

## Clinicians (out of scope)

Providers don't log in in this version. In production they would get a
`clinician` role and read their own schedule through narrow `security
definer` functions, the same pattern as `provider_busy_times()`, instead
of broadening the parent RLS policies. The `providers.profile_id` column is
already there for that link.

## HIPAA and production gaps

This is a demo with fake data and is **not HIPAA compliant**. Before real PHI:

- A Business Associate Agreement with Supabase and Vercel (paid plans), a risk assessment, policies, and staff training.
- MFA and password reset; session timeout warnings.
- Read logging (who viewed which record), retention, and backups with restore drills.
- Error tracking and logging that scrub PHI.
- Rate limiting on login and booking.
- Penetration testing and an incident response plan.

---

‹ [Docs](README.md) · Next: [Architecture](architecture.md) ›
