import { test } from "@playwright/test";

/*
 * Saves desktop and mobile screenshots of each page to docs/screenshots for
 * the README and the Figma comparison in docs/design-qa.md.
 * Skipped unless SCREENSHOTS=1, so normal runs stay fast:
 *   pnpm seed && pnpm screenshots
 */
test.skip(!process.env.SCREENSHOTS, "Set SCREENSHOTS=1 to save screenshots");

const sizes = [
  { name: "desktop", width: 1440, height: 900 },
  { name: "mobile", width: 390, height: 844 },
];

const shots: { name: string; path: string; prepare?: string }[] = [
  { name: "03-dashboard", path: "/" },
  { name: "03b-dashboard-leo", path: "/", prepare: "leo" },
  { name: "06-book", path: "/book", prepare: "book" },
  { name: "14-appointments", path: "/appointments" },
  { name: "10-appointment-detail", path: "/appointments", prepare: "detail" },
  { name: "13-not-found", path: "/does-not-exist" },
  { name: "help", path: "/help" },
];

for (const size of sizes) {
  for (const shot of shots) {
    test(`${shot.name} ${size.name}`, async ({ page }) => {
      await page.setViewportSize({ width: size.width, height: size.height });
      await page.goto(shot.path);
      if (shot.prepare === "leo") {
        await page.getByRole("button", { name: /^Leo/ }).click();
      }
      if (shot.prepare === "book") {
        await page.getByRole("button", { name: /^Maya/ }).click();
        await page.getByText("Taylor Brooks, BCBA").click();
        await page
          .locator('input[name="time"]:enabled')
          .first()
          .locator("xpath=..")
          .click();
      }
      if (shot.prepare === "detail") {
        await page.locator("article a").first().click();
        await page.waitForURL(/\/appointments\/[0-9a-f-]{36}$/);
      }
      await page.waitForLoadState("networkidle");
      await page.screenshot({
        path: `docs/screenshots/${shot.name}-${size.name}.png`,
        fullPage: true,
      });
    });
  }
}

test.describe("logged out", () => {
  test.use({ storageState: { cookies: [], origins: [] } });
  for (const size of sizes) {
    test(`01-login ${size.name}`, async ({ page }) => {
      await page.setViewportSize({ width: size.width, height: size.height });
      await page.goto("/login");
      await page.screenshot({
        path: `docs/screenshots/01-login-${size.name}.png`,
        fullPage: true,
      });
    });
  }
});
