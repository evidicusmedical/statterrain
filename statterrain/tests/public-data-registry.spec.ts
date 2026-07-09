import { existsSync } from "node:fs";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { execFileSync } from "node:child_process";
import { test, expect } from "@playwright/test";

const forbidden = [/patient/i, /claim/i, /appointment/i, /treatment.*schedule/i, /^schedule$/i, /capacity/i, /staff/i, /station/i, /routing/i, /diversion/i, /bed/i, /dispatch/i, /triage/i, /transfer/i, /clinicalDecision/i, /medicalControl/i, /referral/i];

test.describe("public-data source registry scaffold", () => {
  test("sources have unique IDs and no default app use", async () => {
    const registry = JSON.parse(await readFile(join(process.cwd(), "data/sources/source-registry.json"), "utf8"));
    const ids = registry.sources.map((source: { id: string }) => source.id);
    expect(new Set(ids).size).toBe(ids.length);
    for (const source of registry.sources) expect(source.usedInCurrentApp).toBe(false);
    expect(registry.publicDataRefreshActive).toBe(false);
    expect(registry.generatedPublicRecordsActive).toBe(false);
  });

  test("dialysis source has required v0.2.8 safety metadata", async () => {
    const registry = JSON.parse(await readFile(join(process.cwd(), "data/sources/source-registry.json"), "utf8"));
    const source = registry.sources.find((item: { id: string }) => item.id === "cms-dialysis-facilities");
    expect(source).toBeTruthy();
    expect(source.agency).toBe("Centers for Medicare & Medicaid Services");
    expect(source.facilityCategory).toBe("dialysis");
    expect(source.usedInCurrentApp).toBe(false);
    expect(source.currentAppUse).toBe(false);
    expect(source.previewLabelRequired).toBe(true);
    expect(source.publicUrl).toContain("data.cms.gov");
    expect(source.endpointUrl).toContain("data.cms.gov");
    expect(source.notAllowedUse.toLowerCase()).toContain("patient referral");
    expect(source.limitations.join(" ")).toContain("Not used in the default StatTerrain map");
  });
});

test.describe("source benchmark", () => {
  test("dialysis benchmark candidate is official and not current-app enabled", async () => {
    const benchmark = JSON.parse(await readFile(join(process.cwd(), "data/sources/source-benchmark.json"), "utf8"));
    const candidates = benchmark.categories.flatMap((category: { candidates: unknown[] }) => category.candidates);
    const dialysis = candidates.find((candidate: any) => candidate.id === "cms-dialysis-facilities") as any;
    expect(dialysis).toBeTruthy();
    expect(dialysis.agency).toBe("Centers for Medicare & Medicaid Services");
    expect(dialysis.sourceUrl).toContain("data.cms.gov");
    expect(dialysis.usedInCurrentApp).toBe(false);
    expect(dialysis.previewLabelRequired).toBe(true);
    expect(dialysis.recommendedPatch).toBe("v0.2.8");
  });
});

test.describe("CMS dialysis fixture and artifact safety", () => {
  test("fixture is synthetic and cannot be mistaken for real preview data", async () => {
    const fixture = JSON.parse(await readFile(join(process.cwd(), "data/fixtures/cms-dialysis/sample-cms-dialysis-facilities-v0.2.8.json"), "utf8"));
    expect(fixture.length).toBeGreaterThanOrEqual(3);
    for (const record of fixture) {
      expect(record["Facility Name"]).toContain("Example Fixture Dialysis Center");
      expect(record.syntheticFixtureRecord).toBe(true);
      expect(record.dataMode).toBe("synthetic-test-fixture");
      expect(record.usedInCurrentApp).toBe(false);
      expect(record.previewLabelRequired).toBe(true);
      for (const key of Object.keys(record)) for (const pattern of forbidden) expect(pattern.test(key)).toBe(false);
    }
  });

  test("generated artifact, if present, remains inactive and contains no prohibited fields", async () => {
    const artifactPath = join(process.cwd(), "data/generated/cms-dialysis.generated.json");
    if (!existsSync(artifactPath)) return;
    const generated = JSON.parse(await readFile(artifactPath, "utf8"));
    expect(generated.metadata.usedInCurrentApp).toBe(false);
    expect(generated.metadata.previewLabelRequired).toBe(true);
    expect(generated.metadata.safeToDisplay).toBe(false);
    expect(generated.metadata.lastKnownGood.updatedThisRun).toBe(false);
    for (const record of generated.records) {
      expect(record.usedInCurrentApp).toBe(false);
      expect(record.previewLabelRequired).toBe(true);
      for (const key of Object.keys(record)) for (const pattern of forbidden) expect(pattern.test(key)).toBe(false);
      if (generated.metadata.dataMode === "synthetic-test-fixture") expect(record.syntheticFixtureRecord).toBe(true);
    }
  });

  test("dialysis validation accepts safe fixture warn state", () => {
    execFileSync("npm", ["run", "data:pull-cms-dialysis", "--", "--fixture"], { cwd: process.cwd(), stdio: "pipe" });
    const output = execFileSync("npm", ["run", "data:validate-cms-dialysis"], { cwd: process.cwd(), encoding: "utf8" });
    expect(output).toContain("CMS dialysis validation: WARN");
  });
});

test.describe("CMS hospital fixture safety", () => {
  test("current CMS artifact is live-geocoded and eligible for optional preview", async () => {
    const generated = JSON.parse(await readFile(join(process.cwd(), "data/generated/cms-hospitals.generated.json"), "utf8"));
    expect(generated.metadata.dataMode).toBe("real-public-data");
    expect(generated.metadata.usedInCurrentApp).toBe(false);
    expect(generated.metadata.previewLabelRequired).toBe(true);
    expect(generated.records).toHaveLength(5);
    for (const record of generated.records) {
      expect(record.syntheticFixtureRecord).toBeUndefined();
      expect(typeof record.latitude).toBe("number");
      expect(typeof record.longitude).toBe("number");
      expect(record.geocodingStatus).toBe("matched");
      expect(record.geographyJoinStatus).toBe("joined");
    }
  });

  test("default synthetic app behavior is preserved", async () => {
    const facilities = await readFile(join(process.cwd(), "src/data/facilities.ts"), "utf8");
    expect(facilities).not.toContain("Example Fixture Dialysis Center");
    expect(facilities).not.toContain("cms-dialysis");
  });
});

test.describe("product version guardrail", () => {
  test("visible product version is centralized and current", async () => {
    const productConfig = await readFile(join(process.cwd(), "src/config/product.ts"), "utf8");
    expect(productConfig).toContain('prototypeVersion: "v0.2.8 prototype"');
    expect(productConfig).not.toContain('prototypeVersion: "v0.2.7.1 prototype"');
  });
});
