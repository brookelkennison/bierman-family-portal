import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Page } from "@playwright/test";

/** WCAG 2.1 A and AA. Any violation fails the test, and so CI. */
async function expectNoViolations(page: Page) {
  const results = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
    .analyze();
  expect(
    results.violations.map((v) => `${v.id}: ${v.help} (${v.nodes.length})`),
  ).toEqual([]);
}

const pages = ["/", "/appointments", "/book", "/help", "/does-not-exist"];

for (const path of pages) {
  test(`axe: ${path}`, async ({ page }) => {
    await page.goto(path);
    await page.waitForLoadState("networkidle");
    await expectNoViolations(page);
  });
}

test("axe: appointment detail", async ({ page }) => {
  await page.goto("/appointments");
  await page.locator("article a").first().click();
  await expect(page).toHaveURL(/\/appointments\/[0-9a-f-]{36}$/);
  await expectNoViolations(page);
});

test("axe: dashboard with a child selected", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: /^Leo/ }).click();
  await expectNoViolations(page);
});

test("axe: booking with everything filled in", async ({ page }) => {
  await page.goto("/book");
  await page.getByRole("button", { name: /^Maya/ }).click();
  await page.getByText("Taylor Brooks, BCBA").click();
  await expectNoViolations(page);
});

test.describe("logged out", () => {
  test.use({ storageState: { cookies: [], origins: [] } });
  test("axe: login", async ({ page }) => {
    await page.goto("/login");
    await expectNoViolations(page);
  });
});
