import { test, expect, type Page } from "@playwright/test";

/**
 * StatTerrain smoke suite.
 *
 * Verifies the critical workflow does not silently break: page load, map
 * rendering, display filters, facility selection, trust-layer badges, default no population
 * overlay, evidence-brief scope, evidence-brief export (Markdown/JSON/CSV), and baseline
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
    fatal: () =>
      errors.filter((e) => !IGNORED_ERROR_PATTERNS.some((p) => p.test(e))),
  };
}

test.describe("StatTerrain critical workflow", () => {
  test("home page loads and product version is visible", async ({ page }) => {
    const errors = await collectPageErrors(page);
    const response = await page.goto("/");
    expect(response?.status()).toBeLessThan(400);
    await expect(
      page.getByText("StatTerrain", { exact: true }).first(),
    ).toBeVisible();
    await expect(page.getByText("v0.2.2 prototype")).toBeVisible();
    const fatal = errors.fatal();
    expect(
      fatal,
      `Unexpected console/page errors: ${fatal.join("\n")}`,
    ).toHaveLength(0);
  });

  test("synthetic demonstration-data notice is visible", async ({ page }) => {
    await page.goto("/");
    await expect(
      page.getByText(
        "Synthetic demonstration data — not a real-world source. Do not use for operational or clinical purposes.",
      ),
    ).toBeVisible();
    await expect(
      page.getByText("Synthetic demonstration data", { exact: true }),
    ).toBeVisible();
  });

  test("required disclaimer is visible", async ({ page }) => {
    await page.goto("/");
    await expect(
      page.getByText(
        /Planning prototype only.*not for clinical care.*synthetic demonstration data only.*official sources/,
      ),
    ).toBeVisible();
  });

  test("Leaflet map container renders without a fatal client error", async ({
    page,
  }) => {
    const errors = await collectPageErrors(page);
    await page.goto("/");
    const mapView = page.getByTestId("map-view");
    await expect(mapView).toBeVisible();
    await expect(mapView.locator(".leaflet-container")).toBeVisible({
      timeout: 15_000,
    });
    await expect(mapView.locator(".leaflet-tile").first()).toBeVisible({
      timeout: 15_000,
    });
    const fatalErrors = errors.fatal();
    expect(
      fatalErrors,
      `Unexpected fatal errors: ${fatalErrors.join("\n")}`,
    ).toHaveLength(0);
  });

  test("all facility categories and no population overlay are selected by default", async ({
    page,
  }) => {
    await page.goto("/");
    for (const name of [
      "Hospital / Emergency Department",
      "Critical Access Hospital",
      "Pharmacy",
      "Dialysis Center",
      "Skilled Nursing Facility",
      "Behavioral Health Facility",
    ]) {
      await expect(page.getByRole("checkbox", { name })).toBeChecked();
    }
    await page
      .getByRole("button", { name: "Population-health overlay" })
      .click();
    await expect(page.getByRole("radio", { name: "None" })).toBeChecked();
  });

  test("a facility-type display filter changes the displayed results", async ({
    page,
  }) => {
    await page.goto("/");
    const before = await page
      .getByTestId("facility-count-hospital")
      .textContent();
    expect(before?.trim()).not.toBe("0");

    await page
      .getByRole("checkbox", { name: "Hospital / Emergency Department" })
      .uncheck();

    await expect(page.getByTestId("facility-count-hospital")).toContainText(
      "0",
    );
  });

  test("a hospital-capability filter changes the displayed results", async ({
    page,
  }) => {
    await page.goto("/");
    await page.getByRole("button", { name: "Hospital capabilities" }).click();

    const totalBefore = await countVisibleFacilities(page);
    await page
      .getByRole("checkbox", { name: "Trauma Level I", exact: true })
      .check();
    const totalAfter = await countVisibleFacilities(page);

    expect(totalAfter).toBeLessThanOrEqual(totalBefore);
  });

  test("a confidence filter changes the displayed results", async ({
    page,
  }) => {
    await page.goto("/");
    await page
      .getByRole("button", { name: "Source confidence display" })
      .click();

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

    await page
      .locator(`.facility-marker-${SAMPLE_FACILITY_ID}`)
      .click({ force: true });

    const detail = page.getByTestId("facility-detail-panel");
    await expect(detail).toBeVisible();
    await expect(page.getByTestId("facility-detail-name")).not.toBeEmpty();
    for (const heading of [
      "Facility identity",
      "Capability summary",
      "Contact and access information",
      "Source and data quality",
      "Known limitations",
    ]) {
      await expect(
        detail.getByRole("heading", { name: heading }),
      ).toBeVisible();
    }
    await expect(
      detail
        .getByText("Synthetic demonstration data — not a real-world source.")
        .first(),
    ).toBeVisible();
    await expect(
      detail.getByText("Not available in current source").first(),
    ).toBeVisible();
    await expect(
      detail.getByText("Missing public data is not absence of capability"),
    ).toBeVisible();
    await expect(detail.getByText(/Confidence/).first()).toBeVisible();

    await detail.getByText(/What this means:/).click();
    await expect(
      detail.getByText("Plain-language meaning:").first(),
    ).toBeVisible();

    await detail.getByText("Hospital capability glossary").click();
    await expect(detail.getByText(/Emergency department:/)).toBeVisible();
  });

  test("population metric definitions, freshness inventory, base-map note, and feedback workflow are accessible", async ({
    page,
  }) => {
    await page.goto("/");

    await expect(page.getByText(/Quick read:/).first()).toBeVisible();
    await expect(
      page.getByRole("button", { name: "Show plain-language meaning" }).first(),
    ).toHaveAttribute("aria-expanded", "false");
    await expect(page.getByLabel("Age 65+ plain-language meaning")).toHaveCount(
      0,
    );

    await page
      .getByRole("button", { name: "Show plain-language meaning" })
      .nth(1)
      .click();
    await expect(
      page.getByLabel("Pediatric plain-language meaning"),
    ).toBeVisible();
    await expect(
      page.getByText(
        /Real data must state the exact age range used, such as ages 0–17/i,
      ),
    ).toBeVisible();

    await page
      .getByRole("button", { name: "Show plain-language meaning" })
      .nth(1)
      .click();
    await expect(
      page.getByLabel("Pediatric plain-language meaning"),
    ).toHaveCount(0);
    await expect(
      page.getByLabel("Poverty plain-language meaning"),
    ).toBeVisible();
    await expect(
      page.getByText(
        /More people may face barriers to medications, transportation, follow-up care, food, housing, and emergency recovery/i,
      ),
    ).toBeVisible();

    await page
      .getByRole("button", { name: "Show plain-language meaning" })
      .nth(8)
      .click();
    await expect(page.getByLabel("Poverty plain-language meaning")).toHaveCount(
      0,
    );
    await expect(page.getByLabel("SVI plain-language meaning")).toBeVisible();
    await expect(
      page.getByText(/not a crime score, danger score, clinical-risk score/i),
    ).toBeVisible();

    await page
      .getByRole("button", { name: "Hide plain-language meaning" })
      .click();
    await expect(page.getByLabel("SVI plain-language meaning")).toHaveCount(0);

    await page
      .getByRole("button", { name: "Source details and technical note" })
      .first()
      .click();
    await expect(
      page.getByText(/Synthetic demonstration value only/).first(),
    ).toBeVisible();

    await expect(
      page.getByRole("heading", {
        name: "Data freshness and source inventory",
      }),
    ).toBeVisible();
    await expect(
      page.getByText("No public-data refresh is active in this prototype."),
    ).toBeVisible();

    await expect(page.getByText(/Base map: OpenStreetMap/)).toBeVisible();

    const feedback = page.getByRole("link", { name: "Send Feedback" }).first();
    await expect(feedback).toBeVisible();
    await expect(feedback).toHaveAttribute(
      "href",
      /mailto:mathew\.h\.lowe\+statterrain@gmail\.com\?subject=StatTerrain%20Beta%20Feedback&body=.*App%3A%20StatTerrain.*Version%3A%20v0.2.0%20prototype.*Selected%20geography/,
    );

    await page.getByRole("button", { name: "Generate Evidence Brief" }).click();
    const briefDialog = page.getByRole("dialog", { name: /evidence brief/i });
    await expect(briefDialog.locator("pre")).toContainText(
      "Population metrics are synthetic demonstration values in this prototype",
    );
    await expect(briefDialog.locator("pre")).toContainText(
      "How to read these metrics",
    );
    await expect(briefDialog.locator("pre")).toContainText("Higher means");
    await expect(
      briefDialog.getByRole("link", { name: "Send Feedback" }),
    ).toHaveCount(0);
    await expect(
      briefDialog.getByRole("button", { name: "Copy feedback context" }),
    ).toHaveCount(0);
  });

  test("desktop map legend is discoverable and collapsible", async ({
    page,
  }) => {
    await page.goto("/");
    await expect(page.getByRole("heading", { name: "Legend" })).toBeVisible();
    await page.getByRole("button", { name: "Hide legend" }).click();
    await expect(page.getByRole("heading", { name: "Legend" })).toHaveCount(0);
    await expect(
      page.getByRole("button", { name: "Show map legend" }),
    ).toBeVisible();
    await page.getByRole("button", { name: "Show map legend" }).click();
    await expect(page.getByRole("heading", { name: "Legend" })).toBeVisible();
  });

  test("a population-health overlay can be changed", async ({ page }) => {
    await page.goto("/");
    await page
      .getByRole("button", { name: "Population-health overlay" })
      .click();
    await page
      .getByRole("radio", { name: "Population age 65 and older" })
      .check();
    await expect(
      page.getByRole("radio", { name: "Population age 65 and older" }),
    ).toBeChecked();
  });

  test("summary column can collapse and restore while the map remains available", async ({
    page,
  }) => {
    await page.goto("/");
    await expect(
      page.getByRole("region", { name: "Regional summary" }),
    ).toBeVisible();
    await page.getByRole("button", { name: "Hide summary" }).click();
    await expect(
      page.getByRole("region", { name: "Regional summary" }),
    ).toHaveCount(0);
    await expect(page.getByTestId("map-view")).toBeVisible();
    await expect(
      page.getByText(
        "Show summary to review facilities and population context.",
      ),
    ).toBeVisible();
    await page.getByRole("button", { name: "Show summary" }).click();
    await expect(
      page.getByRole("region", { name: "Regional summary" }),
    ).toBeVisible();
    await expect(
      page.getByRole("heading", {
        name: "Data freshness and source inventory",
      }),
    ).toBeVisible();
  });

  test("the evidence brief opens above the map and keeps hidden facility categories in scope", async ({
    page,
  }) => {
    await page.goto("/");
    await page.getByRole("checkbox", { name: "Pharmacy" }).uncheck();
    await expect(page.getByTestId("facility-count-pharmacy")).toContainText(
      "0",
    );
    await page.getByRole("button", { name: "Generate Evidence Brief" }).click();

    const drawer = page.getByRole("dialog", { name: /evidence brief/i });
    await expect(drawer).toBeVisible();
    await expect(
      drawer.getByText(
        /Brief scope: This evidence brief includes all available facility categories/,
      ),
    ).toBeVisible();
    await expect(drawer.locator("pre")).toContainText("- Pharmacy: 1");

    const stacking = await page.evaluate(() => {
      const dialog = document.querySelector('[role="dialog"]');
      const pane = document.querySelector(".leaflet-pane");
      return {
        dialogZ: dialog
          ? Number.parseInt(
              getComputedStyle(dialog.parentElement ?? dialog).zIndex || "0",
              10,
            )
          : 0,
        paneZ: pane
          ? Number.parseInt(getComputedStyle(pane).zIndex || "0", 10)
          : 0,
      };
    });
    expect(stacking.dialogZ).toBeGreaterThan(stacking.paneZ);

    const markdownButton = drawer.getByRole("button", {
      name: "Download Markdown",
    });
    const jsonButton = drawer.getByRole("button", { name: "Download JSON" });
    const csvButton = drawer.getByRole("button", { name: "Download CSV" });
    const copyButton = drawer.getByRole("button", { name: "Copy Markdown" });
    await expect(markdownButton).toHaveAttribute("aria-pressed", "false");
    await expect(jsonButton).toHaveAttribute("aria-pressed", "false");
    await expect(csvButton).toHaveAttribute("aria-pressed", "false");

    const [mdDownload] = await Promise.all([
      page.waitForEvent("download"),
      markdownButton.click(),
    ]);
    expect(mdDownload.suggestedFilename()).toMatch(/\.md$/);
    await expect(markdownButton).toHaveAttribute("aria-pressed", "true");
    await expect(jsonButton).toHaveAttribute("aria-pressed", "false");

    const [jsonDownload] = await Promise.all([
      page.waitForEvent("download"),
      jsonButton.click(),
    ]);
    expect(jsonDownload.suggestedFilename()).toMatch(/\.json$/);
    await expect(jsonButton).toHaveAttribute("aria-pressed", "true");
    await expect(markdownButton).toHaveAttribute("aria-pressed", "false");

    const [csvDownload] = await Promise.all([
      page.waitForEvent("download"),
      csvButton.click(),
    ]);
    expect(csvDownload.suggestedFilename()).toMatch(/\.csv$/);
    await expect(csvButton).toHaveAttribute("aria-pressed", "true");
    await expect(jsonButton).toHaveAttribute("aria-pressed", "false");

    await copyButton.click();
    await expect(
      drawer.getByRole("button", { name: /Copied!|Copy Markdown/ }),
    ).toHaveAttribute("aria-pressed", "true");
  });
});

test.describe("StatTerrain responsive layout", () => {
  test("mobile tabs contain map panes below a solid tab bar and attribution stays in the map", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/");
    const tabs = page.getByTestId("mobile-workspace-tabs");
    await expect(tabs).toBeVisible();
    await expect(page.getByTestId("mobile-tab-map")).toBeVisible();
    await expect(page.getByTestId("mobile-tab-summary")).toBeVisible();
    await expect(page.getByTestId("mobile-tab-facility")).toBeVisible();

    const tabStyles = await tabs.evaluate((node) => {
      const styles = getComputedStyle(node);
      return { backgroundColor: styles.backgroundColor, zIndex: styles.zIndex };
    });
    expect(tabStyles.backgroundColor).toBe("rgb(255, 255, 255)");
    expect(Number(tabStyles.zIndex)).toBeGreaterThan(10);

    const overlap = await page.evaluate(() => {
      const tabs = document.querySelector('[data-testid="mobile-workspace-tabs"]');
      const map = document.querySelector('[data-testid="map-view"]');
      const attribution = document.querySelector(".leaflet-control-attribution");
      const pane = document.querySelector(".leaflet-pane");
      if (!tabs || !map || !attribution || !pane) return null;
      const tabsBox = tabs.getBoundingClientRect();
      const mapBox = map.getBoundingClientRect();
      const attributionBox = attribution.getBoundingClientRect();
      return {
        mapBottom: mapBox.bottom,
        tabsTop: tabsBox.top,
        attributionBottom: attributionBox.bottom,
        paneZ: Number.parseInt(getComputedStyle(pane).zIndex || "0", 10),
        tabsZ: Number.parseInt(getComputedStyle(tabs).zIndex || "0", 10),
      };
    });
    expect(overlap).not.toBeNull();
    expect(overlap!.mapBottom).toBeLessThanOrEqual(overlap!.tabsTop + 1);
    expect(overlap!.attributionBottom).toBeLessThanOrEqual(overlap!.mapBottom + 1);
    expect(overlap!.tabsZ).toBeGreaterThan(overlap!.paneZ);
  });

  test("mobile summary tab restores and shows regional summary content", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/");
    await expect(page.getByRole("button", { name: "Hide summary" })).toHaveCount(0);
    await page.getByTestId("mobile-tab-summary").click();
    const summary = page.getByRole("region", { name: "Regional summary" });
    await expect(summary).toBeVisible();
    await expect(summary.getByText("Facilities in selected geography")).toBeVisible();
    await expect(
      summary.getByText("Population demographics & health context"),
    ).toBeVisible();
    await expect(
      summary.getByRole("heading", { name: "Data freshness and source inventory" }),
    ).toBeVisible();
    await expect(
      summary.getByText("No public-data refresh is active in this prototype."),
    ).toBeVisible();
  });

  test("mobile facility tab has empty state and full-width readable details", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/");
    await page.getByTestId("mobile-tab-facility").click();
    await expect(page.getByTestId("facility-detail-empty")).toContainText(
      "Select a facility on the map to view details.",
    );
    await page.getByTestId("mobile-tab-map").click();
    await page.locator(`.facility-marker-${SAMPLE_FACILITY_ID}`).click({ force: true });
    await page.getByRole("button", { name: "View details" }).click();
    await expect(page.getByTestId("mobile-tab-facility")).toHaveAttribute(
      "aria-current",
      "true",
    );
    const detail = page.getByTestId("facility-detail-panel");
    await expect(detail).toBeVisible();
    const box = await detail.boundingBox();
    expect(box).not.toBeNull();
    expect(box!.width).toBeGreaterThanOrEqual(360);
    for (const heading of [
      "Facility identity",
      "Capability summary",
      "Source and data quality",
      "Known limitations",
    ]) {
      await expect(detail.getByRole("heading", { name: heading })).toBeVisible();
    }
  });

  test("mobile map starts with a collapsed legend that opens and closes", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/");
    const mapView = page.getByTestId("map-view");
    await expect(mapView).toBeVisible();
    await expect(page.getByRole("heading", { name: "Legend" })).toHaveCount(0);
    await expect(
      page.getByRole("button", { name: "Show map legend" }),
    ).toBeVisible();

    const legendButtonBox = await page
      .getByRole("button", { name: "Show map legend" })
      .boundingBox();
    const mapBox = await mapView.boundingBox();
    expect(legendButtonBox).not.toBeNull();
    expect(mapBox).not.toBeNull();
    expect(
      (legendButtonBox!.width * legendButtonBox!.height) /
        (mapBox!.width * mapBox!.height),
    ).toBeLessThan(0.08);

    await page.getByRole("button", { name: "Show map legend" }).click();
    await expect(page.getByRole("heading", { name: "Legend" })).toBeVisible();
    await expect(page.getByText("Map note")).toBeVisible();
    await page.getByRole("button", { name: "Hide legend" }).click();
    await expect(page.getByRole("heading", { name: "Legend" })).toHaveCount(0);
  });

  test("mobile facility popup fits and View details remains reachable", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/");
    await page
      .locator(`.facility-marker-${SAMPLE_FACILITY_ID}`)
      .click({ force: true });
    const viewDetails = page.getByRole("button", { name: "View details" });
    await expect(viewDetails).toBeVisible();
    const box = await page.locator(".leaflet-popup").boundingBox();
    expect(box).not.toBeNull();
    expect(box!.width).toBeLessThanOrEqual(340);
    await viewDetails.click();
    await expect(page.getByTestId("facility-detail-panel")).toBeVisible();
  });

  test("no horizontal document overflow at a common mobile viewport", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/");
    await expect(
      page.getByText("StatTerrain", { exact: true }).first(),
    ).toBeVisible();

    const { scrollWidth, clientWidth } = await page.evaluate(() => ({
      scrollWidth: document.documentElement.scrollWidth,
      clientWidth: document.documentElement.clientWidth,
    }));
    expect(scrollWidth).toBeLessThanOrEqual(clientWidth + 1);

    await expect(
      page.getByRole("navigation", { name: "Mobile view switcher" }),
    ).toBeVisible();
    await expect(
      page.getByRole("button", { name: "Hide summary" }),
    ).toHaveCount(0);
    await expect(page.getByTestId("map-view")).toBeVisible();
    await expect(page.getByTestId("mobile-workspace-tabs")).toBeVisible();
    await expect(
      page.getByRole("link", { name: "Send Feedback" }),
    ).toBeVisible();
    await page.getByTestId("mobile-tab-summary").click();
    await expect(
      page.getByRole("region", { name: "Regional summary" }),
    ).toBeVisible();
    await expect(
      page.getByRole("button", { name: "Show plain-language meaning" }).first(),
    ).toHaveAttribute("aria-expanded", "false");
    await page.getByRole("button", { name: "Filters" }).click();
    await expect(page.getByRole("dialog", { name: "Filters" })).toBeVisible();
    await page.getByRole("button", { name: "Close panel" }).click();
    await page.getByTestId("mobile-tab-facility").click();
    await expect(
      page.getByRole("region", { name: "Facility detail" }),
    ).toBeVisible();
    await page.getByTestId("mobile-tab-map").click();
    await expect(page.getByTestId("map-view")).toBeVisible();
  });

  test("the application remains usable at a tablet viewport", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 820, height: 1180 });
    await page.goto("/");
    await expect(page.getByTestId("map-view")).toBeVisible();
    await expect(
      page.getByLabel("Search hospital, city, ZIP, county, or address"),
    ).toBeVisible();

    const { scrollWidth, clientWidth } = await page.evaluate(() => ({
      scrollWidth: document.documentElement.scrollWidth,
      clientWidth: document.documentElement.clientWidth,
    }));
    expect(scrollWidth).toBeLessThanOrEqual(clientWidth + 1);
  });
});

async function countVisibleFacilities(page: Page): Promise<number> {
  const types = [
    "hospital",
    "critical_access_hospital",
    "pharmacy",
    "dialysis",
    "nursing_home",
    "behavioral_health",
  ];
  let total = 0;
  for (const type of types) {
    const text = await page
      .getByTestId(`facility-count-${type}`)
      .locator("p")
      .first()
      .textContent();
    total += Number(text?.trim() ?? "0");
  }
  return total;
}
