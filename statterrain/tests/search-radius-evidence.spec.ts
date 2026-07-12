import { test, expect } from "@playwright/test";

test("search radius evidence contract is present for deterministic geocoder workflow", async ({ page }) => {
  await page.route("https://geocoding.geo.census.gov/**", async (route) => {
    await route.fulfill({
      contentType: "application/json",
      body: JSON.stringify({
        result: {
          addressMatches: [
            {
              matchedAddress: "1600 PENNSYLVANIA AVE NW, WASHINGTON, DC, 20500",
              coordinates: { x: -77.0365, y: 38.8977 },
              addressComponents: { state: "DC" },
            },
          ],
        },
      }),
    });
  });
  await page.goto("/");
  await page.getByLabel(/Search address, ZIP, city\/state, or lat\/lon/i).fill("1600 Pennsylvania Ave NW, Washington, DC");
  await page.getByRole("button", { name: /^Search$/ }).click();
  await expect(page.locator('[data-testid="selected-location-badge"]')).toContainText("1600 PENNSYLVANIA");
  await expect(page.locator('[data-testid="map-view"]')).toBeVisible();
  await page.getByLabel("Radius value in miles").fill("12.5");
  await page.getByLabel("Radius value in miles").press("Enter");
  await expect(page.getByText("Selected planning radius: 12.5 miles").first()).toBeVisible();
  await page.getByRole("button", { name: "Generate Evidence Brief" }).click();
  await expect(page.locator("pre")).toContainText("Selected planning radius: 12.5 miles");
});
