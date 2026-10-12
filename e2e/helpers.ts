import { expect, type Page } from "@playwright/test";

/** Seeded demo logins (scripts/seed.ts). Fake people, fake data. */
export const USERS = {
  jordan: "jordan@example.com", // Maya and Leo
  casey: "casey@example.com", // Ava, a different family
  jamie: "jamie@example.com", // no children yet
} as const;

export function demoPassword() {
  const password = process.env.DEMO_PASSWORD;
  if (!password) throw new Error("Set DEMO_PASSWORD (it's in .env.seed).");
  return password;
}

export async function logIn(page: Page, email: string) {
  await page.goto("/login");
  await page.getByLabel("Email").fill(email);
  await page.getByLabel("Password", { exact: true }).fill(demoPassword());
  await page.getByRole("button", { name: "Log in" }).click();
  await expect(page).toHaveURL("/");
}

export async function logOut(page: Page) {
  await page.getByRole("button", { name: /Account menu/ }).click();
  await page.getByRole("button", { name: "Log out" }).click();
  await expect(page).toHaveURL(/\/login/);
}
