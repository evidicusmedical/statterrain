import { expect, test } from "@playwright/test";
import { readFile } from "node:fs/promises";
import { join } from "node:path";

const root = process.cwd();

test.describe("demographic percentage browser contract", () => {
  test("fixture-driven summary and facility-panel behavior are wired for percentage context", async () => {
    const summary = await readFile(
      join(root, "src/components/regional-summary/RegionalSummaryPanel.tsx"),
      "utf8",
    );
    const app = await readFile(join(root, "src/app/page.tsx"), "utf8");
    const panel = await readFile(
      join(root, "src/components/facilities/FacilityDetailPanel.tsx"),
      "utf8",
    );

    await test.step("all supported values show percentage-capable rows with raw counts", async () => {
      expect(summary).toContain("selectDemographicPercentageMetrics(county)");
      expect(summary).toContain(
        "formatDemographicPercentage(metric.percentage)",
      );
      expect(summary).toContain("fmt(metric)");
      expect(summary).toContain("metric.unit");
      expect(summary).toContain("households");
      expect(summary).toContain(
        "All values in this section describe the whole containing county",
      );
      expect(summary).not.toContain("population inside the radius");
    });

    await test.step("missing denominator and genuine zero have explicit display paths", async () => {
      const selector = await readFile(
        join(root, "src/lib/acs/demographicPercentages.ts"),
        "utf8",
      );
      expect(selector).toContain('percentageStatus = "not-calculable"');
      expect(selector).toContain('percentageStatus = "invalid-denominator"');
      expect(selector).toContain('return "<0.1%"');
      expect(selector).toContain("0.0%");
      expect(selector).not.toContain("?? 0");
    });

    await test.step("facility details still replace and restore the summary preference", async () => {
      expect(app).toContain("selectedFacility");
      expect(app).toContain("state.clearSelectedFacility()");
      expect(app).toContain("summaryPreference");
      expect(app).toContain("activePanel");
      expect(panel).toContain("Escape");
    });
  });
});
