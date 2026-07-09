import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { test, expect } from "@playwright/test";

test.describe("public-data source registry scaffold", () => {
  test("planned sources have unique IDs and no active real-ingested data", async () => {
    const registry = JSON.parse(
      await readFile(
        join(process.cwd(), "data/sources/source-registry.json"),
        "utf8",
      ),
    );
    const ids = registry.sources.map((source: { id: string }) => source.id);
    expect(new Set(ids).size).toBe(ids.length);
    for (const source of registry.sources) {
      expect(source.status).toBe("planned");
      expect(source.usedInCurrentApp).toBe(false);
      expect(source.dataMode).toBe("not-yet-ingested");
      expect(source.lastSuccessfulRefresh).toBeNull();
      expect(source.automationStatus).toBe("not-started");
    }
    expect(registry.publicDataRefreshActive).toBe(false);
    expect(registry.generatedPublicRecordsActive).toBe(false);
  });
});

test.describe("CMS hospital fixture safety", () => {
  test("current CMS artifact is live-geocoded and eligible for optional preview", async () => {
    const generated = JSON.parse(
      await readFile(
        join(process.cwd(), "data/generated/cms-hospitals.generated.json"),
        "utf8",
      ),
    );
    expect(generated.metadata.dataMode).toBe("real-public-data");
    expect(generated.metadata.fixtureMode).toBe(false);
    expect(generated.metadata.usedInCurrentApp).toBe(false);
    expect(generated.metadata.previewLabelRequired).toBe(true);
    expect(generated.records).toHaveLength(5);
    for (const record of generated.records) {
      expect(record.syntheticFixtureRecord).toBeUndefined();
      expect(typeof record.latitude).toBe("number");
      expect(Number.isFinite(record.latitude)).toBe(true);
      expect(typeof record.longitude).toBe("number");
      expect(Number.isFinite(record.longitude)).toBe(true);
      expect(record.geocodingStatus).toBe("matched");
      expect(record.geographyJoinStatus).toBe("joined");
    }

    const geocodingSummary = JSON.parse(
      await readFile(
        join(
          process.cwd(),
          "data/reports/cms-hospitals-geocoding-summary-v0.2.7.json",
        ),
        "utf8",
      ),
    );
    expect(geocodingSummary.mode).toBe("live-census");
    expect(geocodingSummary.externalCallsEnabled).toBe(true);
    expect(geocodingSummary.liveGeocodingLimit).toBe(5);
    expect(geocodingSummary.recordCount).toBe(5);
    expect(geocodingSummary.matchedCount).toBe(5);
    expect(geocodingSummary.joinedCount).toBe(5);
    expect(geocodingSummary.failedEligibleCount).toBe(0);
  });
  test("current live-geocoded artifact limitations do not contain stale dry-run map copy", async () => {
    const generatedText = await readFile(
      join(process.cwd(), "data/generated/cms-hospitals.generated.json"),
      "utf8",
    );
    expect(generatedText).toContain(
      "Coordinates were derived from a bounded live Census Geocoder run and are for public-data preview context only.",
    );
    expect(generatedText).toContain("CMS data do not power the main app map by default.");
    expect(generatedText).not.toContain(
      "Coordinates are not provided by this CMS source; the current artifact has dry-run geocoding only and is not map-ready.",
    );
  });

});

test.describe("product version guardrail", () => {
  test("visible product version is centralized and current", async () => {
    const productConfig = await readFile(
      join(process.cwd(), "src/config/product.ts"),
      "utf8",
    );
    expect(productConfig).toContain('prototypeVersion: "v0.2.7.1 prototype"');
    expect(productConfig).not.toContain('prototypeVersion: "v0.2.6 prototype"');
    expect(productConfig).not.toContain('prototypeVersion: "v0.2.5 prototype"');
  });
});
