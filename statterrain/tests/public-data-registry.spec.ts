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
