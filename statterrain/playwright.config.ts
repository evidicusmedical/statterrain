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
    baseURL: "http://localhost:3000",
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
    ...devices["Desktop Chrome"],
  },
  webServer: {
    command: "npm run dev",
    url: "http://localhost:3000",
    reuseExistingServer: !process.env.CI,
    timeout: 60_000,
  },
});
