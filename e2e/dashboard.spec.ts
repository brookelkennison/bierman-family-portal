import { expect, test } from "@playwright/test";
import { logIn, USERS } from "./helpers";

test("switching kids filters the dashboard", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByText("Showing all kids")).toBeVisible();

  await page.getByRole("button", { name: /^Leo/ }).click();
  await expect(page.getByText("Showing Leo")).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "Leo's care plan" }),
  ).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "Leo's appointments" }),
  ).toBeVisible();
  // Nothing of Maya's is listed while Leo is selected.
  await expect(page.locator("article", { hasText: "for Maya" })).toHaveCount(0);

  await page.getByRole("button", { name: /^All kids/ }).click();
  await expect(page.getByText("Showing all kids")).toBeVisible();
});

test("a parent with no children sees the empty state", async ({ browser }) => {
  const context = await browser.newContext({
    storageState: { cookies: [], origins: [] },
  });
  const page = await context.newPage();
  await logIn(page, USERS.jamie);
  await expect(
    page.getByRole("heading", {
      name: "No children are linked to your account yet",
    }),
  ).toBeVisible();
  await context.close();
});
