import { test as setup } from "@playwright/test";
import { logIn, USERS } from "./helpers";

/** Log in once as Jordan and reuse the session in every other test. */
setup("log in as Jordan", async ({ page }) => {
  await logIn(page, USERS.jordan);
  await page.context().storageState({ path: "e2e/.auth/jordan.json" });
});
