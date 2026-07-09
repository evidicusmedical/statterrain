import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
const __dirname = dirname(fileURLToPath(import.meta.url));
const appRoot = resolve(__dirname, "../..");
const version = "v0.2.8";
const generatedPath = resolve(appRoot, "data/generated/cms-dialysis.generated.json");
const refreshPath = resolve(appRoot, `data/reports/cms-dialysis-refresh-${version}.json`);
const validationPath = resolve(appRoot, `data/reports/cms-dialysis-validation-${version}.json`);
const qualityPath = resolve(appRoot, `data/reports/cms-dialysis-quality-summary-${version}.json`);
const geocodingInputPath = resolve(appRoot, `data/generated/geocoding-inputs/cms-dialysis-geocoding-input-${version}.json`);
const lkgPath = resolve(appRoot, "data/last-known-good/cms-dialysis.generated.json");
const forbidden = [/patient/i, /claim/i, /appointment/i, /treatment.*schedule/i, /^schedule$/i, /capacity/i, /staff/i, /station/i, /routing/i, /diversion/i, /bed/i, /dispatch/i, /triage/i, /transfer/i, /clinicalDecision/i, /medicalControl/i, /referral/i];
const report = { schemaVersion: "cms-dialysis-validation-v0.2.8", generatedAt: new Date().toISOString(), status: "fail", recordCount: 0, dataMode: null, warnings: [], errors: [], fallback: { lastKnownGoodExists: existsSync(lkgPath), lastKnownGoodUpdated: false } };
if (!existsSync(generatedPath)) {
  const refresh = existsSync(refreshPath) ? JSON.parse(readFileSync(refreshPath, "utf8")) : null;
  if (["fetch-failed", "no-data"].includes(refresh?.dataMode) || ["fetch-failed", "no-data"].includes(refresh?.fetchStatus)) { report.status = "warn"; report.dataMode = refresh.dataMode; report.warnings.push(`Expected safe no-publish state: ${refresh.fetchStatus}.`); }
  else report.errors.push("Generated CMS dialysis artifact is missing and no safe fetch-failure report explains it.");
  writeFileSync(validationPath, `${JSON.stringify(report, null, 2)}\n`);
  console.log(`CMS dialysis validation: ${report.status.toUpperCase()}`);
  process.exit(report.status === "fail" ? 1 : 0);
}
const generated = JSON.parse(readFileSync(generatedPath, "utf8"));
const meta = generated.metadata;
const records = Array.isArray(generated.records) ? generated.records : [];
report.recordCount = records.length;
report.dataMode = meta?.dataMode ?? null;
if (!meta) report.errors.push("metadata block missing.");
if (!Array.isArray(generated.records)) report.errors.push("records must be an array.");
if (!["real-public-data", "synthetic-test-fixture", "fetch-failed", "no-data"].includes(meta?.dataMode)) report.errors.push("dataMode is invalid.");
if (meta?.usedInCurrentApp !== false) report.errors.push("usedInCurrentApp must be false.");
if (meta?.previewLabelRequired !== true) report.errors.push("previewLabelRequired must be true.");
if (meta?.safeToDisplay !== false) report.errors.push("safeToDisplay must remain false in v0.2.8 dialysis pilot.");
if (!Array.isArray(meta?.prohibitedUses) || !meta.prohibitedUses.length) report.errors.push("prohibited uses are missing.");
if (!Array.isArray(meta?.limitations) || !meta.limitations.length) report.errors.push("limitations are missing.");
if (!meta?.sourceId || !meta?.sourceName || !meta?.retrievedAt) report.errors.push("metadata missing sourceId/sourceName/retrievedAt.");
if (!existsSync(qualityPath)) report.errors.push("quality summary is missing.");
if (!existsSync(geocodingInputPath)) report.errors.push("geocoding input is missing.");
if (meta?.dataMode === "synthetic-test-fixture") {
  if (meta.lastKnownGood?.updatedThisRun !== false) report.errors.push("fixture data must never update last-known-good.");
  report.warnings.push("Fixture-only dialysis artifact is schema-test data and not real public data.");
}
for (const [index, record] of records.entries()) {
  if (meta?.dataMode === "real-public-data" && (!record.sourceFacilityId || !record.facilityName)) report.errors.push(`real record ${index} missing sourceFacilityId or facilityName.`);
  if (meta?.dataMode === "synthetic-test-fixture" && (record.syntheticFixtureRecord !== true || record.dataMode !== "synthetic-test-fixture")) report.errors.push(`fixture record ${index} is not clearly labeled synthetic-test-fixture.`);
  if (record.usedInCurrentApp !== false) report.errors.push(`record ${index} usedInCurrentApp must be false.`);
  if (record.previewLabelRequired !== true) report.errors.push(`record ${index} previewLabelRequired must be true.`);
  if (record.latitude !== null || record.longitude !== null) report.errors.push(`record ${index} coordinates must be null until official coordinates or future geocoding exist.`);
  if (record.geocodingStatus !== "not-yet-geocoded") report.errors.push(`record ${index} geocodingStatus must be not-yet-geocoded.`);
  if (record.geographyJoinStatus !== "not-yet-joined") report.errors.push(`record ${index} geographyJoinStatus must be not-yet-joined.`);
  for (const field of ["address", "state", "zip"]) if (!(field in record)) report.errors.push(`record ${index} missing explicit ${field} field.`);
  for (const key of Object.keys(record)) for (const pattern of forbidden) if (pattern.test(key)) report.errors.push(`record ${index} has forbidden field ${key}.`);
}
report.warnings = [...new Set(report.warnings)];
report.status = report.errors.length ? "fail" : (report.warnings.length ? "warn" : "pass");
if (meta) { meta.validationStatus = report.status; meta.safeToDisplay = false; meta.lastKnownGood = { exists: existsSync(lkgPath), path: "data/last-known-good/cms-dialysis.generated.json", updatedThisRun: false }; writeFileSync(generatedPath, `${JSON.stringify(generated, null, 2)}\n`); }
writeFileSync(validationPath, `${JSON.stringify(report, null, 2)}\n`);
console.log(`CMS dialysis validation: ${report.status.toUpperCase()}`);
console.log(`Records: ${report.recordCount}`);
process.exit(report.status === "fail" ? 1 : 0);
