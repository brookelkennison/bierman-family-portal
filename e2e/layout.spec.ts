import { expect, test, type Page } from "@playwright/test";

/*
 * Checks a person can do by hand but tends to skip: reflow at small widths
 * and high zoom, keyboard-only use, focus never hidden under the sticky
 * header, and reduced motion.
 */

const pages = ["/", "/appointments", "/book", "/help"];

async function horizontalOverflow(page: Page) {
  return page.evaluate(
    () => document.documentElement.scrollWidth - window.innerWidth,
  );
}

// 320px wide is WCAG 1.4.10 Reflow, and the same layout width as 400% zoom
// on a 1280px screen. 640px is 200% zoom.
for (const width of [320, 640]) {
  for (const path of pages) {
    test(`no sideways scrolling at ${width}px: ${path}`, async ({ page }) => {
      await page.setViewportSize({ width, height: 800 });
      await page.goto(path);
      await page.waitForLoadState("networkidle");
      expect(await horizontalOverflow(page)).toBeLessThanOrEqual(0);
    });
  }
}

test("no sideways scrolling at 320px on login", async ({ browser }) => {
  const context = await browser.newContext({
    storageState: { cookies: [], origins: [] },
    viewport: { width: 320, height: 800 },
  });
  const page = await context.newPage();
  await page.goto("/login");
  expect(await horizontalOverflow(page)).toBeLessThanOrEqual(0);
  await context.close();
});

test("skip link is the first stop and jumps to the main content", async ({
  page,
}) => {
  await page.goto("/");
  await page.keyboard.press("Tab");
  const skip = page.getByRole("link", { name: /skip to/i });
  await expect(skip).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(page.locator("main#main")).toBeFocused();
});

test("focus is always visible and never hidden under the header", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1280, height: 640 });
  await page.goto("/appointments");
  const headerBottom = await page
    .locator("header")
    .first()
    .evaluate((h) => h.getBoundingClientRect().bottom);

  for (let i = 0; i < 25; i++) {
    await page.keyboard.press("Tab");
    const info = await page.evaluate(() => {
      const el = document.activeElement as HTMLElement | null;
      if (!el || el === document.body) return null;
      const rect = el.getBoundingClientRect();
      const style = getComputedStyle(el);
      return {
        // The header itself, and things pinned above it (the skip link),
        // can't be covered by the header.
        inHeader: Boolean(el.closest("header")) || style.position === "fixed",
        top: rect.top,
        outline: style.outlineStyle !== "none" && style.outlineWidth !== "0px",
        label: el.textContent?.trim().slice(0, 40) ?? el.tagName,
      };
    });
    if (!info) continue;
    expect(info.outline, `focus ring on "${info.label}"`).toBe(true);
    if (!info.inHeader) {
      expect(
        info.top,
        `"${info.label}" under the header`,
      ).toBeGreaterThanOrEqual(headerBottom);
    }
  }
});

test("booking works with the keyboard alone", async ({ page }) => {
  await page.goto("/book");

  // Child: KidBubble buttons.
  await page.getByRole("button", { name: /^Maya/ }).focus();
  await page.keyboard.press("Enter");

  // Provider: a radio group, so Space selects the focused option.
  await page.getByRole("radio", { name: /Taylor Brooks/ }).focus();
  await page.keyboard.press("Space");
  await expect(
    page.getByRole("radio", { name: /Taylor Brooks/ }),
  ).toBeChecked();

  // Time: first open slot, picked with Space.
  const firstOpen = page.locator('input[name="time"]:enabled').first();
  await firstOpen.focus();
  await page.keyboard.press("Space");
  await expect(firstOpen).toBeChecked();

  // The Book button is reachable and enabled. (Not pressed: the booking
  // test in booking.spec.ts covers saving.)
  const book = page.getByRole("button", { name: "Book visit" });
  await book.focus();
  await expect(book).toBeFocused();
  await expect(book).toBeEnabled();
});

test("reduced motion turns animations and transitions off", async ({
  browser,
}) => {
  const context = await browser.newContext({
    storageState: "e2e/.auth/jordan.json",
    reducedMotion: "reduce",
  });
  const page = await context.newPage();
  await page.goto("/");
  const moving = await page.evaluate(
    () =>
      [...document.querySelectorAll<HTMLElement>("*")]
        .map((el) => getComputedStyle(el))
        .filter(
          (s) =>
            parseFloat(s.animationDuration) > 0.01 ||
            parseFloat(s.transitionDuration) > 0.01,
        ).length,
  );
  expect(moving).toBe(0);
  await context.close();
});
