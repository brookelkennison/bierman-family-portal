# Bierman Family Portal: Build Plan

Take-home for Bierman Autism Centers: a secure "Patient Appointment Manager" built with Next.js, TypeScript, Tailwind, and Supabase, deployed to Vercel.

**Scope update (Oct 11):** the team asked for create and read only, run locally with setup instructions (no hosting required). Reschedule, cancel, report absence, and delete stay in the UI with a Coming soon state.

**Links**

- Repo: https://github.com/brookelkennison/bierman-family-portal
- Planning board (FigJam): https://www.figma.com/board/4PoFJM4jzUJpHQIFjq1soy
- Mockups (Figma, page "Mockups v4"): https://www.figma.com/design/Xnyq8R0Y9v9PYiz0IMo8Rv
- Live URL: https://bierman-family-portal.vercel.app/

**Scope labels used below**

- **Required:** the brief asks for it directly.
- **Recommended:** not asked for, but scored by their criteria (security, code quality, UX, docs).
- **Extra:** cut first if time runs short. Marked with a purple EXTRA tag on the FigJam board.
- **Coming soon:** design concept only. Not built.

---

## 1. What the brief requires, and where it's covered

| Requirement                                          | Covered by                                                                   |
| ---------------------------------------------------- | ---------------------------------------------------------------------------- |
| Next.js, Tailwind, responsive and polished UI        | Dashboard, booking, detail, list, auth screens. Mobile-first.                |
| TypeScript everywhere                                | Strict mode, generated Supabase types                                        |
| Supabase Postgres and Auth                           | Migrations, email and password login for center-provisioned accounts         |
| Create and read appointments (scope per the team)    | Book (C); dashboard, list, detail (R). Update and delete show as Coming soon |
| Relational schema (profiles, patients, appointments) | Section 4                                                                    |
| RLS so users only touch their own data               | Section 5                                                                    |
| API layer (Next.js routes or Edge Functions)         | Route handlers calling Postgres functions                                    |
| Automated tests                                      | RLS and function tests, unit tests, Playwright with axe                      |
| Runs locally (hosting not required)                  | One-command local setup in the README                                        |
| README: setup, schema and RLS, architecture          | README plus `docs/`                                                          |
| Public repo and live URL                             | Submission                                                                   |

---

## 2. Product model

**Who logs in:** a parent or guardian. One guardian can have several kids, and a kid can have more than one guardian (co-parents).

**Accounts and children are provisioned, not self-service.** There is no public sign-up. Demo parents log in with credentials from the README.

**Children are seeded, not self-added.** In real life the intake team links a child to a parent's account. Letting parents add children would let anyone claim to be any child's guardian. Parents who sign up with no linked children see an empty state: "No children are linked to your account yet. Your center links them after intake."

**Two kinds of appointments**

- **Care team scheduled** (ABA, speech, OT). Set by the clinical team on a standing weekly schedule, tied to insurance-authorized hours. Parents can view these and report an absence (cancel with a required reason). They cannot book, move, or delete them.
- **Family bookable** (parent training only). Parents can book, reschedule, cancel, and delete these.
- Diagnostic evaluations are scheduled by the intake team, not self-booked. The UI points to the intake line.

**Per-child care plans (sample data).** Services and hours depend on each child's assessment, not just age.

- Maya, 7, in school: focused ABA after school (Mon, Wed, Thu 3:30 to 5:30 PM) plus weekly speech therapy. BCBA: Taylor Brooks.
- Leo, 3, early intervention: comprehensive ABA weekdays 9:00 AM to 2:00 PM plus weekly OT. BCBA: Sam Patel.

**Providers with their own hours.** Each child has two BCBAs to choose from for parent training:

| Child | Their BCBA                                | Second option                         |
| ----- | ----------------------------------------- | ------------------------------------- |
| Maya  | Taylor Brooks: Tue and Thu, 9 AM to 12 PM | Priya Shah: Mon and Wed, 4 to 7 PM    |
| Leo   | Sam Patel: Mon, Wed, Fri, 2:30 to 5 PM    | Morgan Hayes: Tue and Thu, 8 to 10 AM |

**Centers and time zones.** Booking always uses the child's home center (no Change center step). Times are stored in UTC and always shown in the center's local time with the zone (EDT). Seed includes Westfield, IN. Optionally add a Scottsdale, AZ center (no DST) to prove time zone handling.

**Branding:** Bierman tokens from their live site.

- Fonts and colors: Poppins, navy `#004C97`, aqua `#05C3DE` (fills only, never text), pink `#EF4E72`, and green `#61CE70`.
- Buttons: deeper pink `#D63458` (4.68:1). The original pink with white text is 3.5:1 and fails WCAG.
- The "B" logo is a placeholder.
- Kids are shown as illustrated avatars, not photos of real children.

---

## 3. Scope

**Required or recommended (build these)**

- Auth: log in, login error, log out. No sign-up or password reset (accounts come from the center).
- Home dashboard with kid bubbles (All kids, Maya, Leo), Today card, next week strip, appointment list, care plan card per child
- Appointments list with filters (child, Upcoming, Past, Cancelled)
- Appointment detail for both care-team and family bookings
- Book parent training: child, then provider (at the child's home center), then date and time, then notes, then review
- Reschedule, cancel, delete, and report absence: buttons shown with a Coming soon state (not built for the take-home)
- Empty state (no children linked), 404, slot just taken (409)
- Seed data and demo logins for two parents

**Extra (cut first)**

- Open-slot picker with per-provider hours (baseline: date and time picker, validated on the server)
- `provider_busy_times` function (only needed for the slot picker)
- Session timeout warning
- Read logging in the audit log (write logging stays)
- MFA, clinician role, rate limiting, OpenAPI with Scalar, Docsify, nightly demo reseed
- Parent account page (designed as a concept)
- Dependabot and CodeQL (ten minutes, so keep if possible), AI usage doc

**Coming soon (designed, not built)**

- Progress after every session, with a plain language toggle
- Today's session note
- Practice at home (parent goals and logging)
- Paperwork and billing (signatures, copays, insurance hours)
- Care circle (school, doctors, and Bierman in one view)

---

## 4. Schema

| Table               | Key columns                                                                                                                                                                          | Notes                                                                                                          |
| ------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------- |
| `profiles`          | `id` (FK `auth.users`), `role` (guardian, clinician), `full_name`                                                                                                                    | Created by trigger on signup                                                                                   |
| `patients`          | `id`, `first_name`, `last_name`, `date_of_birth`, `program`, `weekly_aba_hours`, `home_center_id`                                                                                    | Seeded only. Program and hours feed the care plan card.                                                        |
| `guardianships`     | `guardian_id`, `patient_id`, `relationship`                                                                                                                                          | Seeded only. Composite PK.                                                                                     |
| `centers`           | `id`, `name`, `address`, `city`, `state`, `phone`, `timezone` (IANA)                                                                                                                 | Seeded                                                                                                         |
| `providers`         | `id`, `center_id`, `display_name`, `discipline`, `profile_id`                                                                                                                        | Seeded                                                                                                         |
| `provider_hours`    | `provider_id`, `weekday`, `starts_at`, `ends_at`                                                                                                                                     | Core. Replaces `center_hours`. Shows each provider's days and lets `book_appointment` check hours.             |
| `care_team`         | `patient_id`, `provider_id`, `role`                                                                                                                                                  | Marks each child's own BCBA and therapists. Powers the care plan card and the "Your BCBA" tag on the Who step. |
| `appointment_types` | `code`, `label`, `duration_minutes`, `discipline`, `family_bookable`                                                                                                                 | Seeded. Only parent training is family bookable.                                                               |
| `appointments`      | `id`, `patient_id`, `provider_id`, `type`, `starts_at`, `ends_at`, `status`, `notes`, `created_by`, `cancel_reason`, `cancelled_by`, `cancelled_by_kind`, `cancelled_at`, timestamps | Core table. No `center_id`: the center comes from the provider.                                                |
| `audit_log`         | `actor_id`, `action`, `table_name`, `record_id`, `changed_fields`, `at`                                                                                                              | Append only. Field names, never PHI values.                                                                    |

**Constraints**

- `ends_at > starts_at`, plus length caps on all text fields.
- Exclusion constraints (`btree_gist`) so a provider and a child can't be double-booked.
- Enums for status, role, and discipline.
- No `cascade` on medical records. Use `restrict` or `set null`.
- Triggers only for `updated_at` and audit writes.

---

## 5. Security model

**Where rules live (ADR 005)**

- RLS decides who can see what.
- Postgres functions enforce business rules.
- Zod gives fast feedback in forms.

**RLS (read side)**

- RLS on every table.
- A `my_patient_ids()` helper (`security definer`, `stable`, `set search_path = ''`) used by every policy.
- `patients`, `appointments`, `guardianships`: SELECT only, own children only.
- Reference tables (`centers`, `providers`, `appointment_types`, `provider_hours`): read-only for signed-in users.
- `profiles`: own row only. UPDATE granted on `full_name` only, which blocks role escalation.
- `audit_log`: RLS on with zero policies, so it's deny-all. UPDATE and DELETE revoked.

**Single write path (ADR 006).** Revoke INSERT, UPDATE, and DELETE on `appointments`, `patients`, and `guardianships` from signed-in users. All writes go through functions:

| Function                                     | Checks                                                                                                                                                                                                                                                                                               |
| -------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `book_appointment(...)`                      | Caller's child; family-bookable type; future time; provider works at the child's home center; inside the provider's hours (or center hours in the baseline); 30-minute slots in center time; no more than 60 days out; provider discipline matches the type; sets `ends_at` from the type's duration |
| `reschedule_appointment(id, new_starts_at)`  | Same checks; family bookable; still upcoming                                                                                                                                                                                                                                                         |
| `cancel_appointment(id, reason)`             | Caller's child; upcoming; reason required. Also used for report absence on care-team sessions.                                                                                                                                                                                                       |
| `delete_appointment(id)`                     | Family bookable; caller's; upcoming; still scheduled                                                                                                                                                                                                                                                 |
| `provider_busy_times(provider_id, from, to)` | **Extra.** Returns start and end only, no patient fields. Range capped at about two weeks. (ADR 007)                                                                                                                                                                                                 |

Every function rejects anonymous callers, checks ownership itself, and is callable only by `authenticated`. These functions bypass RLS, so each one gets its own tests.

**Auth**

- Supabase Auth with cookie sessions via `@supabase/ssr`.
- `getUser()` on the server, and middleware guards protected routes.
- Public sign-ups turned off in Supabase Auth. Demo users are created by a seed script with confirmed emails.
- **No user enumeration.** Login errors are generic.

**Keeping PHI from leaking**

- No analytics, session replay, or third-party scripts on logged-in pages.
- `Cache-Control: no-store` on authenticated pages and API responses.
- No PHI in URLs, emails, or logs.
- Raw database errors never reach the browser.
- Select only the columns each screen needs.
- Notes are capped, have helper text ("don't include medical details"), and are hidden from list views.

**Hardening**

- CSP with nonces, HSTS, `frame-ancestors 'none'`, and a strict `Referrer-Policy`.
- Check the `Origin` header on any request that changes data.
- Rate limits on booking (extra).
- A `.env.example`, with the service role key never in the browser or repo.
- Secret scanning on, plus Dependabot and CodeQL.

**Not HIPAA compliant.** Fake data only. The README lists the production gaps: BAAs (only on certain paid plans), key management, backups, incident response, risk assessment, MFA, and error tracking.

---

## 6. API (Next.js route handlers)

| Route                           | Calls                                                                                        |
| ------------------------------- | -------------------------------------------------------------------------------------------- |
| `GET /api/appointments`         | RLS-scoped select                                                                            |
| `POST /api/appointments`        | `book_appointment`                                                                           |
| `PATCH /api/appointments/[id]`  | `reschedule_appointment` or `cancel_appointment`                                             |
| `DELETE /api/appointments/[id]` | `delete_appointment`                                                                         |
| `GET /api/availability`         | **Extra.** `provider_busy_times` plus `provider_hours`, slots generated in the center's zone |

- Zod validation on every route.
- The user-scoped Supabase client only.
- Errors mapped to friendly 403, 409, and 422 responses.
- Types generated with `supabase gen types`.

**Error copy**

| Situation             | Message                                                                                   |
| --------------------- | ----------------------------------------------------------------------------------------- |
| Login failed          | That email and password don't match. Try again or reset your password.                    |
| Slot taken (409)      | Someone just booked that time. Here are the times still open.                             |
| Reason missing        | Add a short reason so your care team knows what's happening.                              |
| Not allowed (403)     | You can't make changes to this appointment. Contact your center if something looks wrong. |
| Another family's link | Regular 404 page                                                                          |

---

## 7. UI and accessibility

**Layout:** no sidebar. A top bar holds the logo, Home, Appointments, Help, the "Book a visit" button, and the parent menu. On mobile, the same top bar sits above a row of tab pills. It's a responsive web app, so no phone-style bottom tab bar.

**Screens (Figma, "Mockups v4" page)**

- **Auth:** 01 Log in, 02 Login error. (01a to 01e, sign-up and password reset, are kept as concepts and not built.)
- **Home:** 03 dashboard (all kids), 03b Leo selected, 04 Maya selected (mobile), 05 no children linked
- **Booking:** 06 Book parent training, 07 date and time with Taylor (mobile), 07c date and time with Priya (mobile), 07b Leo's providers (mobile), 08 confirmed, 09 slot just taken
- **Manage:** 10 detail, 11 report absence, 12 delete (mobile), 13 not found
- **CRUD views:** 00 CRUD map, 14 appointments list, 15 reschedule, 16 cancel, 17 cancelled state, 18 delete
- **Concepts:** 19 and 20 parent account, 21 to 25 coming soon

**Booking order:**

1. Who is this for?
2. What would you like to book?
3. Who would you like to meet with? (BCBAs at the child's home center)
4. Date and time
5. Notes

The stepper has 4 steps: Child, Provider, Date and time, Review (screens 06, 06b, and 07 to 09). There's no Where step. Days a provider doesn't work show as "Off," and the "Next open" shortcut jumps to their first slot.

**WCAG 2.2 AA target.** The HHS Section 504 rule requires 2.1 AA; the deadline moved to May 11, 2027 for organizations with 15 or more employees.

- Semantic HTML, a skip link, and a unique title for each page.
- Visible labels. Errors linked to their fields, with focus moving to an error summary.
- Time slots as a radio group, with tap targets of at least 24px.
- Full keyboard support. Focus stays visible and never hides under the sticky header. Dialogs trap focus and return it.
- 4.5:1 text contrast. Statuses use text plus an icon, never color alone.
- `aria-live` announcements for toasts and slot loading.
- Login allows paste and password managers.
- Works at 320px wide and 200% zoom, and respects reduced motion.
- Screen readers hear the full time zone ("Eastern Daylight Time").

---

## 8. Seed data

- **Westfield center:** 16414 Southpark Dr, Westfield, IN 46074 (real public address). Optionally an Arizona center for time zone tests.
- **Providers:** Taylor Brooks, Priya Shah, Sam Patel, and Morgan Hayes (BCBAs), plus Dana Kim (SLP) and Riley Ortiz (OTR/L). All fake.
- **Guardian A:** Jordan Rivera, with Maya and Leo.
- **Guardian B:** one child, used for isolation tests.
- **Appointments:** care-team sessions that match each care plan, plus one family parent training booking.
- **Guardian C:** no children linked, to show the empty state.
- **Demo logins:** in the README. Public sign-up is off.

---

## 9. Testing

**RLS and function tests** (Vitest or Jest against local Supabase, or pgTAP)

Cross-family isolation:

- Guardian B can't see, book for, or attach to Guardian A's kids.

Direct access is blocked:

- Direct `insert` on `appointments` returns permission denied.

Booking rules hold:

- `book_appointment` rejects past times, off-hours, a provider outside their hours or center, care-team types, and someone else's child.
- Parents can't reschedule care-team sessions, can't cancel without a reason, and can't mark anything completed.

Hidden data stays hidden:

- `provider_busy_times` returns no patient fields and rejects oversized ranges.
- Parents can't escalate their role, and can't read or change the audit log.

**Unit tests**

- Zod schemas.
- Slot generation per provider, in both zones, across the Nov 1, 2026 DST change.

**Playwright E2E**

- Log in, log out, and a rejected sign-up call.
- Book parent training, reschedule it, cancel it, delete it.
- Report an absence.
- Switch between kids.
- Visit another family's appointment URL and get a 404.
- Run an axe scan on every page.

**CI (GitHub Actions)**

- Lint (including `jsx-a11y`), typecheck, and unit tests.
- Start Supabase, run the DB tests, then Playwright with axe.
- CodeQL.

**Manual**

- A keyboard-only pass, VoiceOver, and the 200% and 400% zoom checks.

---

## 10. Documentation

```
README.md                 what it is, live URL, demo logins, assumptions, setup, docs menu, testing, production gaps
docs/
  README.md               docs menu: table of docs + ADR list
  architecture.md         request flow, endpoints, folder layout
  security.md             threat model, policy -> what it blocks -> test that proves it, PHI handling
  accessibility.md        WCAG 2.2 AA, Section 504 context, what was tested, known gaps
  ai-usage.md             tools, what AI helped with, what I did, how I verified, guardrails
  adr/
    001-guardian-model.md
    002-route-handlers-over-edge-functions.md
    003-soft-cancel-vs-delete.md
    004-utc-storage-center-timezones.md
    005-rule-placement.md
    006-single-write-path.md
    007-busy-times-function.md
    008-accounts-and-children-provisioned.md
    009-parent-training-only-family-bookable.md
    010-provider-hours.md
```

Every doc gets a breadcrumb at the top and prev/next links at the bottom. The README includes a "Planning artifacts" section linking the FigJam board, the Figma file, and the GitHub Project.

**Threat model** (in `security.md`): ID guessing, stolen session, raw API booking, schedule scraping, role escalation, CSRF, user enumeration, and PHI leaking through logs or analytics.

---

## 11. Process

**Phase 0 (done or in progress)**

- [x] FigJam: user journeys, data flow, ERD, data inventory, gap review, parking lot. Extras tagged.
- [x] Figma mockups, branded, desktop and mobile, with CRUD map
- [ ] Gap review pass on the board
- [ ] GitHub Issues and Project board: one ticket per screen or function, each linking its FigJam section, with labels `db`, `api`, `ui`, `security`, `a11y`, `test`, `docs` and milestones per day
- [ ] Update the ERD on the board for `provider_hours` and `care_team`

**Working with Claude Code (learn, don't vibe code)**

- Put a `CLAUDE.md` in the repo pointing to this plan, with a rule to explain each migration before writing it and to work one file at a time.
- Learn each concept first, then hand-write the first table, policy, and test yourself.
- Let Claude Code do the rest in your pattern, and write two or three sentences on each piece in your own words. Those notes become the docs.
- Use plan mode for anything bigger than one file.
- Log AI help as you go for `ai-usage.md`, especially anything it got wrong.

**Day 1: Data and security**

- Scaffold Next.js, Tailwind (plain, no component library), and local Supabase, plus the lint and axe setup.
- Migrations: tables, constraints, RLS, revoked write grants, functions, audit triggers.
- Seed data.
- RLS and function tests green.
- CI, Dependabot, and CodeQL.

**Day 2: Features**

- Auth screens and middleware.
- Route handlers.
- Dashboard with kid bubbles and care plans.
- Booking with center, then provider, then date and time.
- Detail, reschedule, cancel, delete, report absence.
- Security headers and `no-store`.
- Build each component accessibly as you go.
- Upgrade to the open-slot picker if time allows.

**Day 3: Ship**

- Playwright tests with axe.
- Deploy to Supabase cloud and Vercel.
- Manual accessibility audit.
- README, docs, ADRs, threat model, AI usage.
- Extras only if there's time.

**If time runs short, protect these:**

- RLS
- The single write path
- The isolation tests
- `security.md`
- A working CRUD flow on the live URL

---

## 12. Questions for the interview

- What do families find most frustrating about scheduling today?
- How do families see their child's weekly schedule now, and how do they report absences?
- Do parents ever see authorized hours or attendance in any system today?
- Which booking types, if any, do families schedule themselves?
