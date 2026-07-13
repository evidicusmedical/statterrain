import { appendFileSync, existsSync, readFileSync } from "node:fs";

const manifestPath = "data/generated/county-boundaries/manifest.json";
const reportPath = "data/reports/county-boundary-completeness-v0.3.7.json";

function readJson(path) {
  if (!existsSync(path)) return {};
  return JSON.parse(readFileSync(path, "utf8"));
}

function count(value) {
  return Array.isArray(value) ? value.length : 0;
}

function statusFromRun({ validationStatus, coverageStatus, partitionCount, commitStatus, pushStatus, failureStage }) {
  if (failureStage === "runtime-dependency-preflight") {
    return "BLOCKED — COUNTY BOUNDARY RUNTIME DEPENDENCY CHECK FAILED";
  }
  if (failureStage && failureStage !== "none") {
    return "BLOCKED — NATIONAL COUNTY BOUNDARY BUILD FAILED";
  }
  const validated = validationStatus === "PASS" && coverageStatus === "national" && Number(partitionCount) > 0;
  if (validated && commitStatus === "PASS" && pushStatus === "PASS") {
    return "COMPLETE — NATIONAL COUNTY BOUNDARY PARTITIONS BUILT";
  }
  if (validated) {
    return "VALIDATED — NATIONAL COUNTY BOUNDARIES BUILT, COMMIT PENDING";
  }
  return "BLOCKED — NATIONAL COUNTY BOUNDARY BUILD FAILED";
}

const manifest = readJson(manifestPath);
const report = readJson(reportPath);
const boundaryVintage = process.env.BOUNDARY_VINTAGE ?? manifest.vintage ?? "unknown";
const targetBranch = process.env.TARGET_BRANCH ?? "unknown";
const commitRequested = process.env.COMMIT_GENERATED_ARTIFACTS ?? "unknown";
const failureStage = process.env.FAILURE_STAGE ?? "none";
const validationStatus = report.validationStatus ?? manifest.validationStatus ?? "NOT RUN";
const coverageStatus = report.coverageStatus ?? manifest.coverageStatus ?? "NOT RUN";
const partitionCount = report.partitionCount ?? manifest.partitionCount ?? "NOT RUN";
const boundaryFeatureCount = report.boundaryFeatureCount ?? manifest.boundaryFeatureCount ?? "NOT RUN";
const uniqueBoundaryGeoids = report.uniqueBoundaryGeoids ?? manifest.uniqueBoundaryGeoids ?? "NOT RUN";
const commitEligible = validationStatus === "PASS" && coverageStatus === "national" && Number(partitionCount) > 0;
const commitStatus = failureStage !== "none" && commitRequested === "true" ? "BLOCKED" : (process.env.COMMIT_STATUS ?? "not-requested");
const pushStatus = failureStage !== "none" && commitRequested === "true" ? "NOT RUN" : (process.env.PUSH_STATUS ?? "not-requested");
const completion = statusFromRun({ validationStatus, coverageStatus, partitionCount, commitStatus, pushStatus, failureStage });

const summary = [
  "# County Boundary National Build",
  "",
  "- Boundary source: U.S. Census Bureau TIGER/Line",
  `- Boundary vintage: ${boundaryVintage}`,
  `- Target branch: ${targetBranch}`,
  `- Failure stage: ${failureStage}`,
  `- Validation status: ${validationStatus}`,
  `- Coverage status: ${coverageStatus}`,
  `- Partition count: ${partitionCount}`,
  `- Boundary features: ${boundaryFeatureCount}`,
  `- Unique GEOIDs: ${uniqueBoundaryGeoids}`,
  `- Duplicate GEOIDs: ${count(report.duplicateBoundaryGeoids)}`,
  `- Invalid geometries: ${report.invalidGeometryCount ?? "NOT RUN"}`,
  `- ACS records: ${report.acsCountyRecordCount ?? "NOT RUN"}`,
  `- ACS GEOIDs missing boundary: ${count(report.acsGeoidsMissingBoundary)}`,
  `- Boundary GEOIDs missing ACS: ${count(report.boundaryGeoidsMissingAcs)}`,
  `- Commit requested: ${commitRequested}`,
  `- Commit eligible: ${commitEligible}`,
  `- Commit status: ${commitStatus}`,
  `- Push status: ${pushStatus}`,
  `- Completion: ${completion}`,
  "",
].join("\n");

const summaryPath = process.env.GITHUB_STEP_SUMMARY;
if (summaryPath) {
  appendFileSync(summaryPath, summary, "utf8");
} else {
  process.stdout.write(summary);
}
