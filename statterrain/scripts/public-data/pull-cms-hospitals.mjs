import { createHash } from "node:crypto";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const appRoot = resolve(__dirname, "../..");
const rel = (p) => relative(appRoot, p).replaceAll("\\", "/");
const version = "v0.2.3";
const args = new Set(process.argv.slice(2));
const fixtureMode = args.has("--fixture");
const benchmarkPath = resolve(appRoot, "data/sources/source-benchmark.json");
const fixturePath = resolve(
  appRoot,
  "data/fixtures/cms-hospitals/sample-cms-hospital-general-information-v0.2.3.json",
);
const rawDir = resolve(appRoot, "data/raw/cms-hospitals");
const normalizedDir = resolve(appRoot, "data/normalized/cms-hospitals");
const generatedDir = resolve(appRoot, "data/generated");
const reportsDir = resolve(appRoot, "data/reports");
const geocodingDir = resolve(appRoot, "data/generated/geocoding-inputs");
const lkgDir = resolve(appRoot, "data/last-known-good");
for (const dir of [
  rawDir,
  normalizedDir,
  generatedDir,
  reportsDir,
  geocodingDir,
  lkgDir,
])
  mkdirSync(dir, { recursive: true });
const rawMetadataPath = resolve(
  rawDir,
  `cms-hospitals-raw-metadata-${version}.json`,
);
const rawDataPath = resolve(rawDir, `cms-hospitals-raw-${version}.json`);
const normalizedPath = resolve(
  normalizedDir,
  `cms-hospitals-normalized-${version}.json`,
);
const generatedPath = resolve(generatedDir, "cms-hospitals.generated.json");
const qualityPath = resolve(
  reportsDir,
  `cms-hospitals-quality-summary-${version}.json`,
);
const geocodingInputPath = resolve(
  geocodingDir,
  `cms-hospitals-geocoding-input-${version}.json`,
);
const validationPath = resolve(
  reportsDir,
  `cms-hospitals-validation-${version}.json`,
);
const refreshPath = resolve(
  reportsDir,
  `cms-hospitals-refresh-${version}.json`,
);
const lkgPath = resolve(lkgDir, "cms-hospitals.generated.json");
const retrievedAt = new Date().toISOString();
const benchmark = JSON.parse(readFileSync(benchmarkPath, "utf8"));
const candidates = (benchmark.categories ?? []).flatMap(
  (category) => category.candidates ?? [],
);
const source = candidates.find(
  (candidate) => candidate.id === "cms-hospital-general-information",
);
if (!source)
  throw new Error(
    "CMS Hospital General Information candidate is missing from source benchmark.",
  );
const datastoreUrl =
  "https://data.cms.gov/provider-data/api/1/datastore/query/xubh-q36u/0?limit=50000";
const probeUrl =
  "https://data.cms.gov/provider-data/api/1/datastore/query/xubh-q36u/0?limit=5";
const useful = (value) =>
  typeof value === "string" && value.trim() && value !== "TBD";
const endpointCandidates = [
  useful(source.downloadUrl) && {
    role: "benchmark-downloadUrl",
    url: source.downloadUrl,
  },
  useful(source.metadataUrl) && {
    role: "benchmark-metadataUrl",
    url: source.metadataUrl,
  },
  useful(source.sourceUrl) && {
    role: "benchmark-sourceUrl",
    url: source.sourceUrl,
  },
  { role: "known-cms-provider-data-datastore", url: datastoreUrl },
  { role: "known-cms-provider-data-probe", url: probeUrl },
].filter(Boolean);
const headers = {
  accept: "application/json",
  "user-agent":
    "StatTerrain public-data ingestion prototype v0.2.3 (contact: mathew.h.lowe+statterrain@gmail.com)",
};
const baseLimitations = [
  ...(source.knownLimitations ?? []),
  "Coordinates require geocoding before any map preview. Live-geocoded preview artifacts must state that coordinates were derived from a bounded live Census Geocoder run and are for public-data preview context only.",
  "CMS data do not power the main app map in the current prototype.",
];

function classifyError(error) {
  if (error?.name === "AbortError") return "timeout";
  if (/json/i.test(String(error?.message))) return "invalid-json";
  return "network-blocked";
}
async function fetchWithTimeout(url, timeoutMs = 12000) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(url, {
      headers,
      signal: controller.signal,
      redirect: "follow",
    });
  } finally {
    clearTimeout(timeout);
  }
}
async function tryEndpoint(candidate) {
  const attempts = [];
  for (let attempt = 1; attempt <= 3; attempt += 1) {
    try {
      const response = await fetchWithTimeout(candidate.url);
      const text = await response.text();
      const detail = {
        attempt,
        endpointRole: candidate.role,
        requestedUrl: candidate.url,
        finalUrl: response.url,
        httpStatus: response.status,
        statusText: response.statusText,
        responseHeaders: {
          contentType: response.headers.get("content-type"),
          contentLength: response.headers.get("content-length"),
          lastModified: response.headers.get("last-modified"),
          etag: response.headers.get("etag"),
        },
        checksumSha256: createHash("sha256").update(text).digest("hex"),
      };
      attempts.push(detail);
      if (!response.ok) {
        detail.fetchStatus = "non-2xx";
        detail.errorPreview = text.slice(0, 200);
        if (response.status >= 500 && attempt < 3)
          await new Promise((r) => setTimeout(r, 250 * attempt));
        else return { ok: false, status: "non-2xx", attempts };
        continue;
      }
      let payload;
      try {
        payload = JSON.parse(text);
      } catch (error) {
        detail.fetchStatus = "invalid-json";
        detail.error = String(error.message ?? error);
        return { ok: false, status: "invalid-json", attempts };
      }
      const rows = extractRows(payload);
      if (!rows.length) {
        detail.fetchStatus = "empty-records";
        return { ok: false, status: "empty-records", attempts };
      }
      if (!looksLikeCmsHospital(rows[0])) {
        detail.fetchStatus = "schema-unrecognized";
        return { ok: false, status: "schema-unrecognized", attempts };
      }
      detail.fetchStatus = "success";
      return {
        ok: true,
        status: "success",
        text,
        payload,
        rows,
        attempts,
        selected: detail,
      };
    } catch (error) {
      attempts.push({
        attempt,
        endpointRole: candidate.role,
        requestedUrl: candidate.url,
        fetchStatus: classifyError(error),
        error: String(error.message ?? error),
      });
      if (attempt < 3) await new Promise((r) => setTimeout(r, 250 * attempt));
    }
  }
  return {
    ok: false,
    status: attempts.at(-1)?.fetchStatus ?? "network-blocked",
    attempts,
  };
}
function extractRows(payload) {
  return (
    payload?.results ?? payload?.data ?? (Array.isArray(payload) ? payload : [])
  );
}
function looksLikeCmsHospital(row) {
  return Boolean(
    get(row, "Facility ID", "facility_id", "Provider ID", "provider_id") &&
    get(row, "Facility Name", "facility_name"),
  );
}
function get(row, ...names) {
  return (
    names
      .map((n) => row?.[n])
      .find((v) => v !== undefined && v !== null && String(v).trim() !== "") ??
    null
  );
}
function normalize(rows, dataMode) {
  return rows.map((row, index) => {
    const hospitalType = get(row, "Hospital Type", "hospital_type");
    const emergency = get(row, "Emergency Services", "emergency_services");
    return {
      sourceFacilityId: String(
        get(row, "Facility ID", "facility_id", "Provider ID", "provider_id") ??
          `missing-${index}`,
      ),
      facilityName: get(row, "Facility Name", "facility_name"),
      facilityCategory: "hospital",
      facilityTypeLabel: hospitalType,
      hospitalType,
      emergencyServices: emergency,
      criticalAccessHospital: hospitalType
        ? /critical access/i.test(String(hospitalType))
        : null,
      address: get(row, "Address", "address"),
      city: get(row, "City", "city"),
      state: get(row, "State", "state"),
      zip: get(row, "ZIP Code", "zip_code"),
      countyName: get(row, "County Name", "county_name"),
      phone: get(row, "Phone Number", "phone_number"),
      latitude: null,
      longitude: null,
      geocodingStatus: "not-yet-geocoded",
      geographyJoinStatus: "not-yet-joined",
      sourceId: source.id,
      sourceName: source.name,
      sourceAgency: source.agency,
      sourceRecordId: String(
        get(row, "Facility ID", "facility_id", "Provider ID", "provider_id") ??
          `row-${index}`,
      ),
      sourceFieldsUsed: Object.keys(row).filter((k) =>
        [
          "Facility ID",
          "facility_id",
          "Facility Name",
          "facility_name",
          "Hospital Type",
          "hospital_type",
          "Emergency Services",
          "emergency_services",
          "Address",
          "address",
          "City",
          "city",
          "State",
          "state",
          "ZIP Code",
          "zip_code",
          "County Name",
          "county_name",
          "Phone Number",
          "phone_number",
          "synthetic_fixture_record",
        ].includes(k),
      ),
      retrievedAt,
      confidence:
        dataMode === "synthetic-test-fixture"
          ? "synthetic-test-fixture"
          : "source-record",
      dataMode,
      syntheticFixtureRecord:
        dataMode === "synthetic-test-fixture" ? true : undefined,
      freshness: { retrievedAt, sourceReleaseDate: null },
      limitations: baseLimitations,
    };
  });
}
function writeOutputs({ rows, text, selected, attempts, dataMode }) {
  writeFileSync(rawDataPath, `${text}\n`);
  const records = normalize(rows, dataMode);
  const missingCoordinates = records.filter(
    (r) => r.latitude === null || r.longitude === null,
  ).length;
  const missingGeography = records.filter((r) => !r.countyName).length;
  const quality = {
    schemaVersion: "cms-hospitals-quality-summary-v0.2.3",
    generatedAt: retrievedAt,
    sourceId: source.id,
    dataMode,
    recordCount: records.length,
    missingCoordinates: {
      count: missingCoordinates,
      percent: records.length ? missingCoordinates / records.length : 0,
    },
    missingGeography: {
      count: missingGeography,
      percent: records.length ? missingGeography / records.length : 0,
    },
    warnings: [
      "Coordinates are intentionally null pending a future geocoding patch.",
      "Geography joins are not available for the current artifact.",
    ],
  };
  const geocodingInput = {
    schemaVersion: "cms-hospitals-geocoding-input-v0.2.3",
    generatedAt: retrievedAt,
    sourceId: source.id,
    dataMode,
    recordCount: records.length,
    allowedUse:
      "future deterministic geocoding preparation only; not a geocoded output",
    records: records.map((r) => ({
      sourceFacilityId: r.sourceFacilityId,
      facilityName: r.facilityName,
      address: r.address,
      city: r.city,
      state: r.state,
      zip: r.zip,
    })),
  };
  const rawMetadata = {
    schemaVersion: "cms-hospitals-raw-metadata-v0.2.3",
    sourceId: source.id,
    sourceName: source.name,
    agency: source.agency,
    sourceUrl: source.sourceUrl,
    retrievalTimestamp: retrievedAt,
    retrievalMethod:
      dataMode === "synthetic-test-fixture"
        ? "local-fixture"
        : "fetch-json-api",
    fetchStatus: "success",
    fixtureMode,
    dataMode,
    finalUrl: selected?.finalUrl ?? rel(fixturePath),
    httpStatus: selected?.httpStatus ?? null,
    statusText: selected?.statusText ?? null,
    responseHeaders: selected?.responseHeaders ?? null,
    checksumSha256: createHash("sha256").update(text).digest("hex"),
    rawFilePath: rel(rawDataPath),
    endpointResolutionAttempts: attempts,
    sourceBenchmarkReference: rel(benchmarkPath),
    limitations: baseLimitations,
  };
  writeFileSync(rawMetadataPath, `${JSON.stringify(rawMetadata, null, 2)}\n`);
  writeFileSync(
    normalizedPath,
    `${JSON.stringify({ schemaVersion: "cms-hospitals-normalized-v0.2.3", sourceId: source.id, sourceName: source.name, sourceAgency: source.agency, retrievedAt, dataMode, recordCount: records.length, records }, null, 2)}\n`,
  );
  writeFileSync(qualityPath, `${JSON.stringify(quality, null, 2)}\n`);
  writeFileSync(
    geocodingInputPath,
    `${JSON.stringify(geocodingInput, null, 2)}\n`,
  );
  const generated = {
    metadata: {
      schemaVersion: "generated-public-data-v0.2.0",
      datasetId: "cms-hospitals-baseline-v0.2.3",
      sourceId: source.id,
      sourceName: source.name,
      sourceAgency: source.agency,
      dataMode,
      fixtureMode,
      usedInCurrentApp: false,
      previewLabelRequired: true,
      recordCount: records.length,
      retrievedAt,
      sourceReleaseDate: null,
      validationStatus: "pending",
      validationReportPath: rel(validationPath),
      rawSnapshotMetadataPath: rel(rawMetadataPath),
      normalizedDatasetPath: rel(normalizedPath),
      qualitySummaryPath: rel(qualityPath),
      geocodingInputPath: rel(geocodingInputPath),
      lastKnownGood: {
        exists: existsSync(lkgPath),
        path: rel(lkgPath),
        updatedThisRun: false,
      },
      limitations: baseLimitations,
      allowedUses: [
        "planning",
        "public-data situational awareness",
        "data pipeline validation",
      ],
      prohibitedUses: source.notAllowedUse,
      fallbackActive: false,
      safeToDisplay: false,
    },
    records,
  };
  writeFileSync(generatedPath, `${JSON.stringify(generated, null, 2)}\n`);
  writeFileSync(
    refreshPath,
    `${JSON.stringify({ schemaVersion: "cms-hospitals-refresh-v0.2.3", sourceId: source.id, datasetId: "cms-hospitals-baseline-v0.2.3", refreshAttemptTimestamp: retrievedAt, fetchStatus: "success", fixtureMode, dataMode, finalUrl: rawMetadata.finalUrl, rawSnapshotMetadataPath: rel(rawMetadataPath), normalizedOutputPath: rel(normalizedPath), generatedOutputPath: rel(generatedPath), qualitySummaryPath: rel(qualityPath), geocodingInputPath: rel(geocodingInputPath), validationReportPath: rel(validationPath), recordCount: records.length, warnings: ["Validation must be run before display eligibility is evaluated.", dataMode === "synthetic-test-fixture" ? "Fixture output is for deterministic tests only and must not update last-known-good." : "Coordinates require future geocoding."], errors: [], fallbackStatus: { fallbackActive: false, lastKnownGoodExists: existsSync(lkgPath), lastKnownGoodPath: rel(lkgPath) }, publishRecommendation: "validate-before-preview; do-not-power-main-ui", nextRecommendedAction: "Run npm run data:validate-cms-hospitals." }, null, 2)}\n`,
  );
  console.log(
    `CMS hospital pull completed with ${records.length} records (${dataMode}).`,
  );
}

if (fixtureMode) {
  const text = readFileSync(fixturePath, "utf8");
  const payload = JSON.parse(text);
  const rows = extractRows(payload);
  if (!rows.length || !looksLikeCmsHospital(rows[0]))
    throw new Error("Fixture schema is unrecognized.");
  writeOutputs({
    rows,
    text,
    selected: null,
    attempts: [
      {
        endpointRole: "local-fixture",
        requestedUrl: rel(fixturePath),
        fetchStatus: "success",
      },
    ],
    dataMode: "synthetic-test-fixture",
  });
} else {
  const allAttempts = [];
  let failureStatus = "network-blocked";
  for (const candidate of endpointCandidates) {
    const result = await tryEndpoint(candidate);
    allAttempts.push(...result.attempts);
    failureStatus = result.status;
    if (result.ok) {
      writeOutputs({
        rows: result.rows,
        text: result.text,
        selected: result.selected,
        attempts: allAttempts,
        dataMode: "real-public-data",
      });
      process.exit(0);
    }
  }
  const rawMetadata = {
    schemaVersion: "cms-hospitals-raw-metadata-v0.2.3",
    sourceId: source.id,
    sourceName: source.name,
    agency: source.agency,
    sourceUrl: source.sourceUrl,
    retrievalTimestamp: retrievedAt,
    retrievalMethod: "fetch-json-api",
    fetchStatus: failureStatus,
    fixtureMode: false,
    dataMode: "no-data",
    finalUrl: null,
    httpStatus: allAttempts.at(-1)?.httpStatus ?? null,
    statusText: allAttempts.at(-1)?.statusText ?? null,
    responseHeaders: allAttempts.at(-1)?.responseHeaders ?? null,
    checksumSha256: null,
    rawFilePath: null,
    endpointResolutionAttempts: allAttempts,
    sourceBenchmarkReference: rel(benchmarkPath),
    limitations: [
      ...baseLimitations,
      "No generated real records published for this failed refresh attempt.",
    ],
  };
  writeFileSync(rawMetadataPath, `${JSON.stringify(rawMetadata, null, 2)}\n`);
  writeFileSync(
    refreshPath,
    `${JSON.stringify({ schemaVersion: "cms-hospitals-refresh-v0.2.3", sourceId: source.id, datasetId: "cms-hospitals-baseline-v0.2.3", refreshAttemptTimestamp: retrievedAt, fetchStatus: failureStatus, fixtureMode: false, dataMode: "no-data", rawSnapshotMetadataPath: rel(rawMetadataPath), recordCount: 0, warnings: [], errors: [`CMS fetch failed with status: ${failureStatus}`], fallbackStatus: { fallbackActive: existsSync(lkgPath), lastKnownGoodExists: existsSync(lkgPath), lastKnownGoodPath: rel(lkgPath) }, publishRecommendation: "do-not-publish", nextRecommendedAction: "Retry in connected environment or update source URL; no app-visible data changed." }, null, 2)}\n`,
  );
  console.warn(
    "CMS hospital pull fetch failed gracefully; no fabricated real records were created.",
  );
  console.warn(`Fetch status: ${failureStatus}`);
}
