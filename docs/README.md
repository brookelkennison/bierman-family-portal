[README](../README.md) › Docs

# Docs

| Doc                               | What's in it                                                                                             |
| --------------------------------- | -------------------------------------------------------------------------------------------------------- |
| [Security](security.md)           | Threat model, each policy with what it blocks and the test that proves it, PHI handling, production gaps |
| [Architecture](architecture.md)   | Request flow, endpoints, folder layout, and why rules live in Postgres                                   |
| [Accessibility](accessibility.md) | WCAG 2.2 AA target, what's tested and how, notes for every screen                                        |
| [Design QA](design-qa.md)         | Every Figma frame compared with the build, and deliberate differences                                    |
| [Screenshots](screenshots)        | Desktop and mobile shots of every page                                                                   |

## Architecture decision records

| #                                                      | Decision                                             |
| ------------------------------------------------------ | ---------------------------------------------------- |
| [001](adr/001-guardian-model.md)                       | Guardians, not patients, are the users               |
| [002](adr/002-route-handlers-over-edge-functions.md)   | Next.js route handlers instead of Edge Functions     |
| [003](adr/003-soft-cancel-vs-delete.md)                | Cancel keeps the record; delete is only for mistakes |
| [004](adr/004-utc-storage-center-timezones.md)         | Store UTC, show the center's time zone               |
| [005](adr/005-rule-placement.md)                       | Where rules live: RLS, Postgres functions, Zod       |
| [006](adr/006-single-write-path.md)                    | One write path per table                             |
| [007](adr/007-busy-times-function.md)                  | Busy times without exposing appointments             |
| [008](adr/008-accounts-and-children-provisioned.md)    | Accounts and children come from the center           |
| [009](adr/009-parent-training-only-family-bookable.md) | Only parent training is family-bookable              |
| [010](adr/010-provider-hours.md)                       | Each provider has their own hours                    |

## Planning

- [Build plan](../PLAN.md)
- [Figma mockups](https://www.figma.com/design/Xnyq8R0Y9v9PYiz0IMo8Rv)
- [FigJam planning board](https://www.figma.com/board/4PoFJM4jzUJpHQIFjq1soy)
- [GitHub Project board](https://github.com/users/brookelkennison/projects/2/views/1)

---

Next: [Security](security.md) ›
