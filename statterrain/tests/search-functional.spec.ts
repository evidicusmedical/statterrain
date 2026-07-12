import { test, expect } from "@playwright/test";

const mkPayload = (strategy: string, match: any) => ({ status: "found", strategy, source: "U.S. Census Bureau", matches: [match] });
const addressPayload = mkPayload("street-address", { label: "1600 PENNSYLVANIA AVE NW, WASHINGTON, DC, 20500", latitude: 38.8977, longitude: -77.0365, state: "DC", geographyType: "address", source: "U.S. Census Bureau", limitations: [] });
const cityPayload = mkPayload("city-state", { label: "Washington city, DC", latitude: 38.9041, longitude: -77.0171, state: "DC", geographyType: "place", geographyId: "1150000", source: "U.S. Census Bureau", limitations: ["Place search uses a representative geographic point rather than a street address."] });
const zipPayload = mkPayload("zip", { label: "ZIP/ZCTA 20500", latitude: 38.8977, longitude: -77.0365, state: "DC", zip: "20500", geographyType: "zip", geographyId: "20500", source: "U.S. Census Bureau", limitations: ["ZIP search uses an area-derived reference point associated with the selected ZIP or ZCTA geography and does not represent a precise address."] });

async function openEvidence(page: any) {
  await page.getByRole("button", { name: /Evidence brief/i }).click();
}

test("full address search via Enter runs same-origin geocode, marker, facilities, and evidence", async ({ page }) => {
  let geocodeCalled = false;
  await page.route("**/api/geocode*", async (route) => { geocodeCalled = true; await route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify(addressPayload) }); });
  await page.goto("/");
  await page.getByTestId("location-search-input").fill("1600 Pennsylvania Avenue NW, Washington, DC");
  await page.getByTestId("location-search-input").press("Enter");
  await expect(page.getByTestId("location-search-status")).toContainText("Address found", { timeout: 15000 });
  expect(geocodeCalled).toBeTruthy();
  await expect(page.getByTestId("selected-planning-location")).toContainText("1600 PENNSYLVANIA");
  await expect(page.locator(".planning-location-marker")).toBeVisible();
  await expect(page.getByTestId("facility-results-count")).toBeVisible();
  await openEvidence(page);
  await expect(page.getByText(/Search strategy: street-address/)).toBeVisible();
});

test("city/state search returns place metadata and representative-point evidence", async ({ page }) => {
  let routeUrl = "";
  await page.route("**/api/geocode*", async (route) => { routeUrl = route.request().url(); await route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify(cityPayload) }); });
  await page.goto("/");
  await page.getByTestId("location-search-input").fill("Washington, DC");
  await page.getByTestId("location-search-input").press("Enter");
  await expect(page.getByTestId("location-search-status")).toContainText("City found", { timeout: 15000 });
  expect(routeUrl).toContain("/api/geocode");
  await expect(page.getByTestId("selected-planning-location")).toContainText("Washington city");
  await expect(page.locator(".planning-location-marker")).toBeVisible();
  await expect(page.getByTestId("facility-results-count")).toBeVisible();
  await openEvidence(page);
  await expect(page.getByText(/Search strategy: city-state/)).toBeVisible();
  await expect(page.getByText(/representative geographic point/)).toBeVisible();
});

test("ZIP search by button returns ZIP metadata and area limitation evidence", async ({ page }) => {
  await page.route("**/api/geocode*", async (route) => route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify(zipPayload) }));
  await page.goto("/");
  await page.getByTestId("location-search-input").fill("20500");
  await page.getByTestId("location-search-submit").click();
  await expect(page.getByTestId("location-search-status")).toContainText("ZIP area found", { timeout: 15000 });
  await expect(page.getByTestId("selected-planning-location")).toContainText("ZIP/ZCTA 20500");
  await expect(page.locator(".planning-location-marker")).toBeVisible();
  await expect(page.getByTestId("facility-results-count")).toBeVisible();
  await openEvidence(page);
  await expect(page.getByText(/Search strategy: zip/)).toBeVisible();
  await expect(page.getByText(/area-derived reference point/)).toBeVisible();
});

test("coordinate search resolves locally with no geocode request", async ({ page }) => {
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

test("invalid coordinates do not call API and preserve prior valid location", async ({ page }) => {
  let geocodeCalled = false;
  await page.route("**/api/geocode*", async (route) => { geocodeCalled = true; await route.abort(); });
  await page.goto("/");
  await page.getByTestId("location-search-input").fill("38.8977, -77.0365");
  await page.getByTestId("location-search-submit").click();
  await expect(page.getByTestId("selected-planning-location")).toContainText("38.8977");
  await page.getByTestId("location-search-input").fill("999, 999");
  await page.getByTestId("location-search-submit").click();
  await expect(page.getByTestId("location-search-status")).toContainText("Invalid coordinates");
  await expect(page.getByTestId("selected-planning-location")).toContainText("38.8977");
  expect(geocodeCalled).toBeFalsy();
});

test("ambiguous city asks for state and does not select arbitrary place", async ({ page }) => {
  await page.route("**/api/geocode*", async (route) => route.fulfill({ status: 400, contentType: "application/json", body: JSON.stringify({ status: "unsupported-query", strategy: "unsupported", matches: [], message: "Include a state with the city name." }) }));
  await page.goto("/");
  await page.getByTestId("location-search-input").fill("Springfield");
  await page.getByTestId("location-search-submit").click();
  await expect(page.getByTestId("location-search-status")).toContainText("Include a state with the city name.");
  await expect(page.getByTestId("selected-planning-location")).not.toBeVisible();
});
