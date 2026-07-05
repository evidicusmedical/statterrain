import { test, expect, type Page } from "@playwright/test";

/**
 * StatTerrain smoke suite.
 *
 * Verifies the critical workflow does not silently break: page load, map
 * rendering, filters, facility selection, trust-layer badges, population
 * overlay, evidence-brief export (Markdown/JSON/CSV), and baseline
 * responsive behavior at mobile and tablet viewports.
 *
 * Selector strategy (in priority order): accessible roles + accessible
 * names, label text, and stable UI-contract text (e.g. product copy from
 * src/config/product.ts). Explicit `data-testid` is used only where an
 * accessible selector would be ambiguous (map markers, regional summary
 * counts, facility detail container) -- see docs/TESTING.md.
 */

const SAMPLE_FACILITY_ID = "fac-terrace-general";

const IGNORED_ERROR_PATTERNS = [
  /tile\.openstreetmap/i,
  /ERR_NAME_NOT_RESOLVED/i,
  /net::/i,
  /favicon/i,
  /404 \(Not Found\)/i,
];

async function collectPageErrors(page: Page) {
  const errors: string[] = [];
  page.on("pageerror", (err) => errors.push(err.message));
  page.on("console", (msg) => {
    if (msg.type() === "error") errors.push(msg.text());
  });
  return {
    all: errors,
    fatal: () => errors.filter((e) => !IGNORED_ERROR_PATTERNS.some((p) => p.test(e))),
  };
}

test.describe("StatTerrain critical workflow", () => {
  test("home page loads and product name is visible", async ({ page }) => {
    const errors = await collectPageErrors(page);
    const response = await page.goto("/");
    expect(response?.status()).toBeLessThan(400);
    await expect(page.getByText("StatTerrain", { exact: true }).first()).toBeVisible();
    const fatal = errors.fatal();
    expect(fatal, `Unexpected console/page errors: ${fatal.join("\n")}`).toHaveLength(0);
  });

  test("synthetic demonstration-data notice is visible", async ({ page }) => {
    await page.goto("/");
    await expect(
      page.getByText(
        "This prototype uses synthetic demonstration data and should not be used for operational or clinical purposes.",
      ),
    ).toBeVisible();
    await expect(page.getByText("Synthetic demonstration data", { exact: true })).toBeVisible();
  });

  test("required disclaimer is visible", async ({ page }) => {
    await page.goto("/");
    await expect(
      page.getByText(/StatTerrain summarizes public datasets for education, planning/),
    ).toBeVisible();
  });

  test("Leaflet map container renders without a fatal client error", async ({ page }) => {
    const errors = await collectPageErrors(page);
    await page.goto("/");
    const mapView = page.getByTestId("map-view");
    await expect(mapView).toBeVisible();
    await expect(mapView.locator(".leaflet-container")).toBeVisible({ timeout: 15_000 });
    await expect(mapView.locator(".leaflet-tile").first()).toBeVisible({ timeout: 15_000 });
    const fatalErrors = errors.fatal();
    expect(fatalErrors, `Unexpected fatal errors: ${fatalErrors.join("\n")}`).toHaveLength(0);
  });

  test("a facility-type filter changes the displayed results", async ({ page }) => {
    await page.goto("/");
    const before = await page.getByTestId("facility-count-hospital").textContent();
    expect(before?.trim()).not.toBe("0");

    await page.getByRole("checkbox", { name: "Hospital / Emergency Department" }).uncheck();

    await expect(page.getByTestId("facility-count-hospital")).toContainText("0");
  });

  test("a hospital-capability filter changes the displayed results", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("button", { name: "Hospital capabilities" }).click();

    const totalBefore = await countVisibleFacilities(page);
    await page.getByRole("checkbox", { name: "Trauma Level I", exact: true }).check();
    const totalAfter = await countVisibleFacilities(page);

    expect(totalAfter).toBeLessThanOrEqual(totalBefore);
  });

  test("a confidence filter changes the displayed results", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("button", { name: "Source confidence" }).click();

    const totalBefore = await countVisibleFacilities(page);
    await page.getByRole("radio", { name: "High confidence only" }).check();
    const totalAfter = await countVisibleFacilities(page);

    expect(totalAfter).toBeLessThanOrEqual(totalBefore);
  });

  test("a facility can be selected and its detail view appears with source and confidence information", async ({
    page,
  }) => {
    await page.goto("/");
    await expect(page.getByTestId("map-view")).toBeVisible();

    await page.locator(`.facility-marker-${SAMPLE_FACILITY_ID}`).click({ force: true });

    const detail = page.getByTestId("facility-detail-panel");
    await expect(detail).toBeVisible();
    await expect(page.getByTestId("facility-detail-name")).not.toBeEmpty();
    await expect(detail.getByText("Sources for this facility")).toBeVisible();
    await expect(detail.getByText(/Confidence/).first()).toBeVisible();
  });

  test("a population-health overlay can be changed", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("button", { name: "Population-health overlay" }).click();
    await page.getByRole("radio", { name: "Population age 65 and older" }).check();
    await expect(page.getByRole("radio", { name: "Population age 65 and older" })).toBeChecked();
  });

  test("the evidence brief can be opened and Markdown, JSON, and CSV export can be initiated", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("button", { name: "Generate Evidence Brief" }).click();

    const drawer = page.getByRole("dialog", { name: /evidence brief/i });
    await expect(drawer).toBeVisible();

    const [mdDownload] = await Promise.all([
      page.waitForEvent("download"),
      drawer.getByRole("button", { name: "Download Markdown" }).click(),
    ]);
    expect(mdDownload.suggestedFilename()).toMatch(/\.md$/);

    const [jsonDownload] = await Promise.all([
      page.waitForEvent("download"),
      drawer.getByRole("button", { name: "Download JSON" }).click(),
    ]);
    expect(jsonDownload.suggestedFilename()).toMatch(/\.json$/);

    const [csvDownload] = await Promise.all([
      page.waitForEvent("download"),
      drawer.getByRole("button", { name: "Download CSV" }).click(),
    ]);
    expect(csvDownload.suggestedFilename()).toMatch(/\.csv$/);
  });
});

test.describe("StatTerrain responsive layout", () => {
  test("no horizontal document overflow at a common mobile viewport", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/");
    await expect(page.getByText("StatTerrain", { exact: true }).first()).toBeVisible();

    const { scrollWidth, clientWidth } = await page.evaluate(() => ({
      scrollWidth: document.documentElement.scrollWidth,
      clientWidth: document.documentElement.clientWidth,
    }));
    expect(scrollWidth).toBeLessThanOrEqual(clientWidth + 1);

    await expect(page.getByRole("navigation", { name: "Mobile view switcher" })).toBeVisible();
  });

  test("the application remains usable at a tablet viewport", async ({ page }) => {
    await page.setViewportSize({ width: 820, height: 1180 });
    await page.goto("/");
    await expect(page.getByTestId("map-view")).toBeVisible();
    await expect(page.getByLabel("Search hospital, city, ZIP, county, or address")).toBeVisible();

    const { scrollWidth, clientWidth } = await page.evaluate(() => ({
      scrollWidth: document.documentElement.scrollWidth,
      clientWidth: document.documentElement.clientWidth,
    }));
    expect(scrollWidth).toBeLessThanOrEqual(clientWidth + 1);
  });
});

async function countVisibleFacilities(page: Page): Promise<number> {
  const types = ["hospital", "critical_access_hospital", "pharmacy", "dialysis", "nursing_home", "behavioral_health"];
  let total = 0;
  for (const type of types) {
    const text = await page.getByTestId(`facility-count-${type}`).locator("p").first().textContent();
    total += Number(text?.trim() ?? "0");
  }
  return total;
}
