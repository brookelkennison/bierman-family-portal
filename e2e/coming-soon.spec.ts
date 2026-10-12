import { expect, test } from "@playwright/test";

test("Coming soon buttons explain and send no request", async ({ page }) => {
  const writes: string[] = [];
  page.on("request", (r) => {
    if (["POST", "PATCH", "PUT", "DELETE"].includes(r.method())) {
      writes.push(`${r.method()} ${r.url()}`);
    }
  });

  await page.goto("/appointments");
  await page.locator("article a").first().click();
  await expect(page).toHaveURL(/\/appointments\/[0-9a-f-]{36}$/);

  const button = page
    .getByRole("button", { name: /Reschedule|Report absence/ })
    .first();
  await expect(button).toHaveAttribute("aria-disabled", "true");
  await expect(button).toContainText("Coming soon");
  await button.click();

  await expect(
    page
      .getByRole("status")
      .filter({ hasText: "Changing visits online is coming soon" }),
  ).toBeVisible();
  expect(writes).toEqual([]);
});
