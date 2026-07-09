import { createHash } from "node:crypto";
import { copyFileSync, existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const appRoot = resolve(__dirname, "../..");
const rel = (p) => relative(appRoot, p).replaceAll("\\", "/");
const version = "v0.2.2";
const benchmarkPath = resolve(appRoot, "data/sources/source-benchmark.json");
const rawDir = resolve(appRoot, "data/raw/cms-hospitals");
const normalizedDir = resolve(appRoot, "data/normalized/cms-hospitals");
const generatedDir = resolve(appRoot, "data/generated");
const reportsDir = resolve(appRoot, "data/reports");
const lkgDir = resolve(appRoot, "data/last-known-good");
for (const dir of [rawDir, normalizedDir, generatedDir, reportsDir, lkgDir]) mkdirSync(dir, { recursive: true });
const rawMetadataPath = resolve(rawDir, `cms-hospitals-raw-metadata-${version}.json`);
const rawDataPath = resolve(rawDir, `cms-hospitals-raw-${version}.json`);
const normalizedPath = resolve(normalizedDir, `cms-hospitals-normalized-${version}.json`);
const generatedPath = resolve(generatedDir, "cms-hospitals.generated.json");
const validationPath = resolve(reportsDir, `cms-hospitals-validation-${version}.json`);
const refreshPath = resolve(reportsDir, `cms-hospitals-refresh-${version}.json`);
const lkgPath = resolve(lkgDir, "cms-hospitals.generated.json");
const retrievedAt = new Date().toISOString();
const benchmark = JSON.parse(readFileSync(benchmarkPath, "utf8"));
const candidates = (benchmark.categories ?? []).flatMap((category) => category.candidates ?? []);
const source = candidates.find((candidate) => candidate.id === "cms-hospital-general-information");
if (!source) throw new Error("CMS Hospital General Information candidate is missing from source benchmark.");
const downloadUrl = source.downloadUrl && source.downloadUrl !== "TBD" ? source.downloadUrl : `https://data.cms.gov/provider-data/api/1/datastore/query/xubh-q36u/0?limit=50000`;
const baseRefresh = {
  schemaVersion: "cms-hospitals-refresh-v0.2.2",
  sourceId: source.id,
  datasetId: "cms-hospitals-baseline-v0.2.2",
  refreshAttemptTimestamp: retrievedAt,
  sourceUrl: source.sourceUrl,
  downloadUrl,
  rawSnapshotMetadataPath: rel(rawMetadataPath),
  normalizedOutputPath: rel(normalizedPath),
  generatedOutputPath: rel(generatedPath),
  validationReportPath: rel(validationPath),
  recordCount: 0,
  warnings: [],
  errors: [],
  fallbackStatus: { fallbackActive: false, lastKnownGoodExists: existsSync(lkgPath), lastKnownGoodPath: rel(lkgPath) },
  publishRecommendation: "do-not-publish",
  nextRecommendedAction: "Retry in a connected environment or update the source URL if CMS changes the endpoint.",
};
try {
  const response = await fetch(downloadUrl, { headers: { accept: "application/json" } });
  const text = await response.text();
  const rawMetadata = {
    schemaVersion: "cms-hospitals-raw-metadata-v0.2.2",
    sourceId: source.id,
    sourceName: source.name,
    agency: source.agency,
    sourceUrl: source.sourceUrl,
    downloadUrl,
    retrievalTimestamp: retrievedAt,
    retrievalMethod: "fetch-json-api",
    httpStatus: response.status,
    contentType: response.headers.get("content-type"),
    contentLength: response.headers.get("content-length"),
    lastModified: response.headers.get("last-modified"),
    checksumSha256: createHash("sha256").update(text).digest("hex"),
    rawFilePath: response.ok ? rel(rawDataPath) : null,
    sourceBenchmarkReference: rel(benchmarkPath),
    notes: ["Source selected from v0.2.1 benchmark. Endpoint was resolved because benchmark downloadUrl is TBD."],
    limitations: [...(source.knownLimitations ?? []), "Coordinates are not provided by this CMS source and are not geocoded in v0.2.2."],
  };
  writeFileSync(rawMetadataPath, `${JSON.stringify(rawMetadata, null, 2)}\n`);
  if (!response.ok) throw new Error(`Fetch failed with HTTP ${response.status}: ${text.slice(0, 200)}`);
  writeFileSync(rawDataPath, `${text}\n`);
  const payload = JSON.parse(text);
  const rows = payload.results ?? payload.data ?? [];
  const records = rows.map((row, index) => {
    const get = (...names) => names.map((n) => row[n]).find((v) => v !== undefined && v !== null && String(v).trim() !== "") ?? null;
    const hospitalType = get("Hospital Type", "hospital_type");
    const emergency = get("Emergency Services", "emergency_services");
    return {
      sourceFacilityId: String(get("Facility ID", "facility_id", "Provider ID", "provider_id") ?? `missing-${index}`),
      facilityName: get("Facility Name", "facility_name"),
      facilityCategory: "hospital",
      facilityTypeLabel: hospitalType,
      hospitalType,
      emergencyServices: emergency,
      criticalAccessHospital: hospitalType ? /critical access/i.test(String(hospitalType)) : null,
      address: get("Address", "address"), city: get("City", "city"), state: get("State", "state"), zip: get("ZIP Code", "zip_code"),
      countyName: get("County Name", "county_name"), phone: get("Phone Number", "phone_number"),
      latitude: null, longitude: null, geocodingStatus: "not-yet-geocoded",
      sourceId: source.id, sourceName: source.name, sourceAgency: source.agency,
      sourceRecordId: String(get("Facility ID", "facility_id", "Provider ID", "provider_id") ?? `row-${index}`),
      sourceFieldsUsed: Object.keys(row).filter((k) => ["Facility ID","facility_id","Facility Name","facility_name","Hospital Type","hospital_type","Emergency Services","emergency_services","Address","address","City","city","State","state","ZIP Code","zip_code","County Name","county_name","Phone Number","phone_number"].includes(k)),
      retrievedAt, confidence: "source-record", freshness: { retrievedAt, sourceReleaseDate: null },
      limitations: rawMetadata.limitations,
    };
  });
  writeFileSync(normalizedPath, `${JSON.stringify({ schemaVersion: "cms-hospitals-normalized-v0.2.2", sourceId: source.id, sourceName: source.name, sourceAgency: source.agency, retrievedAt, recordCount: records.length, records }, null, 2)}\n`);
  const generated = { metadata: { schemaVersion: "generated-public-data-v0.2.0", datasetId: "cms-hospitals-baseline-v0.2.2", sourceId: source.id, sourceName: source.name, sourceAgency: source.agency, dataMode: "real-public-data", usedInCurrentApp: false, recordCount: records.length, retrievedAt, sourceReleaseDate: null, validationStatus: "pending", validationReportPath: rel(validationPath), rawSnapshotMetadataPath: rel(rawMetadataPath), normalizedDatasetPath: rel(normalizedPath), lastKnownGood: { exists: existsSync(lkgPath), path: rel(lkgPath), updatedThisRun: false }, limitations: rawMetadata.limitations, allowedUses: ["planning", "public-data situational awareness", "data pipeline validation"], prohibitedUses: source.notAllowedUse, fallbackActive: false, safeToDisplay: false }, records };
  writeFileSync(generatedPath, `${JSON.stringify(generated, null, 2)}\n`);
  baseRefresh.recordCount = records.length;
  baseRefresh.validationStatus = "pending";
  baseRefresh.warnings.push("Validation must be run before display eligibility is evaluated.", "Coordinates require v0.2.3 geocoding.");
  baseRefresh.publishRecommendation = "validate-before-use; do-not-power-main-ui";
  baseRefresh.nextRecommendedAction = "Run npm run data:validate-cms-hospitals, then begin v0.2.3 geocoding in a separate patch.";
  writeFileSync(refreshPath, `${JSON.stringify(baseRefresh, null, 2)}\n`);
  console.log(`CMS hospital pull completed with ${records.length} records.`);
} catch (error) {
  const rawMetadata = { schemaVersion: "cms-hospitals-raw-metadata-v0.2.2", sourceId: source.id, sourceName: source.name, agency: source.agency, sourceUrl: source.sourceUrl, downloadUrl, retrievalTimestamp: retrievedAt, retrievalMethod: "fetch-json-api", httpStatus: null, contentType: null, contentLength: null, lastModified: null, checksumSha256: null, rawFilePath: null, sourceBenchmarkReference: rel(benchmarkPath), notes: ["Fetch failed; no fabricated CMS records were created.", "Benchmark downloadUrl is TBD, so script resolved the CMS datastore API endpoint."], limitations: [...(source.knownLimitations ?? []), "No generated real records published for this failed refresh attempt."], error: String(error.message ?? error) };
  writeFileSync(rawMetadataPath, `${JSON.stringify(rawMetadata, null, 2)}\n`);
  const report = { ...baseRefresh, fetchStatus: "fetch-failed", validationStatus: "fail", errors: [String(error.message ?? error)], fallbackStatus: { ...baseRefresh.fallbackStatus, fallbackActive: existsSync(lkgPath) }, publishRecommendation: "do-not-publish", nextRecommendedAction: "Retry in connected environment or update source URL; no app-visible data changed." };
  writeFileSync(refreshPath, `${JSON.stringify(report, null, 2)}\n`);
  console.warn("CMS hospital pull fetch failed gracefully; no generated real records were created.");
  console.warn(String(error.message ?? error));
}
