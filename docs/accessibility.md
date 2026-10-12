[README](../README.md) › [Docs](README.md) › Accessibility

# Accessibility

**Target:** WCAG 2.2 AA. Bierman serves families who may themselves have
disabilities, and as a healthcare provider receiving federal funds it falls
under Section 504, so AA is the floor, not a stretch goal.

## How it's tested

| Check                                                               | How                                                                               | Where                                       |
| ------------------------------------------------------------------- | --------------------------------------------------------------------------------- | ------------------------------------------- |
| Automated rules (WCAG 2.1 A/AA)                                     | axe on every page, logged in and out, plus filled-in booking and a selected child | `e2e/a11y.spec.ts`, runs in CI              |
| Reflow at 320px (400% zoom) and 640px (200% zoom)                   | No sideways scrolling on any page                                                 | `e2e/layout.spec.ts`, CI                    |
| Keyboard only                                                       | Skip link, booking from start to the Book button with no mouse                    | `e2e/layout.spec.ts`, CI                    |
| Focus visible, never hidden under the sticky header (2.4.7, 2.4.11) | Tabs through the appointments page checking each stop                             | `e2e/layout.spec.ts`, CI                    |
| Reduced motion                                                      | No animation or transition runs with the setting on                               | `e2e/layout.spec.ts`, CI                    |
| Hard-coded colors and sizes                                         | Fails if a component skips the theme tokens                                       | `scripts/check-styles.mjs`, in `pnpm check` |
| Screen reader                                                       | Manual VoiceOver pass with the script below                                       | Results below                               |

## Per screen

**Shared**

- Skip link is the first Tab stop and moves focus into `<main>`.
- Every page has a unique `<title>` and one `<h1>`. `<html lang="en">`.
- Focus ring: 3px navy outline on every interactive element. `scroll-padding-top`
  keeps focused items clear of the sticky header.
- Icons are `aria-hidden`. Icon-only buttons (week arrows, account menu) have labels.
- Status is never color alone: badges always have text and an icon.

**Login (01, 02)**

- Labels on both fields. Show password is a labeled button.
- One error message for every failure, so nothing reveals whether an email
  exists. On error, focus moves to the message (`role="alert"`).
- "You were signed out" notice when a session expires.

**Dashboard (03, 03b, 04, 05)**

- Kid picker buttons use `aria-pressed`. "Showing Leo" is announced politely.
- Week strip heading is `aria-live`, so "Next week" or "Week of Oct 26" is read
  when the arrows change it. Day names are read in full ("Monday").
- Report absence is a Coming soon button (below).
- Loading skeleton is `aria-busy` with "Loading your dashboard" announced once.

**Book parent training (06, 07, 09)**

- Each question is a `<section>` with its heading. Provider, day, and time are
  native radio groups (`fieldset` and `legend`), so arrow keys and screen
  readers work without custom code.
- Off and Full days are disabled and read as "Monday, October 19, off".
- Taken times stay in the list, disabled, and read "9:00 AM · Taken".
- "Set by care team" is a button with a tooltip (`aria-describedby`). Opens on
  hover or focus, closes with Esc, stays open while the pointer is over it.
- Notes field has a visible hint about medical details and a character count.
- Errors use `role="alert"` and take focus. A taken slot shows its banner
  inside the date and time card and keeps the other answers.

**Booking confirmed (08)**

- Unique title "You're booked", so the route announcement says it.
- Details are a description list.

**Appointments list (14) and detail (10)**

- Filters use `aria-pressed`. "Showing 10 of 16 upcoming visits" is announced
  when filters or Show more change the list.
- Each row's link names the whole visit for screen readers.
- Coming soon actions: real buttons with `aria-disabled="true"`, still focusable,
  named "Reschedule, Coming soon". Clicking shows how to make the change
  (`role="status"`). The badge keeps full color for contrast.

**Dialog (12, built for later)**

- Native `<dialog>` with `showModal()`: focus trap, Esc to close, page behind
  is inert, focus returns to the opener. Initial focus on the safe button.

**Not found (13)**

- Real 404 status. Another family's appointment looks the same as one that
  doesn't exist.

## Manual VoiceOver pass

Mac: Cmd+F5 turns VoiceOver on. Ctrl+Option+Right moves through the page.
Tab moves between controls. Safari works best with VoiceOver.

| #   | Do this                                | Expect to hear                                                      | Result  |
| --- | -------------------------------------- | ------------------------------------------------------------------- | ------- |
| 1   | Log in with a wrong password           | "We couldn't log you in" read right away                            | Pending |
| 2   | Log in, Tab once, press Enter          | Skip link, then main content                                        | Pending |
| 3   | On the dashboard, press the Leo button | "Leo, selected" and "Showing Leo"                                   | Pending |
| 4   | Next week arrows                       | New heading read, like "Leo's week of Oct 26"                       | Pending |
| 5   | Book: pick Maya, then Taylor           | Radio group named, "Your BCBA" read with Taylor                     | Pending |
| 6   | Arrow through the days                 | "Off" days read as off, open days by date                           | Pending |
| 7   | Tab to a "Set by care team" pill       | Explanation read after the button name                              | Pending |
| 8   | Book a visit                           | "You're booked" page announced                                      | Pending |
| 9   | Appointments: switch to Cancelled      | Count announcement, then the empty message                          | Pending |
| 10  | Detail: Tab to Reschedule, press it    | "Reschedule, Coming soon, dimmed", then the call-the-center message | Pending |

## Known gaps

- The VoiceOver pass above is manual and not yet recorded.
- No testing yet with NVDA or JAWS on Windows, or with TalkBack on Android.
- axe runs the WCAG 2.1 rule set. Two 2.2 criteria are covered by our own
  tests instead: focus not obscured (2.4.11) in `layout.spec.ts`, and target
  size (2.5.8), which holds because buttons and tiles are 36px or larger.

---

‹ [Architecture](architecture.md) · Next: [Design QA](design-qa.md) ›
