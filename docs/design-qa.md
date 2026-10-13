[README](../README.md) › [Docs](README.md) › Design QA

# Design QA against Figma

Every in-scope frame in the
[Figma file](https://www.figma.com/design/Xnyq8R0Y9v9PYiz0IMo8Rv), compared
with the build at 1440 and 390 wide. "Matches" means compared and matching. Screenshots of the build are in
[screenshots](./screenshots) (`pnpm seed && pnpm screenshots` regenerates them).

Colors, type sizes, radii, and shadows come only from the theme tokens in
`app/globals.css`, and `pnpm lint:styles` fails CI if a component hard-codes one.

## Frames

| Frame                            | Status              | Notes                                                                                                                                                                                    |
| -------------------------------- | ------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 01 Log in                        | Matches             |                                                                                                                                                                                          |
| 02 Log in, error (mobile)        | Matches             | Layout from the mobile screenshot; the error banner text and focus are covered by `auth.spec.ts`.                                                                                        |
| 03 Home dashboard, all kids      | Matches             | Week strip starts at next week, with arrows for this week and later weeks.                                                                                                               |
| 03b Dashboard, Leo selected      | Matches             |                                                                                                                                                                                          |
| 04 Dashboard, Maya (mobile)      | Matches             | Compared with the all-kids mobile screenshot; the Maya filter uses the same layout as 03b.                                                                                               |
| 05 Home, no children linked      | Differs, on purpose | "Find another center" is "Other ways to reach us" and goes to Help, since there's no locations page to link to.                                                                          |
| 05b Nothing coming up            | Matches             | Checked with sample data.                                                                                                                                                                |
| 06 Book parent training          | Differs, on purpose | One scrolling page with a 4-step stepper (Child, Provider, Date and time, Review). No Where step: there is one center per child, shown in the summary. "Next available" banner left out. |
| 07 Book, date and time (mobile)  | Differs, on purpose | Same single page as desktop instead of one step per screen. Less state to get wrong, and all answers stay visible.                                                                       |
| 07b Book, Leo's options (mobile) | Matches             | Same page with Leo selected.                                                                                                                                                             |
| 08 Booking confirmed             | Differs, on purpose | "We let Taylor know" is "Your visit with Taylor is on the calendar", since the app doesn't notify providers.                                                                             |
| 09 Slot just taken               | Matches             | Banner sits inside the date and time card. Needs a real race to see.                                                                                                                     |
| 10 Appointment detail            | Matches             | Child's illustrated avatar replaces the initial circle, same as the dashboard. Manage buttons carry the Coming soon badge.                                                               |
| 11 Report absence                | Coming soon         | Button and message only, per scope.                                                                                                                                                      |
| 12 Delete booking, confirm       | Coming soon         | Dialog component built and on /styleguide; not wired to a page.                                                                                                                          |
| 13 Not found                     | Matches             |                                                                                                                                                                                          |
| 14 Appointments list             | Matches             |                                                                                                                                                                                          |
| 15 Reschedule                    | Coming soon         |                                                                                                                                                                                          |
| 16 Cancel visit                  | Coming soon         |                                                                                                                                                                                          |
| 17 Visit cancelled               | Coming soon         | Cancelled visits still show in the list and detail with the reason.                                                                                                                      |
| 18 Delete booking                | Coming soon         |                                                                                                                                                                                          |
| 15c States to build              | Matches             | Booking failed, not allowed, session expired, empty filter, loading.                                                                                                                     |
| 166:2 Set by care team tooltip   | Differs, on purpose | Uses the child's name instead of "her". "You can still report an absence" is "To ask for a change, call the center", since absence reporting is Coming soon.                             |

## Deliberate differences, all in one place

1. Booking is one page, not one step per screen on mobile.
2. No Where step in booking.
3. Copy never promises something the app doesn't do: provider notifications,
   online absence reporting, rescheduling.
4. Pronouns are replaced with the child's name.
5. "Find another center" points to Help.

---

‹ [Accessibility](accessibility.md) · Back to [Docs](README.md)
