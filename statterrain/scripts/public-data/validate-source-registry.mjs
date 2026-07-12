import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const registryPath = resolve(__dirname, "../../data/sources/source-registry.json");
const required = ["id","name","agency","sourceType","status","usedInCurrentApp","dataMode","expectedUse","allowedUse","notAllowedUse","sourceAccessPattern","refreshMethod","refreshCadence","automationStatus","plannedRefreshCadence","lastRefreshAttempt","lastSuccessfulRefresh","lastValidationStatus","lastKnownGoodAvailable","sourceUrl","limitations"];
const allowed = { sourceType: new Set(["official-public-data"]), status: new Set(["planned"]), dataMode: new Set(["not-yet-ingested","real-public-data"]), refreshMethod: new Set(["manual-planned"]), automationStatus: new Set(["not-started"]), lastValidationStatus: new Set(["not-run"]) };
const errors = [];
let registry;
try { registry = JSON.parse(readFileSync(registryPath, "utf8")); } catch (e) { console.error(`FAIL: Cannot read registry: ${e.message}`); process.exit(1); }
if (!Array.isArray(registry.sources)) errors.push("Registry must contain a sources array.");
const ids = new Set();
for (const [index, source] of (registry.sources ?? []).entries()) {
  for (const field of required) if (!(field in source)) errors.push(`sources[${index}] ${source.id ?? "<missing id>"} missing ${field}`);
  if (ids.has(source.id)) errors.push(`Duplicate source id: ${source.id}`); else ids.add(source.id);
  for (const [field, values] of Object.entries(allowed)) if (!values.has(source[field])) errors.push(`${source.id}: ${field} must be one of ${[...values].join(", ")}; received ${source[field]}`);
  if (source.usedInCurrentApp !== false) errors.push(`${source.id}: usedInCurrentApp must be false.`);
  if (source.lastSuccessfulRefresh !== null) errors.push(`${source.id}: lastSuccessfulRefresh must be null in v0.2.0.`);
  if (source.lastRefreshAttempt !== null) errors.push(`${source.id}: lastRefreshAttempt must be null in v0.2.0.`);
  if (source.lastKnownGoodAvailable !== false) errors.push(`${source.id}: lastKnownGoodAvailable must be false in v0.2.0.`);
  if (!Array.isArray(source.limitations) || source.limitations.length === 0) errors.push(`${source.id}: limitations must be a non-empty array.`);
}
if (registry.publicDataRefreshActive !== false) errors.push("publicDataRefreshActive must be false.");
if (registry.generatedPublicRecordsActive !== false) errors.push("generatedPublicRecordsActive must be false.");
if (errors.length) { console.error("Public data source registry validation: FAIL"); for (const error of errors) console.error(`- ${error}`); process.exit(1); }
console.log("Public data source registry validation: PASS");
console.log(`Validated ${ids.size} planned source placeholders. No active or real-ingested public data sources are configured.`);
