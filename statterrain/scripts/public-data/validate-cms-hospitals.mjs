import { copyFileSync, existsSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
const __dirname = dirname(fileURLToPath(import.meta.url));
const appRoot = resolve(__dirname, "../..");
const version = "v0.2.3";
const generatedPath = resolve(appRoot, "data/generated/cms-hospitals.generated.json");
const validationPath = resolve(appRoot, `data/reports/cms-hospitals-validation-${version}.json`);
const refreshPath = resolve(appRoot, `data/reports/cms-hospitals-refresh-${version}.json`);
const qualityPath = resolve(appRoot, `data/reports/cms-hospitals-quality-summary-${version}.json`);
const geocodingInputPath = resolve(appRoot, `data/generated/geocoding-inputs/cms-hospitals-geocoding-input-${version}.json`);
const lkgPath = resolve(appRoot, "data/last-known-good/cms-hospitals.generated.json");
const forbidden = [/patient/i, /claim/i, /phi/i, /bed/i, /diversion/i, /routing/i, /triage/i, /transferRecommendation/i, /dispatch/i, /clinicalDecision/i, /medicalControl/i];
const report = { schemaVersion: "cms-hospitals-validation-v0.2.3", generatedAt: new Date().toISOString(), generatedPath: "data/generated/cms-hospitals.generated.json", status: "fail", recordCount: 0, fixtureMode: false, dataMode: null, warnings: [], errors: [], qualitySummaryPath: "data/reports/cms-hospitals-quality-summary-v0.2.3.json", geocodingInputPath: "data/generated/geocoding-inputs/cms-hospitals-geocoding-input-v0.2.3.json", fallback: { lastKnownGoodExists: existsSync(lkgPath), lastKnownGoodUpdated: false } };
if (!existsSync(generatedPath)) {
  const refresh = existsSync(refreshPath) ? JSON.parse(readFileSync(refreshPath, "utf8")) : null;
  if (refresh?.fetchStatus && refresh.fetchStatus !== "success") { report.status = "warn"; report.warnings.push(`Fetch failed gracefully (${refresh.fetchStatus}); no generated file exists and no fake records were created.`); }
  else report.errors.push("Generated CMS hospital file is missing.");
  writeFileSync(validationPath, `${JSON.stringify(report, null, 2)}\n`);
  console.log(`CMS hospital validation: ${report.status.toUpperCase()}`);
  process.exit(report.status === "fail" ? 1 : 0);
}
const generated = JSON.parse(readFileSync(generatedPath, "utf8"));
const meta = generated.metadata;
const records = generated.records;
report.fixtureMode = meta?.fixtureMode === true;
report.dataMode = meta?.dataMode ?? null;
if (!meta) report.errors.push("metadata block missing.");
if (!Array.isArray(records)) report.errors.push("records must be an array.");
report.recordCount = Array.isArray(records) ? records.length : 0;
if (meta?.recordCount !== report.recordCount) report.errors.push("metadata recordCount does not match records length.");
if (!['real-public-data', 'synthetic-test-fixture'].includes(meta?.dataMode)) report.errors.push("dataMode must be real-public-data or synthetic-test-fixture.");
if (meta?.fixtureMode === true && meta?.dataMode !== "synthetic-test-fixture") report.errors.push("fixtureMode output must use synthetic-test-fixture dataMode.");
if (meta?.fixtureMode !== true && meta?.dataMode !== "real-public-data") report.errors.push("non-fixture output must use real-public-data dataMode.");
if (meta?.usedInCurrentApp !== false) report.errors.push("usedInCurrentApp must remain false in v0.2.3.");
if (meta?.previewLabelRequired !== true) report.errors.push("previewLabelRequired must remain true.");
if (!Array.isArray(meta?.prohibitedUses) || !meta.prohibitedUses.length) report.errors.push("prohibited uses are missing.");
if (!Array.isArray(meta?.limitations) || !meta.limitations.length) report.errors.push("source limitations are missing.");
if (!meta?.retrievedAt || !meta?.sourceId || !meta?.sourceName) report.errors.push("generated metadata must include retrievedAt/sourceId/sourceName.");
if (!existsSync(qualityPath)) report.errors.push("quality summary is missing.");
if (!existsSync(geocodingInputPath)) report.errors.push("geocoding input file is missing.");
if (report.recordCount === 0) report.errors.push("Generated CMS hospital file contains no records after a successful fetch.");
let missingCoordinates = 0;
let missingGeography = 0;
for (const [index, record] of (records ?? []).entries()) {
  for (const field of ["sourceFacilityId", "facilityName", "facilityCategory", "sourceId", "sourceName", "retrievedAt"]) if (!record[field]) report.errors.push(`record ${index} missing ${field}.`);
  if (record.facilityCategory !== "hospital") report.errors.push(`record ${index} facilityCategory must be hospital.`);
  for (const field of ["address", "city", "state", "zip"]) if (field in record && record[field] === undefined) report.errors.push(`record ${index} invalid ${field}.`);
  for (const coord of ["latitude", "longitude"]) if (record[coord] !== null && typeof record[coord] !== "number") report.errors.push(`record ${index} ${coord} must be number or null.`);
  if (record.latitude === null || record.longitude === null) missingCoordinates += 1;
  if (!record.countyName) missingGeography += 1;
  if (record.emergencyServices && !record.sourceFieldsUsed?.some((f) => /emergency/i.test(f))) report.errors.push(`record ${index} emergencyServices is not source-supported.`);
  if (record.criticalAccessHospital !== null && !record.sourceFieldsUsed?.some((f) => /hospital.*type/i.test(f) || /type/i.test(f))) report.errors.push(`record ${index} criticalAccessHospital is not source-supported.`);
  for (const key of Object.keys(record)) for (const pattern of forbidden) if (pattern.test(key)) report.errors.push(`record ${index} has forbidden field ${key}.`);
  if (!record.phone) report.warnings.push(`record ${index} missing phone.`);
}
report.quality = { missingCoordinates, missingGeography };
if (missingCoordinates) report.warnings.push(`${missingCoordinates} records require future geocoding.`);
if (missingGeography) report.warnings.push(`${missingGeography} records are missing county/geography fields.`);
if (!meta?.sourceReleaseDate) report.warnings.push("Source release date is unknown/not parsed.");
report.warnings = [...new Set(report.warnings)].slice(0, 200);
report.status = report.errors.length ? "fail" : (report.warnings.length ? "warn" : "pass");
if (meta) { meta.validationStatus = report.status; meta.safeToDisplay = report.status !== "fail" && meta.previewLabelRequired === true; meta.lastKnownGood = { exists: existsSync(lkgPath), path: "data/last-known-good/cms-hospitals.generated.json", updatedThisRun: false }; }
writeFileSync(generatedPath, `${JSON.stringify(generated, null, 2)}\n`);
if (report.status !== "fail" && meta?.dataMode === "real-public-data") { copyFileSync(generatedPath, lkgPath); report.fallback.lastKnownGoodExists = true; report.fallback.lastKnownGoodUpdated = true; meta.lastKnownGood = { exists: true, path: "data/last-known-good/cms-hospitals.generated.json", updatedThisRun: true }; writeFileSync(generatedPath, `${JSON.stringify(generated, null, 2)}\n`); }
if (report.status !== "fail" && meta?.dataMode === "synthetic-test-fixture") report.warnings.push("Fixture validation passed without updating last-known-good.");
writeFileSync(validationPath, `${JSON.stringify(report, null, 2)}\n`);
console.log(`CMS hospital validation: ${report.status.toUpperCase()}`);
console.log(`Records: ${report.recordCount}`);
process.exit(report.status === "fail" ? 1 : 0);
