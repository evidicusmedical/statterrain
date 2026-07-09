import { copyFileSync, existsSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
const __dirname = dirname(fileURLToPath(import.meta.url));
const appRoot = resolve(__dirname, "../..");
const version = "v0.2.2";
const generatedPath = resolve(appRoot, "data/generated/cms-hospitals.generated.json");
const validationPath = resolve(appRoot, `data/reports/cms-hospitals-validation-${version}.json`);
const refreshPath = resolve(appRoot, `data/reports/cms-hospitals-refresh-${version}.json`);
const lkgPath = resolve(appRoot, "data/last-known-good/cms-hospitals.generated.json");
const forbidden = [/patient/i, /claim/i, /phi/i, /bed/i, /diversion/i, /routing/i, /triage/i, /transferRecommendation/i, /dispatch/i, /clinicalDecision/i, /medicalControl/i];
const report = { schemaVersion: "cms-hospitals-validation-v0.2.2", generatedAt: new Date().toISOString(), generatedPath: "data/generated/cms-hospitals.generated.json", status: "fail", recordCount: 0, warnings: [], errors: [], fallback: { lastKnownGoodExists: existsSync(lkgPath), lastKnownGoodUpdated: false } };
if (!existsSync(generatedPath)) {
  const refresh = existsSync(refreshPath) ? JSON.parse(readFileSync(refreshPath, "utf8")) : null;
  if (refresh?.fetchStatus === "fetch-failed") { report.status = "warn"; report.warnings.push("Fetch failed gracefully; no generated file exists and no fake records were created."); }
  else report.errors.push("Generated CMS hospital file is missing.");
  writeFileSync(validationPath, `${JSON.stringify(report, null, 2)}\n`);
  console.log(`CMS hospital validation: ${report.status.toUpperCase()}`);
  process.exit(report.status === "fail" ? 1 : 0);
}
const generated = JSON.parse(readFileSync(generatedPath, "utf8"));
const meta = generated.metadata;
const records = generated.records;
if (!meta) report.errors.push("metadata block missing.");
if (!Array.isArray(records)) report.errors.push("records must be an array.");
report.recordCount = Array.isArray(records) ? records.length : 0;
if (meta?.recordCount !== report.recordCount) report.errors.push("metadata recordCount does not match records length.");
if (meta?.dataMode !== "real-public-data") report.errors.push("dataMode must be real-public-data.");
if (meta?.usedInCurrentApp !== false) report.errors.push("usedInCurrentApp must remain false in v0.2.2.");
if (!Array.isArray(meta?.prohibitedUses) || !meta.prohibitedUses.length) report.errors.push("prohibited uses are missing.");
if (!Array.isArray(meta?.limitations) || !meta.limitations.length) report.errors.push("source limitations are missing.");
if (!meta?.retrievedAt || !meta?.sourceId || !meta?.sourceName) report.errors.push("generated metadata must include retrievedAt/sourceId/sourceName.");
if (report.recordCount === 0) report.errors.push("Generated CMS hospital file contains no records after a successful fetch.");
for (const [index, record] of (records ?? []).entries()) {
  for (const field of ["sourceFacilityId", "facilityName", "facilityCategory", "sourceId", "sourceName", "retrievedAt"]) if (!record[field]) report.errors.push(`record ${index} missing ${field}.`);
  if (record.facilityCategory !== "hospital") report.errors.push(`record ${index} facilityCategory must be hospital.`);
  for (const field of ["address", "city", "state", "zip"]) if (field in record && record[field] === undefined) report.errors.push(`record ${index} invalid ${field}.`);
  for (const coord of ["latitude", "longitude"]) if (record[coord] !== null && typeof record[coord] !== "number") report.errors.push(`record ${index} ${coord} must be number or null.`);
  if (record.emergencyServices && !record.sourceFieldsUsed?.some((f) => /emergency/i.test(f))) report.errors.push(`record ${index} emergencyServices is not source-supported.`);
  if (record.criticalAccessHospital !== null && !record.sourceFieldsUsed?.some((f) => /hospital.*type/i.test(f) || /type/i.test(f))) report.errors.push(`record ${index} criticalAccessHospital is not source-supported.`);
  for (const key of Object.keys(record)) for (const pattern of forbidden) if (pattern.test(key)) report.errors.push(`record ${index} has forbidden field ${key}.`);
  if (record.latitude === null || record.longitude === null) report.warnings.push(`record ${index} requires future geocoding.`);
  if (!record.phone) report.warnings.push(`record ${index} missing phone.`);
  if (!record.countyName) report.warnings.push(`record ${index} missing county.`);
}
if (!meta?.sourceReleaseDate) report.warnings.push("Source release date is unknown/not parsed.");
report.warnings = [...new Set(report.warnings)].slice(0, 200);
report.status = report.errors.length ? "fail" : (report.warnings.length ? "warn" : "pass");
if (meta) { meta.validationStatus = report.status; meta.safeToDisplay = report.status !== "fail"; meta.lastKnownGood = { exists: existsSync(lkgPath), path: "data/last-known-good/cms-hospitals.generated.json", updatedThisRun: false }; }
writeFileSync(generatedPath, `${JSON.stringify(generated, null, 2)}\n`);
if (report.status !== "fail") { copyFileSync(generatedPath, lkgPath); report.fallback.lastKnownGoodExists = true; report.fallback.lastKnownGoodUpdated = true; meta.lastKnownGood = { exists: true, path: "data/last-known-good/cms-hospitals.generated.json", updatedThisRun: true }; writeFileSync(generatedPath, `${JSON.stringify(generated, null, 2)}\n`); }
writeFileSync(validationPath, `${JSON.stringify(report, null, 2)}\n`);
console.log(`CMS hospital validation: ${report.status.toUpperCase()}`);
console.log(`Records: ${report.recordCount}`);
process.exit(report.status === "fail" ? 1 : 0);
