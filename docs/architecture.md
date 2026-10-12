[README](../README.md) › [Docs](README.md) › Architecture

# Architecture

## Request flow

```
Browser
  │
  ▼
proxy.ts ─ every request
  │  • new CSP nonce, no-store, security headers
  │  • refreshes the Supabase session cookie
  │  • getClaims(): logged out → /login (or 401 JSON for /api)
  ▼
Server Components (dashboard, list, detail, booking page)
  │  • getUser() re-checks the session with Supabase
  │  • queries run as the parent, RLS on
  ▼
Client Components (kid picker, filters, booking form)
  │  • booking POSTs to /api/appointments
  ▼
Route handler /api/appointments
  │  • Origin check, Zod validation
  │  • calls book_appointment() as the parent
  │  • maps Postgres error codes to 401 / 403 / 409 / 422
  ▼
Postgres (Supabase)
     • RLS decides visibility
     • book_appointment() enforces every rule
     • exclusion constraints stop double booking
     • audit trigger records field names of every write
```

## Endpoints

| Route                                      | Does                                                                     |
| ------------------------------------------ | ------------------------------------------------------------------------ |
| `GET /api/appointments?childId=&from=&to=` | The parent's appointments, only the columns a list needs                 |
| `POST /api/appointments`                   | Books parent training through `book_appointment()`; returns `201 { id }` |
| Server action `login` / `logout`           | Supabase Auth with password; generic error on failure                    |

Any other method returns 405. Reads for pages happen in Server Components
directly, so there's no extra round trip.

## Why rules live in Postgres

A parent's session token can call Supabase's API directly, not just through
this app. If the rules lived only in route handlers, that path would skip
them. So RLS and `book_appointment()` sit next to the data, and the route
handler stays thin: validate shape, call the function, translate errors.
Zod still runs first so a bad request gets a clear 422 instead of a
database error. See [ADR 005](adr/005-rule-placement.md) and
[ADR 006](adr/006-single-write-path.md).

## Time zones

Times are `timestamptz` in UTC. Every display goes through `lib/time.ts`,
which formats in the **center's** IANA zone with its abbreviation (EDT or
EST), and screen readers get "Eastern Time". Booking builds slots from each
provider's wall-clock hours in center time and converts with `localToUtc()`,
checked twice so clock-change days come out right. Unit tests cover the
Nov 1, 2026 change. See [ADR 004](adr/004-utc-storage-center-timezones.md).

## Rendering

Every page renders per request (`await connection()` in the root layout),
so health data is never cached or prerendered, and the CSP nonce is fresh
each time. `cacheComponents` is off for the same reason.

## Folder layout

```
app/
  (app)/            logged-in pages: dashboard, appointments, book, help, 404
  api/appointments/ GET and POST
  actions/          login and logout server actions
  login/            login page
  styleguide/       dev-only component showcase
components/
  ui/               shared pieces: Button, Badge, DayRow, TimeSlots, Dialog...
  shell/            header, nav, skip link
  dashboard/  booking/  appointments/
lib/
  booking/          Zod schemas, error mapping, slot building, booking data
  data.ts           family data loader
  time.ts           center-time formatting and conversion
  supabase/         server and browser clients
supabase/
  migrations/       schema, RLS, functions (reviewed one at a time)
  tests/            pgTAP
scripts/seed.ts     demo data and logins
e2e/                Playwright with axe
tests/unit/         Vitest
docs/               this folder
proxy.ts            per-request security and session check
```

---

‹ [Security](security.md) · Next: [Accessibility](accessibility.md) ›
