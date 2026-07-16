import { expect, test } from "@playwright/test";

test.describe("production browser readiness", () => {
  test("health endpoint is a minimal safe readiness response", async ({
    request,
  }) => {
    const response = await request.get("/api/health");
    expect(response.ok()).toBeTruthy();
    expect(await response.json()).toEqual({
      status: "ok",
      product: "StatTerrain",
      version: "v0.3.8.6 prototype",
    });
  });

  test("area summary publishes concise accessible data status", async ({
    page,
  }) => {
    await page.goto("/");
    const status = page.getByTestId("data-status");
    await expect(status).toHaveAttribute("role", "status");
    await expect(status).toHaveAttribute("aria-live", "polite");
    await expect(status).not.toContainText(/live/i);
  });
});
