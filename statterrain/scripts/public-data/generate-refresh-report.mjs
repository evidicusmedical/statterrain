import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const appRoot = resolve(__dirname, "../..");
const registryPath = resolve(appRoot, "data/sources/source-registry.json");
const reportsDir = resolve(appRoot, "data/reports");
const outputPath = resolve(reportsDir, "refresh-readiness-v0.2.0.json");
const registry = JSON.parse(readFileSync(registryPath, "utf8"));
const report = {
  schemaVersion: "refresh-readiness-v0.2.0",
  generatedAt: "2026-07-09T00:00:00.000Z",
  mode: "framework-scaffold-only",
  externalFetchesPerformed: false,
  generatedPublicRecordsActive: false,
  appVisibleDataMode: "synthetic-demo",
  summary: "No external fetches are performed in v0.2.0. No generated public records are active; the app remains a synthetic demo.",
  sources: (registry.sources ?? []).map((source) => ({ id: source.id, name: source.name, agency: source.agency, status: source.status, automationStatus: source.automationStatus, dataMode: source.dataMode, usedInCurrentApp: source.usedInCurrentApp, lastSuccessfulRefresh: source.lastSuccessfulRefresh })),
  nextRecommendedAction: "v0.2.1 — CMS Hospital Data Pilot"
};
mkdirSync(reportsDir, { recursive: true });
writeFileSync(outputPath, `${JSON.stringify(report, null, 2)}\n`);
console.log("Public data refresh-readiness report generated.");
console.log(`External fetches performed: ${report.externalFetchesPerformed}`);
console.log(`Generated public records active: ${report.generatedPublicRecordsActive}`);
console.log(`Report: ${outputPath}`);
