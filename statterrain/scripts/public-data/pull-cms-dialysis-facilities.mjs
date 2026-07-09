import { createHash } from "node:crypto";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";
const __dirname = dirname(fileURLToPath(import.meta.url));
const appRoot = resolve(__dirname, "../..");
const rel = (p) => relative(appRoot, p).replaceAll("\\", "/");
const version = "v0.2.8";
const args = new Set(process.argv.slice(2));
const fixtureMode = args.has("--fixture");
const endpoint = "https://data.cms.gov/provider-data/api/1/datastore/query/23ew-n7w9/0?limit=50000";
const registry = JSON.parse(readFileSync(resolve(appRoot, "data/sources/source-registry.json"), "utf8"));
const source = registry.sources.find((s) => s.id === "cms-dialysis-facilities");
if (!source) throw new Error("cms-dialysis-facilities missing from source registry.");
const fixturePath = resolve(appRoot, "data/fixtures/cms-dialysis/sample-cms-dialysis-facilities-v0.2.8.json");
const rawDir = resolve(appRoot, "data/raw/cms-dialysis");
const normalizedDir = resolve(appRoot, "data/normalized/cms-dialysis");
const generatedDir = resolve(appRoot, "data/generated");
const reportsDir = resolve(appRoot, "data/reports");
const geocodingDir = resolve(appRoot, "data/generated/geocoding-inputs");
for (const dir of [rawDir, normalizedDir, generatedDir, reportsDir, geocodingDir]) mkdirSync(dir, { recursive: true });
const rawMetadataPath = resolve(rawDir, `cms-dialysis-raw-metadata-${version}.json`);
const rawDataPath = resolve(rawDir, `cms-dialysis-raw-${version}.json`);
const normalizedPath = resolve(normalizedDir, `cms-dialysis-normalized-${version}.json`);
const generatedPath = resolve(generatedDir, "cms-dialysis.generated.json");
const qualityPath = resolve(reportsDir, `cms-dialysis-quality-summary-${version}.json`);
const refreshPath = resolve(reportsDir, `cms-dialysis-refresh-${version}.json`);
const geocodingInputPath = resolve(geocodingDir, `cms-dialysis-geocoding-input-${version}.json`);
const lkgPath = resolve(appRoot, "data/last-known-good/cms-dialysis.generated.json");
const retrievedAt = new Date().toISOString();
const prohibitedUses = ["patient referral", "dialysis routing", "transfer decisions", "treatment recommendations", "appointment availability", "dialysis station availability", "live operational capacity", "staffing status", "bed availability", "dispatch", "triage", "clinical decision support"];
const limitations = source.limitations ?? [];
const get = (row, ...names) => names.map((n) => row?.[n]).find((v) => v !== undefined && v !== null && String(v).trim() !== "") ?? null;
const extractRows = (payload) => payload?.results ?? payload?.data ?? (Array.isArray(payload) ? payload : []);
function normalize(rows, dataMode) {
  return rows.map((row, index) => {
    const id = String(get(row, "CMS Certification Number (CCN)", "CCN", "Facility ID", "facility_id", "Provider Number") ?? `missing-${index}`);
    return { sourceFacilityId: id, facilityName: get(row, "Facility Name", "facility_name"), facilityCategory: "dialysis", facilityTypeLabel: "Dialysis facility", address: get(row, "Address", "Street Address", "address"), city: get(row, "City", "city"), state: get(row, "State", "state"), zip: get(row, "ZIP Code", "Zip", "zip_code"), phone: get(row, "Phone Number", "phone_number"), latitude: null, longitude: null, geocodingStatus: "not-yet-geocoded", geographyJoinStatus: "not-yet-joined", sourceId: source.id, sourceName: source.name, sourceAgency: source.agency, sourceRecordId: id, sourceFieldsUsed: Object.keys(row).filter((k) => !/patient|claim|appointment|schedule|capacity|staff|station/i.test(k)), retrievedAt, dataMode, confidence: dataMode === "synthetic-test-fixture" ? "synthetic-test-fixture" : "source-record", syntheticFixtureRecord: dataMode === "synthetic-test-fixture" ? true : undefined, usedInCurrentApp: false, previewLabelRequired: true, safeToDisplay: false, freshness: { retrievedAt, sourceReleaseDate: null }, limitations };
  });
}
function writeOutputs(rows, text, dataMode, fetchStatus, attempts) {
  writeFileSync(rawDataPath, `${text}\n`);
  const records = normalize(rows, dataMode);
  const geocodingRecords = records.map((r) => ({ sourceFacilityId: r.sourceFacilityId, facilityName: r.facilityName, address: r.address, city: r.city, state: r.state, zip: r.zip, eligibleForFutureGeocoding: Boolean(r.address && r.state && (r.zip || r.city)), geocodingStatus: "not-yet-geocoded", geographyJoinStatus: "not-yet-joined" }));
  const quality = { schemaVersion: "cms-dialysis-quality-summary-v0.2.8", generatedAt: retrievedAt, sourceId: source.id, dataMode, recordCount: records.length, missingCoordinates: { count: records.length, percent: records.length ? 1 : 0 }, previewReady: false, warnings: ["Dialysis records are not geocoded, not geography-joined, and not map-ready in v0.2.8.", "Fixture records are schema tests only and must not update last-known-good."] };
  const rawMeta = { schemaVersion: "cms-dialysis-raw-metadata-v0.2.8", sourceId: source.id, sourceName: source.name, agency: source.agency, sourceUrl: source.sourceUrl, endpointUrl: source.endpointUrl ?? endpoint, retrievalTimestamp: retrievedAt, retrievalMethod: fixtureMode ? "local-fixture" : "fetch-json-api", fetchStatus, fixtureMode, dataMode, checksumSha256: createHash("sha256").update(text).digest("hex"), rawFilePath: rel(rawDataPath), endpointResolutionAttempts: attempts, limitations };
  writeFileSync(rawMetadataPath, `${JSON.stringify(rawMeta, null, 2)}\n`);
  writeFileSync(normalizedPath, `${JSON.stringify({ schemaVersion: "cms-dialysis-normalized-v0.2.8", sourceId: source.id, sourceName: source.name, retrievedAt, dataMode, recordCount: records.length, records }, null, 2)}\n`);
  writeFileSync(qualityPath, `${JSON.stringify(quality, null, 2)}\n`);
  writeFileSync(geocodingInputPath, `${JSON.stringify({ schemaVersion: "cms-dialysis-geocoding-input-v0.2.8", generatedAt: retrievedAt, sourceId: source.id, dataMode, allowedUse: "future geocoding preparation only; no live geocoding performed in v0.2.8", recordCount: records.length, records: geocodingRecords }, null, 2)}\n`);
  writeFileSync(generatedPath, `${JSON.stringify({ metadata: { schemaVersion: "generated-public-data-v0.2.8", datasetId: "cms-dialysis-facilities-v0.2.8", sourceId: source.id, sourceName: source.name, sourceAgency: source.agency, dataMode, fixtureMode, usedInCurrentApp: false, previewLabelRequired: true, recordCount: records.length, retrievedAt, sourceReleaseDate: null, validationStatus: "pending", validationReportPath: "data/reports/cms-dialysis-validation-v0.2.8.json", rawSnapshotMetadataPath: rel(rawMetadataPath), normalizedDatasetPath: rel(normalizedPath), qualitySummaryPath: rel(qualityPath), geocodingInputPath: rel(geocodingInputPath), lastKnownGood: { exists: existsSync(lkgPath), path: rel(lkgPath), updatedThisRun: false }, limitations, allowedUses: ["public-data planning/context only", "pipeline validation"], prohibitedUses, safeToDisplay: false }, records }, null, 2)}\n`);
  writeFileSync(refreshPath, `${JSON.stringify({ schemaVersion: "cms-dialysis-refresh-v0.2.8", sourceId: source.id, refreshAttemptTimestamp: retrievedAt, fetchStatus, fixtureMode, dataMode, recordCount: records.length, generatedOutputPath: rel(generatedPath), qualitySummaryPath: rel(qualityPath), geocodingInputPath: rel(geocodingInputPath), publishRecommendation: "do-not-power-main-ui; not-map-ready", warnings: dataMode === "synthetic-test-fixture" ? ["Fixture output is for deterministic tests only and did not update last-known-good."] : ["Validation and future geocoding are required before preview consideration."], fallbackStatus: { lastKnownGoodExists: existsSync(lkgPath), lastKnownGoodPath: rel(lkgPath) } }, null, 2)}\n`);
  console.log(`CMS dialysis pull completed with ${records.length} records (${dataMode}).`);
}
if (fixtureMode) {
  const text = readFileSync(fixturePath, "utf8");
  writeOutputs(extractRows(JSON.parse(text)), text, "synthetic-test-fixture", "success", [{ endpointRole: "local-fixture", requestedUrl: rel(fixturePath), fetchStatus: "success" }]);
} else {
  const attempts = [];
  try { const response = await fetch(endpoint, { headers: { accept: "application/json" }, redirect: "follow" }); const text = await response.text(); attempts.push({ endpointRole: "cms-provider-data-datastore", requestedUrl: endpoint, finalUrl: response.url, httpStatus: response.status }); if (!response.ok) throw new Error(`HTTP ${response.status}`); const rows = extractRows(JSON.parse(text)); if (!rows.length) throw new Error("empty-records"); writeOutputs(rows, text, "real-public-data", "success", attempts); } catch (error) { const status = /empty/.test(String(error.message)) ? "no-data" : "fetch-failed"; writeFileSync(rawMetadataPath, `${JSON.stringify({ schemaVersion: "cms-dialysis-raw-metadata-v0.2.8", sourceId: source.id, sourceName: source.name, retrievalTimestamp: retrievedAt, fetchStatus: status, fixtureMode: false, dataMode: status, endpointResolutionAttempts: attempts, error: String(error.message ?? error), limitations }, null, 2)}\n`); writeFileSync(refreshPath, `${JSON.stringify({ schemaVersion: "cms-dialysis-refresh-v0.2.8", sourceId: source.id, refreshAttemptTimestamp: retrievedAt, fetchStatus: status, fixtureMode: false, dataMode: status, recordCount: 0, errors: [`CMS dialysis fetch failed safely: ${String(error.message ?? error)}`], publishRecommendation: "do-not-publish; retry or use --fixture for schema tests" }, null, 2)}\n`); console.warn("CMS dialysis pull fetch failed gracefully; no fabricated records were created."); }
}
