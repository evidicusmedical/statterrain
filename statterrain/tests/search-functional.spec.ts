import { test, expect } from "@playwright/test";

const addressPayload = { status: "found", source: "U.S. Census Geocoder", matches: [{ label: "1600 PENNSYLVANIA AVE NW, WASHINGTON, DC, 20500", latitude: 38.8977, longitude: -77.0365, state: "DC" }] };

test("address search via Enter runs same-origin geocode, recenters, analyzes radius, and populates evidence", async ({ page }) => {
  let geocodeCalled = false;
  await page.route("**/api/geocode*", async (route) => { geocodeCalled = true; await route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify(addressPayload) }); });
  await page.goto("/");
  await page.getByTestId("location-search-input").fill("1600 Pennsylvania Avenue NW, Washington, DC");
  await page.getByTestId("location-search-input").press("Enter");
  await expect(page.getByTestId("location-search-status")).toContainText("Location found", { timeout: 15000 });
  expect(geocodeCalled).toBeTruthy();
  await expect(page.getByTestId("selected-planning-location")).toContainText("1600 PENNSYLVANIA");
  await expect(page.locator(".planning-location-marker")).toBeVisible();
  await expect(page.getByTestId("facility-results-count")).toBeVisible();
  await page.getByLabel("Radius value in miles").fill("50");
  await page.getByLabel("Radius value in miles").press("Enter");
  await expect(page.getByTestId("selected-planning-location")).toContainText("Radius 50 mi");
  await page.getByRole("button", { name: /Evidence brief/i }).click();
  await expect(page.getByText(/1600 PENNSYLVANIA/)).toBeVisible();
  await expect(page.getByText(/50 miles/)).toBeVisible();
});

test("coordinate search clicks submit without geocode request", async ({ page }) => {
  let geocodeCalled = false;
  await page.route("**/api/geocode*", async (route) => { geocodeCalled = true; await route.abort(); });
  await page.goto("/");
  await page.getByTestId("location-search-input").fill("38.8977, -77.0365");
  await page.getByTestId("location-search-submit").click();
  await expect(page.getByTestId("selected-planning-location")).toContainText("38.8977");
  await expect(page.locator(".planning-location-marker")).toBeVisible();
  await expect(page.getByTestId("facility-results-count")).toBeVisible();
  expect(geocodeCalled).toBeFalsy();
});

test("geocoder failure shows clear error and preserves prior planning location", async ({ page }) => {
  await page.route("**/api/geocode*", async (route) => route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify(addressPayload) }));
  await page.goto("/");
  await page.getByTestId("location-search-input").fill("1600 Pennsylvania Avenue NW, Washington, DC");
  await page.getByTestId("location-search-input").press("Enter");
  await expect(page.getByTestId("selected-planning-location")).toContainText("1600 PENNSYLVANIA");
  await page.unroute("**/api/geocode*");
  await page.route("**/api/geocode*", async (route) => route.fulfill({ status: 502, contentType: "application/json", body: JSON.stringify({ status: "upstream-unavailable", matches: [], source: "U.S. Census Geocoder" }) }));
  await page.getByTestId("location-search-input").fill("clearly invalid text");
  await page.getByTestId("location-search-submit").click();
  await expect(page.getByTestId("location-search-status")).toContainText("Search service unavailable");
  await expect(page.getByTestId("selected-planning-location")).toContainText("1600 PENNSYLVANIA");
});
