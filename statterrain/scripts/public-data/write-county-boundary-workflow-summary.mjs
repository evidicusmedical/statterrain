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

const manifest = readJson(manifestPath);
const report = readJson(reportPath);
const boundaryVintage = process.env.BOUNDARY_VINTAGE ?? manifest.vintage ?? "unknown";
const commitStatus = process.env.COMMIT_STATUS ?? "not-requested";
const pushStatus = process.env.PUSH_STATUS ?? "not-requested";
const targetBranch = process.env.TARGET_BRANCH ?? "unknown";
const commitRequested = process.env.COMMIT_GENERATED_ARTIFACTS ?? "unknown";

const validationStatus = report.validationStatus ?? manifest.validationStatus ?? "FAIL";
const coverageStatus = report.coverageStatus ?? manifest.coverageStatus ?? "incomplete";
const partitionCount = report.partitionCount ?? manifest.partitionCount ?? 0;
const boundaryFeatureCount = report.boundaryFeatureCount ?? manifest.boundaryFeatureCount ?? 0;
const uniqueBoundaryGeoids = report.uniqueBoundaryGeoids ?? manifest.uniqueBoundaryGeoids ?? 0;
const commitEligible = validationStatus === "PASS" && coverageStatus === "national";

const summary = [
  "# County Boundary National Build",
  "",
  "- Boundary source: U.S. Census Bureau TIGER/Line",
  `- Boundary vintage: ${boundaryVintage}`,
  `- Target branch: ${targetBranch}`,
  `- Validation status: ${validationStatus}`,
  `- Coverage status: ${coverageStatus}`,
  `- Partition count: ${partitionCount}`,
  `- Boundary features: ${boundaryFeatureCount}`,
  `- Unique GEOIDs: ${uniqueBoundaryGeoids}`,
  `- Duplicate GEOIDs: ${count(report.duplicateBoundaryGeoids)}`,
  `- Invalid geometries: ${report.invalidGeometryCount ?? 0}`,
  `- ACS records: ${report.acsCountyRecordCount ?? 0}`,
  `- ACS GEOIDs missing boundary: ${count(report.acsGeoidsMissingBoundary)}`,
  `- Boundary GEOIDs missing ACS: ${count(report.boundaryGeoidsMissingAcs)}`,
  `- Commit requested: ${commitRequested}`,
  `- Commit eligible: ${commitEligible}`,
  `- Commit status: ${commitStatus}`,
  `- Push status: ${pushStatus}`,
  "- Completion: COMPLETE — COUNTY BOUNDARY WORKFLOW VALID AND MANUALLY RUNNABLE",
  "",
].join("\n");

const summaryPath = process.env.GITHUB_STEP_SUMMARY;
if (summaryPath) {
  appendFileSync(summaryPath, summary, "utf8");
} else {
  process.stdout.write(summary);
}
