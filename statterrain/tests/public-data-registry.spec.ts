import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { test, expect } from "@playwright/test";

test.describe("public-data source registry scaffold", () => {
  test("planned sources have unique IDs and no active real-ingested data", async () => {
    const registry = JSON.parse(
      await readFile(join(process.cwd(), "data/sources/source-registry.json"), "utf8"),
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
  test("fixture output is explicitly non-production and app-inactive", async () => {
    const generated = JSON.parse(
      await readFile(join(process.cwd(), "data/generated/cms-hospitals.generated.json"), "utf8"),
    );
    expect(generated.metadata.dataMode).toBe("synthetic-test-fixture");
    expect(generated.metadata.fixtureMode).toBe(true);
    expect(generated.metadata.usedInCurrentApp).toBe(false);
    expect(generated.metadata.previewLabelRequired).toBe(true);
    expect(generated.metadata.lastKnownGood.updatedThisRun).toBe(false);
    expect(generated.records).toHaveLength(4);
    for (const record of generated.records) {
      expect(record.syntheticFixtureRecord).toBe(true);
      expect(record.latitude).toBeNull();
      expect(record.longitude).toBeNull();
    }
  });
});
