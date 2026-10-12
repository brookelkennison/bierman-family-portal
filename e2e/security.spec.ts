import { expect, test } from "@playwright/test";
import { logIn, USERS } from "./helpers";

test("another family's appointment is a 404", async ({ browser, page }) => {
  // Casey's family (Ava) is separate from Jordan's.
  const casey = await browser.newContext({
    storageState: { cookies: [], origins: [] },
  });
  const caseyPage = await casey.newPage();
  await logIn(caseyPage, USERS.casey);
  await caseyPage.goto("/appointments");
  const href = await caseyPage
    .locator("article a")
    .first()
    .getAttribute("href");
  await casey.close();
  expect(href).toMatch(/^\/appointments\/[0-9a-f-]{36}$/);

  // Jordan opens Casey's link.
  await page.goto(href!);
  await expect(
    page.getByRole("heading", { name: "We couldn't find that page" }),
  ).toBeVisible();
  // Whole word: a plain "Ava" match also hits "available" in the 404 text.
  await expect(page.getByText(/\bAva\b/)).toHaveCount(0);
});

test("unknown pages show the 404 inside the app", async ({ page }) => {
  const res = await page.goto("/does-not-exist");
  expect(res?.status()).toBe(404);
  await expect(
    page.getByRole("heading", { name: "We couldn't find that page" }),
  ).toBeVisible();
  await expect(page.getByRole("link", { name: "Go to home" })).toBeVisible();
});
