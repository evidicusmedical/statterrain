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
  test("home page loads and product name is visible", async ({ page }) => {
    const errors = await collectPageErrors(page);
    const response = await page.goto("/");
    expect(response?.status()).toBeLessThan(400);
    await expect(
      page.getByText("StatTerrain", { exact: true }).first(),
    ).toBeVisible();
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
        /StatTerrain summarizes public datasets for education, planning/,
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
    context,
  }) => {
    await page.goto("/");

    await expect(
      page.getByText("Plain-language meaning").first(),
    ).toBeVisible();
    await expect(
      page.getByText(
        /What it is: The share of people in the area who are older adults/i,
      ),
    ).toBeVisible();
    await expect(page.getByText(/children/i).first()).toBeVisible();
    await expect(
      page.getByText(
        /Real data must state the exact age range used, such as ages 0–17/i,
      ),
    ).toBeVisible();
    await expect(
      page.getByText(
        /More people may face barriers to medications, transportation, follow-up care, food, housing, and emergency recovery/i,
      ),
    ).toBeVisible();
    await expect(
      page.getByText(
        /interpreters, translated instructions, multilingual public alerts/i,
      ),
    ).toBeVisible();
    await expect(
      page.getByText(
        /transportation help, evacuation support, pharmacy access/i,
      ),
    ).toBeVisible();
    await expect(
      page.getByText(
        /does not measure ambulance availability, road quality, or actual travel time/i,
      ),
    ).toBeVisible();
    await expect(
      page
        .getByText(/This is not a diagnosis for any specific person/i)
        .first(),
    ).toBeVisible();
    await expect(
      page.getByText(/not a crime score, danger score, clinical-risk score/i),
    ).toBeVisible();
    await expect(
      page.getByText(
        /Higher rurality means the area may be farther from hospitals, specialists, pharmacies/i,
      ),
    ).toBeVisible();

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
      /mailto:mathew\.h\.lowe@gmail\.com\?subject=StatTerrain%20Beta%20Feedback/,
    );

    await context.grantPermissions(["clipboard-read", "clipboard-write"], {
      origin: new URL(page.url()).origin,
    });
    await page.getByRole("button", { name: "Generate Evidence Brief" }).click();
    await expect(
      page.getByRole("dialog", { name: /evidence brief/i }).locator("pre"),
    ).toContainText(
      "Population metrics are synthetic demonstration values in this prototype",
    );
    await expect(
      page.getByRole("dialog", { name: /evidence brief/i }).locator("pre"),
    ).toContainText("How to read these metrics");
    await expect(
      page.getByRole("dialog", { name: /evidence brief/i }).locator("pre"),
    ).toContainText("Higher means");
    await page.getByRole("button", { name: "Copy feedback context" }).click();
    await expect(
      page.getByRole("button", { name: "Feedback context copied" }),
    ).toBeVisible();
    await expect
      .poll(() => page.evaluate(() => navigator.clipboard.readText()))
      .toContain("StatTerrain v0.1.7 prototype");
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
    ).toBeVisible();
    await page.getByRole("button", { name: "Hide summary" }).click();
    await expect(
      page.getByRole("button", { name: "Show summary" }),
    ).toBeVisible();
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
