import { expect, test } from "@playwright/test";
import { demoPassword, logIn, logOut, USERS } from "./helpers";

test.describe("logged out", () => {
  test.use({ storageState: { cookies: [], origins: [] } });

  test("log in and log out", async ({ page }) => {
    await logIn(page, USERS.jordan);
    await expect(
      page.getByRole("heading", {
        level: 1,
        name: /Good (morning|afternoon|evening), Jordan/,
      }),
    ).toBeVisible();
    await logOut(page);
    await page.goto("/");
    await expect(page).toHaveURL(/\/login/);
  });

  test("a wrong password shows the generic error", async ({ page }) => {
    await page.goto("/login");
    await page.getByLabel("Email").fill(USERS.jordan);
    await page.getByLabel("Password", { exact: true }).fill("not-the-password");
    await page.getByRole("button", { name: "Log in" }).click();
    const alert = page
      .getByRole("alert")
      .filter({ hasText: "We couldn't log you in" });
    await expect(alert).toBeVisible();
    // Same message whether or not the email exists.
    await page.getByLabel("Email").fill("nobody@example.com");
    await page.getByLabel("Password", { exact: true }).fill(demoPassword());
    await page.getByRole("button", { name: "Log in" }).click();
    await expect(alert).toBeVisible();
  });

  test("the API answers 401 when logged out", async ({ request }) => {
    const res = await request.get("/api/appointments");
    expect(res.status()).toBe(401);
    expect(await res.json()).toEqual({ error: "not_signed_in" });
  });

  test("sign-up is turned off in Supabase Auth", async ({ request }) => {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!;
    const res = await request.post(`${url}/auth/v1/signup`, {
      headers: { apikey: key, "content-type": "application/json" },
      data: { email: "e2e-signup@example.com", password: "Not-a-real-1!" },
    });
    expect(res.ok()).toBe(false);
  });
});

test("security headers are on every page", async ({ page }) => {
  const res = await page.goto("/");
  const headers = res!.headers();
  expect(headers["content-security-policy"]).toContain(
    "script-src 'self' 'nonce-",
  );
  expect(headers["x-frame-options"]).toBe("DENY");
  expect(headers["x-content-type-options"]).toBe("nosniff");
  expect(headers["referrer-policy"]).toBe("no-referrer");
  expect(headers["strict-transport-security"]).toContain("max-age=");
  expect(headers["cache-control"]).toContain("no-store");
});
