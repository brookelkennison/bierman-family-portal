import { defineConfig, devices } from "@playwright/test";

/*
 * End-to-end tests against a production build (`next start`), so the real
 * CSP, headers, and caching are what get tested.
 *
 * Locally this uses .env.local (hosted Supabase) and DEMO_PASSWORD from
 * .env.seed. In CI it runs against a throwaway local Supabase that the
 * workflow starts and seeds first.
 */
for (const file of [".env.local", ".env.seed"]) {
  try {
    process.loadEnvFile(file);
  } catch {
    // Missing locally is fine in CI, where the workflow sets the env.
  }
}

const PORT = 3100;

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: false,
  workers: 1,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? [["github"], ["list"]] : "list",
  use: {
    baseURL: `http://localhost:${PORT}`,
    trace: "retain-on-failure",
  },
  projects: [
    { name: "setup", testMatch: /auth\.setup\.ts/ },
    {
      name: "chromium",
      use: {
        ...devices["Desktop Chrome"],
        storageState: "e2e/.auth/jordan.json",
      },
      dependencies: ["setup"],
    },
  ],
  webServer: {
    command: `pnpm build && pnpm start -p ${PORT}`,
    url: `http://localhost:${PORT}/login`,
    reuseExistingServer: !process.env.CI,
    timeout: 180_000,
  },
});
