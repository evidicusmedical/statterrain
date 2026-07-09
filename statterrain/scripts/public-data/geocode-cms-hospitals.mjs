import { existsSync, mkdirSync, readFileSync, writeFileSync, copyFileSync } from "node:fs";
import { dirname, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const appRoot = resolve(__dirname, "../..");
const rel = (p) => relative(appRoot, p).replaceAll("\\", "/");
const version = "v0.2.7";
const inputVersion = "v0.2.3";
const rawArgs = process.argv.slice(2);
const args = new Set(rawArgs);
const limitFlagIndex = rawArgs.findIndex((arg) => arg === "--limit" || arg.startsWith("--limit="));
const limitValue = limitFlagIndex === -1 ? null : rawArgs[limitFlagIndex].includes("=") ? rawArgs[limitFlagIndex].split("=", 2)[1] : rawArgs[limitFlagIndex + 1];
const liveLimit = limitValue === null ? 25 : Number(limitValue);
const fixtureMode = args.has("--fixture");
const dryRun = args.has("--dry-run");
const liveMode = args.has("--live");
if (!Number.isInteger(liveLimit) || liveLimit < 1 || liveLimit > 100) throw new Error("--limit must be an integer from 1 to 100.");
if ([fixtureMode, dryRun, liveMode].filter(Boolean).length > 1) throw new Error("Use only one mode flag: --fixture, --dry-run, or --live.");

const inputPath = resolve(appRoot, `data/generated/geocoding-inputs/cms-hospitals-geocoding-input-${inputVersion}.json`);
const generatedPath = resolve(appRoot, "data/generated/cms-hospitals.generated.json");
const outputDir = resolve(appRoot, "data/generated/geocoding-results");
const reportsDir = resolve(appRoot, "data/reports");
const lkgPath = resolve(appRoot, "data/last-known-good/cms-hospitals.generated.json");
const outputPath = resolve(outputDir, `cms-hospitals-geocoding-results-${version}.json`);
const reportPath = resolve(reportsDir, `cms-hospitals-geocoding-summary-${version}.json`);
const geographyOutputPath = resolve(outputDir, `cms-hospitals-geography-join-${version}.json`);
const now = new Date().toISOString();
const censusBase = "https://geocoding.geo.census.gov/geocoder/geographies/onelineaddress";
const prohibitedUses = ["live routing", "dispatch", "triage", "transfer decisions", "medical-control guidance", "clinical decision support", "patient-level geography"];

for (const dir of [outputDir, reportsDir]) mkdirSync(dir, { recursive: true });
if (!existsSync(inputPath)) throw new Error(`Missing CMS hospital geocoding input artifact: ${rel(inputPath)}`);
const input = JSON.parse(readFileSync(inputPath, "utf8"));
const records = Array.isArray(input.records) ? input.records : [];
const generated = existsSync(generatedPath) ? JSON.parse(readFileSync(generatedPath, "utf8")) : null;

function hasText(value) { return typeof value === "string" && value.trim().length > 0; }
function eligibility(record) {
  if (record.geocodingEligibility) return record.geocodingEligibility;
  if (record.latitude !== undefined && record.latitude !== null && record.longitude !== undefined && record.longitude !== null) return "already-has-coordinates";
  if (!hasText(record.address)) return "missing-address";
  if (!hasText(record.state)) return "missing-state";
  if (!hasText(record.city) && !hasText(record.zip)) return "missing-city-or-zip";
  if (input.dataMode === "synthetic-test-fixture" && !fixtureMode) return "fixture-only";
  return "eligible";
}
function oneLine(record) { return [record.address, record.city, record.state, record.zip].filter(hasText).join(", "); }
function fixtureGeocode(record, index) {
  const base = String(record.sourceFacilityId ?? index).split("").reduce((sum, ch) => sum + ch.charCodeAt(0), 0);
  const lat = 35 + (base % 9000) / 1000;
  const lon = -100 - (base % 7000) / 1000;
  const countyCode = String((base % 999) + 1).padStart(3, "0");
  return {
    status: "matched-fixture",
    confidence: "deterministic-fixture",
    latitude: Number(lat.toFixed(6)),
    longitude: Number(lon.toFixed(6)),
    matchedAddress: oneLine(record),
    geography: { stateFips: "00", countyFips: countyCode, countyName: record.countyName ?? `Fixture County ${countyCode}`, censusTract: null, blockGroup: null },
    rawResponseMetadata: { mode: "fixture", note: "Deterministic local geocode; no external service called." },
  };
}
async function censusGeocode(record) {
  const url = new URL(censusBase);
  url.searchParams.set("address", oneLine(record));
  url.searchParams.set("benchmark", "Public_AR_Current");
  url.searchParams.set("vintage", "Current_Current");
  url.searchParams.set("format", "json");
  let response;
  let payload;
  try {
    response = await fetch(url, { headers: { accept: "application/json", "user-agent": "StatTerrain facility geocoding prototype v0.2.7 (contact: mathew.h.lowe+statterrain@gmail.com)" } });
    payload = await response.json();
  } catch (error) {
    return { status: "request-error", confidence: "none", latitude: null, longitude: null, matchedAddress: null, geography: null, rawResponseMetadata: { finalUrl: url.toString(), errorName: error?.name ?? "Error", errorMessage: error?.message ?? String(error), matchCount: 0 } };
  }
  const match = payload?.result?.addressMatches?.[0];
  if (!response.ok || !match) return { status: response.ok ? "no-match" : "http-error", confidence: "none", latitude: null, longitude: null, matchedAddress: null, geography: null, rawResponseMetadata: { httpStatus: response.status, finalUrl: response.url, matchCount: payload?.result?.addressMatches?.length ?? 0 } };
  const coords = match.coordinates ?? {};
  const geographies = match.geographies ?? {};
  const county = geographies.Counties?.[0];
  const tract = geographies["Census Tracts"]?.[0];
  const block = geographies.Blocks?.[0];
  return { status: "matched", confidence: match.tigerLine?.side ? "street-segment" : "matched", latitude: coords.y ?? null, longitude: coords.x ?? null, matchedAddress: match.matchedAddress ?? null, geography: { stateFips: county?.STATE ?? tract?.STATE ?? null, countyFips: county?.COUNTY ?? tract?.COUNTY ?? null, countyName: county?.NAME ?? null, censusTract: tract?.TRACT ?? null, blockGroup: block?.BLKGRP ?? null }, rawResponseMetadata: { httpStatus: response.status, finalUrl: response.url, matchCount: payload?.result?.addressMatches?.length ?? 0, benchmark: payload?.result?.input?.benchmark?.benchmarkName ?? null, vintage: payload?.result?.input?.vintage?.vintageName ?? null } };
}

const results = [];
for (const [index, record] of records.entries()) {
  const status = eligibility(record);
  const base = { sourceFacilityId: record.sourceFacilityId, facilityName: record.facilityName, inputAddress: oneLine(record), geocodingEligibility: status };
  if (status !== "eligible") { results.push({ ...base, geocodingStatus: "skipped", skipReason: status, latitude: null, longitude: null, geographyJoinStatus: "not-run", geography: null }); continue; }
  if (dryRun) { results.push({ ...base, geocodingStatus: "dry-run-eligible", latitude: null, longitude: null, geographyJoinStatus: "not-run", geography: null }); continue; }
  if (fixtureMode) { const geocode = fixtureGeocode(record, index); results.push({ ...base, geocodingStatus: geocode.status, ...geocode, geographyJoinStatus: geocode.geography ? "joined" : "not-joined" }); continue; }
  if (!liveMode) { results.push({ ...base, geocodingStatus: "skipped", skipReason: "live-geocoding-not-enabled", latitude: null, longitude: null, geographyJoinStatus: "not-run", geography: null }); continue; }
  if (results.filter((r) => r.geocodingStatus !== "skipped" && r.geocodingEligibility === "eligible").length >= liveLimit) { results.push({ ...base, geocodingStatus: "skipped", skipReason: "live-geocoding-limit-reached", latitude: null, longitude: null, geographyJoinStatus: "not-run", geography: null }); continue; }
  const geocode = await censusGeocode(record);
  results.push({ ...base, geocodingStatus: geocode.status, ...geocode, geographyJoinStatus: geocode.geography ? "joined" : "not-joined" });
}

const matched = results.filter((r) => typeof r.latitude === "number" && typeof r.longitude === "number");
const failed = results.filter((r) => r.geocodingEligibility === "eligible" && !["matched", "matched-fixture"].includes(r.geocodingStatus));
const summary = { schemaVersion: "cms-hospitals-geocoding-summary-v0.2.7", generatedAt: now, inputPath: rel(inputPath), mode: fixtureMode ? "fixture" : dryRun ? "dry-run" : liveMode ? "live-census" : "safe-default", dataMode: input.dataMode ?? null, recordCount: records.length, eligibleCount: results.filter((r) => r.geocodingEligibility === "eligible").length, matchedCount: matched.length, joinedCount: results.filter((r) => r.geographyJoinStatus === "joined").length, failedEligibleCount: failed.length, skippedCount: results.filter((r) => r.geocodingStatus === "skipped").length, externalCallsEnabled: liveMode, liveGeocodingLimit: liveMode ? liveLimit : 0, prohibitedUses, warnings: liveMode ? [`Live Census geocoding was explicitly enabled and bounded to ${liveLimit} eligible records.`] : [] };
const output = { schemaVersion: "cms-hospitals-geocoding-results-v0.2.7", generatedAt: now, sourceId: input.sourceId, inputPath: rel(inputPath), geocoder: fixtureMode ? "deterministic-local-fixture" : liveMode ? "US Census Geocoder" : "none", mode: summary.mode, dataMode: input.dataMode ?? null, recordCount: results.length, prohibitedUses, records: results };
const geography = { schemaVersion: "cms-hospitals-geography-join-v0.2.7", generatedAt: now, source: rel(outputPath), recordCount: results.length, joinedCount: results.filter((r) => r.geographyJoinStatus === "joined").length, records: results.map((r) => ({ sourceFacilityId: r.sourceFacilityId, geographyJoinStatus: r.geographyJoinStatus, geography: r.geography })) };

if (matched.length && generated && !dryRun) {
  const byId = new Map(results.map((r) => [r.sourceFacilityId, r]));
  let updated = 0;
  for (const record of generated.records ?? []) {
    const geocoded = byId.get(record.sourceFacilityId);
    if (!geocoded || typeof geocoded.latitude !== "number" || typeof geocoded.longitude !== "number") continue;
    record.latitude = geocoded.latitude;
    record.longitude = geocoded.longitude;
    record.geocodingStatus = geocoded.geocodingStatus;
    record.geocodingConfidence = geocoded.confidence;
    record.geographyJoinStatus = geocoded.geographyJoinStatus;
    record.geography = geocoded.geography;
    record.geocodingResultPath = rel(outputPath);
    updated += 1;
  }
  generated.metadata.geocodingResultPath = rel(outputPath);
  generated.metadata.geographyJoinPath = rel(geographyOutputPath);
  generated.metadata.geocodingSummaryPath = rel(reportPath);
  generated.metadata.geocodingStatus = failed.length ? "partial" : "complete";
  generated.metadata.previewEligibility = failed.length === 0 && matched.length === records.length ? "eligible-public-data-preview" : "blocked-geocoding-incomplete";
  generated.metadata.recordCount = generated.records?.length ?? generated.metadata.recordCount;
  generated.metadata.usedInCurrentApp = false;
  generated.metadata.previewLabelRequired = true;
  summary.generatedRecordsUpdated = updated;
  if (generated.metadata.validationStatus !== "fail") {
    writeFileSync(generatedPath, `${JSON.stringify(generated, null, 2)}\n`);
    if (generated.metadata.dataMode === "real-public-data") copyFileSync(generatedPath, lkgPath);
  } else summary.warnings.push("Generated CMS hospital records were not updated because existing validationStatus is fail.");
}

writeFileSync(outputPath, `${JSON.stringify(output, null, 2)}\n`);
writeFileSync(geographyOutputPath, `${JSON.stringify(geography, null, 2)}\n`);
writeFileSync(reportPath, `${JSON.stringify(summary, null, 2)}\n`);
console.log(`CMS hospital geocoding ${summary.mode}: ${summary.matchedCount}/${summary.eligibleCount} eligible records matched.`);
console.log(`Results: ${rel(outputPath)}`);
