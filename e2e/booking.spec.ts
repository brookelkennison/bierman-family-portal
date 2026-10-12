import { expect, test } from "@playwright/test";

test("book parent training and find it in the list", async ({ page }) => {
  await page.goto("/book");

  await page.getByRole("button", { name: /^Maya/ }).click();
  await page.getByText("Taylor Brooks, BCBA").click();

  // The page jumps to the first week with an open time; take the first one.
  const firstOpen = page.locator('input[name="time"]:enabled').first();
  await expect(firstOpen).toBeAttached();
  await firstOpen.locator("xpath=..").click();

  await page.getByLabel(/Notes for Taylor/).fill("E2E: bedtime routine ideas");
  await page.getByRole("button", { name: "Book visit" }).click();

  await expect(
    page.getByRole("heading", { name: "You're booked!" }),
  ).toBeVisible();
  const id = page.url().split("/").pop()!;
  expect(id).toMatch(/^[0-9a-f-]{36}$/);

  // It shows up on the appointments list for Maya, marked as booked by you.
  await page.goto("/appointments");
  await page.getByRole("button", { name: /^Maya/ }).click();
  const link = page.locator(`a[href="/appointments/${id}"]`);
  for (let i = 0; i < 6 && (await link.count()) === 0; i++) {
    await page.getByRole("button", { name: "Show more" }).click();
  }
  const row = page.locator("article", { has: link });
  await expect(row).toBeVisible();
  await expect(row.getByText("Booked by you")).toBeVisible();

  // And its detail page has the note.
  await link.click();
  await expect(page.getByText("E2E: bedtime routine ideas")).toBeVisible();
});

test("the booking API rejects bad input with 422", async ({ page }) => {
  await page.goto("/");
  const status = await page.evaluate(async () => {
    const res = await fetch("/api/appointments", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ patientId: "maya", providerId: "taylor" }),
    });
    return res.status;
  });
  expect(status).toBe(422);
});
