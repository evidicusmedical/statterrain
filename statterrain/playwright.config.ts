import { defineConfig, devices } from "@playwright/test";

/**
 * Playwright configuration for StatTerrain smoke tests.
 *
 * Scope: a lightweight end-to-end smoke suite that verifies the critical
 * workflow (map load, filters, facility selection, evidence export,
 * responsive layout) does not silently break. This is intentionally not a
 * large or exhaustive test framework -- see docs/TESTING.md.
 */
export default defineConfig({
  testDir: "./tests",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: process.env.CI ? [["html", { open: "never" }], ["list"]] : "list",
  timeout: 30_000,
  use: {
    baseURL: "http://127.0.0.1:3100",
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
    ...devices["Desktop Chrome"],
  },
  webServer: {
    // The browser suite exercises the same production server that is shipped.
    // `npm run build` is intentionally a separate, conclusive release check.
    command: "npx next start -p 3100 -H 127.0.0.1",
    url: "http://127.0.0.1:3100/api/health",
    reuseExistingServer: !process.env.CI,
    timeout: 90_000,
  },
});
