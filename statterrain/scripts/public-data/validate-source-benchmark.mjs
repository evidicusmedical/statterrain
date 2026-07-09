import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const benchmarkPath = resolve(__dirname, "../../data/sources/source-benchmark.json");
const benchmark = JSON.parse(readFileSync(benchmarkPath, "utf8"));
const errors = [];
const requiredCandidateFields = [
  "id",
  "name",
  "agency",
  "category",
  "facilityTypesSupported",
  "summaryMetricsSupported",
  "sourceAuthority",
  "accessPattern",
  "accessStatus",
  "sourceUrl",
  "metadataUrl",
  "downloadUrl",
  "dataDictionaryUrl",
  "format",
  "estimatedIngestionDifficulty",
  "estimatedRefreshDifficulty",
  "estimatedRecordVolume",
  "containsCoordinates",
  "containsAddress",
  "containsPhone",
  "containsFacilityType",
  "containsOperatingStatus",
  "containsCapabilityFlags",
  "licenseOrUseNotes",
  "knownLimitations",
  "notAllowedUse",
  "primaryUse",
  "redundancyRole",
  "recommendedPatch",
  "priorityScore",
  "rationale",
];
const categoriesRequired = new Set([
  "facility",
  "population_geography",
  "behavioral_health_pharmacy",
  "future_capability",
]);
const enumFields = {
  accessStatus: new Set(["verified", "needs-verification", "future-research"]),
  estimatedIngestionDifficulty: new Set(["low", "medium", "high"]),
  estimatedRefreshDifficulty: new Set(["low", "medium", "high"]),
  estimatedRecordVolume: new Set(["small", "medium", "large", "very-large", "unknown"]),
  containsCoordinates: new Set(["yes", "no", "partial", "unknown"]),
  containsAddress: new Set(["yes", "no", "partial", "unknown"]),
  containsPhone: new Set(["yes", "no", "partial", "unknown"]),
  containsFacilityType: new Set(["yes", "no", "partial", "unknown"]),
  containsOperatingStatus: new Set(["yes", "no", "partial", "unknown"]),
  containsCapabilityFlags: new Set(["yes", "no", "partial", "unknown"]),
  redundancyRole: new Set(["primary", "secondary", "supplemental", "candidate-only", "future-research"]),
};
const prohibitedUses = new Set([
  "live routing",
  "diversion status",
  "bed availability",
  "dispatch",
  "triage",
  "transfer decisions",
  "medical-control guidance",
  "clinical decision support",
]);

if (benchmark.schemaVersion !== "public-data-source-benchmark-v0.2.1") {
  errors.push("schemaVersion must be public-data-source-benchmark-v0.2.1.");
}
if (benchmark.appVisibleDataMode !== "synthetic-demo") {
  errors.push("appVisibleDataMode must remain synthetic-demo.");
}
if (benchmark.externalRecordsIngested !== false) {
  errors.push("externalRecordsIngested must be false.");
}
if (!Array.isArray(benchmark.categories)) {
  errors.push("categories must be an array.");
}

const ids = new Set();
const categoryIds = new Set();
let candidateCount = 0;
for (const category of benchmark.categories ?? []) {
  categoryIds.add(category.id);
  if (!Array.isArray(category.candidates) || category.candidates.length === 0) {
    errors.push(`${category.id}: candidates must be a non-empty array.`);
    continue;
  }
  for (const [index, candidate] of category.candidates.entries()) {
    candidateCount += 1;
    for (const field of requiredCandidateFields) {
      if (!(field in candidate)) errors.push(`${category.id}.candidates[${index}] missing ${field}.`);
    }
    if (candidate.category !== category.id) errors.push(`${candidate.id}: category must match enclosing category.`);
    if (ids.has(candidate.id)) errors.push(`Duplicate candidate id: ${candidate.id}`);
    ids.add(candidate.id);
    for (const [field, values] of Object.entries(enumFields)) {
      if (!values.has(candidate[field])) errors.push(`${candidate.id}: ${field} has invalid value ${candidate[field]}.`);
    }
    if (!Number.isInteger(candidate.priorityScore) || candidate.priorityScore < 0 || candidate.priorityScore > 100) {
      errors.push(`${candidate.id}: priorityScore must be an integer from 0 to 100.`);
    }
    if (!Array.isArray(candidate.knownLimitations) || candidate.knownLimitations.length === 0) {
      errors.push(`${candidate.id}: knownLimitations must be a non-empty array.`);
    }
    for (const use of prohibitedUses) {
      if (!candidate.notAllowedUse?.includes(use)) errors.push(`${candidate.id}: notAllowedUse missing ${use}.`);
    }
  }
}
for (const category of categoriesRequired) if (!categoryIds.has(category)) errors.push(`Missing category ${category}.`);
if (candidateCount < 20) errors.push(`Expected at least 20 benchmark candidates; found ${candidateCount}.`);

const rankedIds = benchmark.rankedCandidates?.map((candidate) => candidate.id) ?? [];
for (const id of ids) if (!rankedIds.includes(id)) errors.push(`${id}: missing from rankedCandidates.`);
if (benchmark.rankedCandidates?.[0]?.id !== "cms-hospital-general-information") {
  errors.push("CMS Hospital General Information must be the top v0.2.2 intake candidate.");
}
if (errors.length) {
  console.error("Public data source benchmark validation: FAIL");
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}
console.log("Public data source benchmark validation: PASS");
console.log(`Validated ${candidateCount} benchmark candidates. No app-visible real public records are configured.`);
