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
    expect(generated.metadata.usedInCurrentApp).toBe(true);
    expect(generated.metadata.previewLabelRequired).toBe(false);
    expect(generated.records.length).toBeGreaterThan(5);
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
    expect(productConfig).toContain('prototypeVersion: "v0.3.3.3 prototype"');
    expect(productConfig).not.toContain('prototypeVersion: "v0.3.2.3 prototype"');
    expect(productConfig).not.toContain('prototypeVersion: "v0.3.2.2 prototype"');
    expect(productConfig).not.toContain('prototypeVersion: "v0.3.2.1 prototype"');
    expect(productConfig).not.toContain('prototypeVersion: "v0.3.2 prototype"');
    expect(productConfig).not.toContain('prototypeVersion: "v0.3.1 prototype"');
    expect(productConfig).not.toContain('prototypeVersion: "v0.3.0.2 prototype"');
  });
});


test.describe("v0.3.2.3 CMS probe JSON capture hotfix", () => {
  test("workflow parses direct Node probe JSON file instead of raw npm output", async () => {
    const workflow = await readFile(join(process.cwd(), "..", ".github/workflows/cms-hospital-national-build.yml"), "utf8");
    expect(workflow).toContain("node scripts/public-data/build-national-cms-hospitals.mjs --probe > /tmp/cms-probe.json");
    expect(workflow).toContain("JSON.parse(fs.readFileSync('/tmp/cms-probe.json','utf8'))");
    expect(workflow).not.toMatch(/npm run data:probe-cms-hospital-api\s*\|\s*tee/);
    expect(workflow).not.toMatch(/PROBE_OUTPUT=\$\(npm run data:probe-cms-hospital-api\)/);
  });
});


test.describe("v0.2.8.1 radius controls and scope guardrails", () => {
  test("quick radius options and slider contract are present", async () => {
    const radiusData = await readFile(join(process.cwd(), "src/data/demo-region.ts"), "utf8");
    for (const miles of [10, 25, 50, 100]) {
      expect(radiusData).toContain(`miles: ${miles}`);
      expect(radiusData).toContain(`${miles} miles`);
    }

    const filterSidebar = await readFile(join(process.cwd(), "src/components/filters/FilterSidebar.tsx"), "utf8");
    expect(filterSidebar).toContain('type="range"');
    expect(filterSidebar).toContain('min={1}');
    expect(filterSidebar).toContain('max={250}');
    expect(filterSidebar).toContain('step={1}');
    expect(filterSidebar).toContain('onClick={() => onRadiusChange(r.miles)}');
    expect(filterSidebar).toContain('onChange={(event) => onRadiusChange(Number(event.target.value))}');
    expect(filterSidebar).toContain('Selected planning radius: {radiusMiles} miles');
  });

  test("summary, map, and exports use selected planning radius language", async () => {
    const summary = await readFile(join(process.cwd(), "src/components/regional-summary/RegionalSummaryPanel.tsx"), "utf8");
    expect(summary).toContain('Selected planning radius: {radiusMiles} miles');
    expect(summary).toContain('Zero-facility results can occur with small radii.');

    const mapView = await readFile(join(process.cwd(), "src/components/map/MapView.tsx"), "utf8");
    expect(mapView).toContain('Selected planning radius:');
    expect(mapView).toContain('radius={radiusMeters}');

    const exportLib = await readFile(join(process.cwd(), "src/lib/export.ts"), "utf8");
    expect(exportLib).toContain('Selected planning radius: ${radiusMiles} miles');
    expect(exportLib).toContain('Selected planning radius: ${ctx.radiusMiles} miles');
    expect(exportLib).toContain('selected planning radius');
  });

  test("active radius UI and export copy avoid travel-scope feature language", async () => {
    const activeFiles = [
      "src/components/filters/FilterSidebar.tsx",
      "src/components/map/MapView.tsx",
      "src/components/regional-summary/RegionalSummaryPanel.tsx",
      "src/lib/export.ts",
    ];
    for (const file of activeFiles) {
      const source = await readFile(join(process.cwd(), file), "utf8");
      expect(source).not.toMatch(/drive[- ]time|travel[- ]time|\bETA\b|isochrone/i);
    }
  });
});


test.describe("v0.2.9 national location search and coverage status", () => {
  test("location search component, geocoder abstraction, and status copy are present", async () => {
    const component = await readFile(join(process.cwd(), "src/components/search/LocationSearchBox.tsx"), "utf8");
    expect(component).toContain("Search address, ZIP, city/state, or lat/lon");
    expect(component).toContain("invalid-input");
    expect(component).toContain("Selected planning radius remains {radiusMiles} miles");

    const geocoder = await readFile(join(process.cwd(), "src/lib/geocoding/searchLocation.ts"), "utf8");
    expect(geocoder).toContain("geocoding.geo.census.gov");
    expect(geocoder).toContain("U.S. Census Geocoder");
    for (const status of ["found", "multiple-matches-top-used", "no-match", "geocoder-unavailable", "network-error", "invalid-input"]) expect(geocoder).toContain(status);
  });

  test("selected-location state preserves radius and recenters map props", async () => {
    const state = await readFile(join(process.cwd(), "src/hooks/useAppState.ts"), "utf8");
    expect(state).toContain("selectedLocation");
    expect(state).toContain("setSelectedLocation");
    expect(state).toContain("radiusMiles");
    expect(state).toContain("loadNationalCmsHospitals");

    const page = await readFile(join(process.cwd(), "src/app/page.tsx"), "utf8");
    expect(page).toContain("state.setLocation(result.location)");
    expect(page).toContain("state.setSelectedLocation(result.location)");
    expect(page).toContain("radiusMiles={state.radiusMiles}");

    const mapView = await readFile(join(process.cwd(), "src/components/map/MapView.tsx"), "utf8");
    expect(mapView).toContain('data-testid="selected-location-badge"');
    expect(mapView).toContain("<Recenter lat={location.lat} lng={location.lng} />");
    expect(mapView).toContain("radius={radiusMeters}");
  });

  test("outside-demo coverage suppresses misleading synthetic local coverage", async () => {
    const state = await readFile(join(process.cwd(), "src/hooks/useAppState.ts"), "utf8");
    expect(state).not.toContain("syntheticFacilities");

    const coverage = await readFile(join(process.cwd(), "src/lib/coverage/coverageStatus.ts"), "utf8");
    expect(coverage).toContain("Synthetic demo data is not representative of this searched location.");
    expect(coverage).toContain("No map-ready CMS hospital records were found within the selected radius.");
    expect(coverage).toContain("CMS dialysis source scaffold exists, but records are fixture-only/not geocoded and are not map-ready.");

    const exportLib = await readFile(join(process.cwd(), "src/lib/export.ts"), "utf8");
    expect(exportLib).toContain("Coverage status");
    expect(exportLib).toContain("Search location source");
    expect(exportLib).toContain("Synthetic demo data included in local facility counts");
  });
});

test.describe("v0.3.0 national coverage manifest and scaling foundation", () => {
  test("visible product version is v0.3.3.3 prototype", async () => {
    const productConfig = await readFile(join(process.cwd(), "src/config/product.ts"), "utf8");
    expect(productConfig).toContain('prototypeVersion: "v0.3.3.3 prototype"');
    expect(productConfig).not.toContain('prototypeVersion: "v0.3.2.3 prototype"');
    expect(productConfig).not.toContain('prototypeVersion: "v0.3.2.2 prototype"');
    expect(productConfig).not.toContain('prototypeVersion: "v0.3.2.1 prototype"');
    expect(productConfig).not.toContain('prototypeVersion: "v0.3.2 prototype"');
    expect(productConfig).not.toContain('prototypeVersion: "v0.3.1 prototype"');
    expect(productConfig).not.toContain('prototypeVersion: "v0.3.0.2 prototype"');
  });

  test("source coverage manifest captures hospital, dialysis, and synthetic statuses", async () => {
    const manifest = JSON.parse(await readFile(join(process.cwd(), "data/generated/source-coverage-manifest.json"), "utf8"));
    expect(manifest.nationalCoverageComplete).toBe(true);
    const hospital = manifest.sources.find((s: any) => s.sourceId === "cms-hospital-general-information");
    expect(hospital).toBeTruthy();
    expect(hospital.sourceId).toBe("cms-hospital-general-information");
    expect(hospital.currentArtifactStatus).toBeTruthy();
    expect(hospital.nationalCoverageStatus).toBeTruthy();
    expect(hospital.recordCount).toBeGreaterThanOrEqual(5);
    expect(hospital.mapReadyRecordCount).toBeGreaterThanOrEqual(5);
    expect(hospital.previewEligibleRecordCount).toBeGreaterThanOrEqual(5);
    expect(hospital.usedInCurrentApp).toBe(true);
    const dialysis = manifest.sources.find((s: any) => s.sourceId === "cms-dialysis-facilities");
    expect(dialysis.currentArtifactStatus).toBe("fixture-only");
    expect(dialysis.nationalCoverageStatus).toBeTruthy();
    expect(dialysis.mapReadyRecordCount ?? 0).toBe(0);
    const synthetic = manifest.sources.find((s: any) => s.sourceId === "synthetic-demo");
    expect(synthetic.currentArtifactStatus).toBeTruthy();
    expect(synthetic.nationalCoverageStatus).toBeTruthy();
  });

  test("artifact manifest includes generated artifacts and inactive current-app flags", async () => {
    const manifest = JSON.parse(await readFile(join(process.cwd(), "data/generated/artifact-manifest.json"), "utf8"));
    expect(manifest.artifacts.length).toBeGreaterThan(0);
    for (const artifact of manifest.artifacts) expect(artifact).toBeTruthy();
  });

  test("geocoding cache scaffold exists and is empty", async () => {
    expect(existsSync(join(process.cwd(), "data/generated/geocoding-cache/geocoding-cache.schema.json"))).toBe(true);
    const cache = JSON.parse(await readFile(join(process.cwd(), "data/generated/geocoding-cache/geocoding-cache-v0.3.0.json"), "utf8"));
    expect(cache.entries).toEqual([]);
  });

  test("changed-address and chunking scaffolds exist", () => {
    expect(existsSync(join(process.cwd(), "scripts/public-data/compare-addresses-for-geocoding.mjs"))).toBe(true);
    expect(existsSync(join(process.cwd(), "scripts/public-data/create-geocoding-chunks.mjs"))).toBe(true);
  });

  test("summary toggle has no persistent floating help card", async () => {
    const page = await readFile(join(process.cwd(), "src/app/page.tsx"), "utf8");
    expect(page).toContain("Show summary");
    expect(page).toContain("Summary panel toggle; no persistent map tooltip is shown.");
    expect(page).not.toContain("Show summary to review facilities and population context.");
    expect(page).not.toContain("Hide summary to enlarge the map.");
  });

  test("coverage UI and export include national coverage summary copy", async () => {
    const panel = await readFile(join(process.cwd(), "src/components/public-data/PublicDataFreshnessPanel.tsx"), "utf8");
    expect(panel).toContain("useState(false)");
    expect(panel).toContain("aria-expanded={expanded}");
    expect(panel).toContain("aria-controls={detailsId}");
    expect(panel).toContain("CMS hospitals");
    expect(panel).toContain("map-ready nationally");
    expect(panel).toContain("Details");
    expect(panel).toContain("Collapse details");
    expect(panel).toContain("Coverage manifest summary");
    expect(panel).toContain("Limitations and prohibited uses");
    expect(panel).toContain("sourceCoverage.map");
    const coverage = await readFile(join(process.cwd(), "src/lib/coverage/coverageStatus.ts"), "utf8");
    expect(coverage).toContain("national map-ready public-data source active");
    const exportLib = await readFile(join(process.cwd(), "src/lib/export.ts"), "utf8");
    expect(exportLib).toContain("Coverage manifest summary");
    expect(exportLib).toContain("coverageManifestSummary");
  });
});


test.describe("v0.3.0.2 unified search and compact map status UX", () => {
  test("top search is primary and large in-map search card is absent", async () => {
    const header = await readFile(join(process.cwd(), "src/components/layout/Header.tsx"), "utf8");
    const searchBox = await readFile(join(process.cwd(), "src/components/search/LocationSearchBox.tsx"), "utf8");
    const page = await readFile(join(process.cwd(), "src/app/page.tsx"), "utf8");
    expect(header).toContain("<LocationSearchBox");
    expect(searchBox).toContain("Primary planning location search");
    expect(searchBox).toContain("Search address, ZIP, city/state, or lat/lon");
    expect(searchBox).toContain("onSubmit={submit}");
    expect(searchBox).toContain("Selected planning radius remains {radiusMiles} miles");
    expect(page).not.toContain("absolute left-2 top-2 z-[30] flex");
    expect(searchBox).not.toContain("shadow-panel");
  });

  test("coordinate parser accepts common pairs and avoids Census fetch for valid coordinates", async () => {
    const geocoder = await readFile(join(process.cwd(), "src/lib/geocoding/searchLocation.ts"), "utf8");
    expect(geocoder).toContain("parseCoordinateSearch");
    expect(geocoder).toContain("plainPair");
    expect(geocoder).toContain("hemiPair");
    expect(geocoder).toContain("explicit");
    expect(geocoder).toContain("lat < -90 || lat > 90 || lng < -180 || lng > 180");
    expect(geocoder).toContain('return "invalid"');
    expect(geocoder).toContain("const parsedCoordinates = parseCoordinateSearch(clean)");
    expect(geocoder).toContain("if (parsedCoordinates) {");
    expect(geocoder).toContain("buildManualCoordinateLocation(parsedCoordinates.lat, parsedCoordinates.lng, clean)");
    expect(geocoder).toContain('source: "Manual coordinates"');
    expect(geocoder).toContain("sessionOnly: true");
    expect(geocoder.indexOf("if (parsedCoordinates) {")).toBeLessThan(geocoder.indexOf("fetcher("));
  });

  test("map click planning center and compact selected-location badge are present", async () => {
    const mapView = await readFile(join(process.cwd(), "src/components/map/MapView.tsx"), "utf8");
    const page = await readFile(join(process.cwd(), "src/app/page.tsx"), "utf8");
    expect(mapView).toContain("useMapEvents");
    expect(mapView).toContain("MapClickPlanningCenter");
    expect(mapView).toContain("onMapClick?.(event.latlng.lat, event.latlng.lng)");
    expect(page).toContain('"Map click"');
    expect(page).toContain("Map-click planning center set");
    expect(mapView).toContain('data-testid="selected-location-badge"');
    expect(mapView).toContain(" · Radius {radiusMiles} mi");
    expect(mapView).toContain("left-3 top-3");
    expect(mapView).toContain("Click the map to set planning center.");
    expect(mapView).not.toContain("list-disc pl-4");
  });

  test("summary toggle and public-data status are compact by default with details preserved", async () => {
    const page = await readFile(join(process.cwd(), "src/app/page.tsx"), "utf8");
    const panel = await readFile(join(process.cwd(), "src/components/public-data/PublicDataFreshnessPanel.tsx"), "utf8");
    expect(page).toContain("absolute right-2 top-2");
    expect(page).toContain("Show summary");
    expect(page).toContain("Summary panel toggle; no persistent map tooltip is shown.");
    expect(panel).toContain("CMS hospitals");
    expect(panel).toContain("map-ready nationally");
    expect(panel).toContain("Details");
    expect(panel).toContain("hidden={!expanded}");
    expect(panel).toContain("Coverage manifest summary");
    expect(panel).toContain("Limitations and prohibited uses");
  });

  test("active UI avoids route, travel-time, ETA, and live operational fields", async () => {
    const activeFiles = [
      "src/components/layout/Header.tsx",
      "src/components/search/LocationSearchBox.tsx",
      "src/components/map/MapView.tsx",
      "src/components/public-data/PublicDataFreshnessPanel.tsx",
      "src/app/page.tsx",
    ];
    for (const file of activeFiles) {
      const source = await readFile(join(process.cwd(), file), "utf8");
      expect(source).not.toMatch(/drive[- ]time|travel[- ]time|\bETA\b|isochrone|claims|PHI|bed status|live diversion/i);
    }
  });
});


test.describe("v0.3.1 source-backed taxonomy and data-delivery policies", () => {
  test("facility taxonomy classifies active, synthetic, hidden, and mapping-needed categories", async () => {
    const taxonomy = await readFile(join(process.cwd(), "src/config/facilityTaxonomy.ts"), "utf8");
    expect(taxonomy).toContain('taxonomyVersion = "v0.3.1-source-backed-taxonomy"');
    expect(taxonomy).toContain('id: "hospital"');
    expect(taxonomy).toContain('status: "source-backed-now"');
    expect(taxonomy).toContain('cms-hospital-general-information');
    expect(taxonomy).toContain('id: "dialysis"');
    expect(taxonomy).toContain('Fixture-only; not real national data');
    expect(taxonomy).toContain('id: "nursing_home"');
    expect(taxonomy).toContain('id: "behavioral_health"');
    expect(taxonomy).toContain('id: "pharmacy"');
    expect(taxonomy).toContain('status: "future-source-needed"');
    expect(taxonomy).toContain('id: "critical_access_hospital"');
    expect(taxonomy).toContain('status: "source-mapping-needed"');
  });

  test("primary filters hide unsupported categories and capability controls", async () => {
    const sidebar = await readFile(join(process.cwd(), "src/components/filters/FilterSidebar.tsx"), "utf8");
    expect(sidebar).toContain("sourceBackedFacilityTypes");
    expect(sidebar).toContain("Synthetic demo categories");
    expect(sidebar).toContain("Hospital capability filters are hidden");
    expect(sidebar).not.toContain("CAPABILITY_ORDER");
    expect(sidebar).not.toContain("Any trauma center / any capability");
    expect(sidebar).not.toContain("CAPABILITY_LABELS[cap]");
  });

  test("details and exports label synthetic capabilities and unavailable source scope", async () => {
    const detail = await readFile(join(process.cwd(), "src/components/facilities/FacilityDetailPanel.tsx"), "utf8");
    expect(detail).toContain("Synthetic demonstration value — not a public-data fact");
    expect(detail).toContain("Unsupported capability filters are hidden until validated public source mappings are available");

    const exportLib = await readFile(join(process.cwd(), "src/lib/export.ts"), "utf8");
    expect(exportLib).toContain("## Source scope");
    expect(exportLib).toContain("Unavailable / future-source-needed categories");
    expect(exportLib).toContain("Trauma, stroke, STEMI/PCI, bed availability, diversion status");
    expect(exportLib).toContain("unavailable as source-backed coverage in v0.3.1");
  });

  test("manifests include taxonomy readiness status", async () => {
    for (const file of ["data/generated/source-coverage-manifest.json", "data/generated/artifact-manifest.json"]) {
      const manifest = JSON.parse(await readFile(join(process.cwd(), file), "utf8"));
      if (!manifest.taxonomyReadiness) continue;
      expect(manifest.taxonomyReadiness.taxonomyVersion).toMatch(/source-backed/);
      expect(JSON.stringify(manifest.taxonomyReadiness)).toContain("hospital");
    }
  });

  test("permanent policies and national checklist exist", async () => {
    const policy = await readFile(join(process.cwd(), "docs/SOURCE_BACKED_UI_AND_DATA_RELEASE_POLICY.md"), "utf8");
    expect(policy).toContain("A national source release is not complete until");
    expect(policy).toContain("Scripts, schemas, empty caches, reports, chunk plans, and workflows alone do not constitute completion.");
    expect(policy).toContain("No active map layer, filter, capability, legend item, summary, or evidence section may appear");
    const checklist = await readFile(join(process.cwd(), "docs/templates/NATIONAL-DATA-RELEASE-CHECKLIST.md"), "utf8");
    for (const heading of ["Source verification", "Pull result", "Record count", "Generated-data PRs", "Completion declaration"]) {
      expect(checklist).toContain(`## ${heading}`);
    }
  });

  test("no patient-level, claims, PHI, or live-operational fields were added", async () => {
    const files = [
      "src/config/facilityTaxonomy.ts",
      "src/components/filters/FilterSidebar.tsx",
      "src/lib/export.ts",
      "docs/SOURCE_BACKED_UI_AND_DATA_RELEASE_POLICY.md",
    ];
    for (const file of files) {
      const source = await readFile(join(process.cwd(), file), "utf8");
      expect(source).not.toMatch(/patient[- ]level records|claims records|PHI handling|live bed availability|live diversion/i);
    }
  });
});
