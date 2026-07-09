import { spawnSync } from "node:child_process";

const args = process.argv.slice(2);
const options = new Map();
for (let index = 0; index < args.length; index += 1) {
  const arg = args[index];
  if (!arg.startsWith("--")) continue;
  const [key, inlineValue] = arg.slice(2).split("=", 2);
  const next = args[index + 1];
  const value = inlineValue ?? (next && !next.startsWith("--") ? args[++index] : "true");
  options.set(key, value);
}

const geocodingMode = options.get("geocoding-mode") ?? "dry-run";
const liveLimit = Number(options.get("live-limit") ?? 25);
const allowedModes = new Set(["dry-run", "live-census", "skip"]);
if (!allowedModes.has(geocodingMode)) throw new Error(`Unsupported geocoding mode: ${geocodingMode}`);
if (!Number.isInteger(liveLimit) || liveLimit < 1 || liveLimit > 100) throw new Error("--live-limit must be an integer from 1 to 100.");
if (geocodingMode === "live-census" && options.get("confirm-live-geocoding") !== "true") {
  throw new Error("Live Census geocoding requires --confirm-live-geocoding true.");
}

function run(command, commandArgs) {
  console.log(`\n$ ${[command, ...commandArgs].join(" ")}`);
  const result = spawnSync(command, commandArgs, { stdio: "inherit", shell: process.platform === "win32" });
  if (result.status !== 0) process.exit(result.status ?? 1);
}

run("npm", ["run", "data:validate-sources"]);
run("npm", ["run", "data:pull-cms-hospitals"]);
run("npm", ["run", "data:validate-cms-hospitals"]);

if (geocodingMode === "dry-run") run("npm", ["run", "data:geocode-cms-hospitals", "--", "--dry-run"]);
if (geocodingMode === "live-census") run("npm", ["run", "data:geocode-cms-hospitals", "--", "--live", "--limit", String(liveLimit)]);
if (geocodingMode === "skip") console.log("\nSkipping CMS hospital geocoding by explicit request.");

run("npm", ["run", "data:validate-cms-hospitals"]);
run("npm", ["run", "data:refresh-report"]);
