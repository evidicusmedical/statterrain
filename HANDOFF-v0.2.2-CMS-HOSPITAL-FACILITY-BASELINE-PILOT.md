# HANDOFF — v0.2.2 CMS Hospital Facility Baseline Pilot

## 1. Patch identification

- Product: StatTerrain
- Version: v0.2.2 prototype
- Date: 2026-07-09
- Repository: https://github.com/evidicusmedical/statterrain
- Starting main commit: 8f697df
- Branch: v0.2.2-cms-hospital-facility-baseline-pilot
- Final commit: 659b6d65f703ef0a7fc13bdc7ca261ef4f7836ea
- PR URL: TBD after PR creation
- Vercel preview URL: Not available in this environment

## 2. Objective

This patch is the first real CMS hospital ingestion pilot. It adds scripts and documentation to read the v0.2.1 source benchmark, select CMS Hospital General Information, attempt a real CMS fetch, create raw metadata/reports, and only publish generated records when actual source data validates.

## 3. Scope completed

- Complete: Version label updated to v0.2.2 prototype.
- Complete: Source selection reads the benchmark-selected CMS Hospital General Information source.
- Complete: CMS pull script added with graceful fetch-failed behavior.
- Complete: Raw snapshot metadata, refresh report, and validation report generation added.
- Complete: Generated/normalized/last-known-good behavior implemented for successful connected fetches.
- Complete: Main UI remains synthetic; CMS data does not power the map.
- Complete: Documentation added/updated.
- Deferred: Facility geocoding and geography join to v0.2.3.
- Deferred: Scheduled automated CMS refresh.
- Not completed: Backend/database/auth/live operational features, intentionally out of scope.

## 4. Files changed

Major changes include CMS pull/validate scripts, CMS pilot docs, package scripts, version label, test version assertion, reports, raw metadata, and handoff files.

```text
A	HANDOFF-v0.2.2-CMS-HOSPITAL-FACILITY-BASELINE-PILOT.md
M	statterrain/README.md
M	statterrain/data/README.md
A	statterrain/data/raw/cms-hospitals/cms-hospitals-raw-metadata-v0.2.2.json
A	statterrain/data/reports/cms-hospitals-refresh-v0.2.2.json
A	statterrain/data/reports/cms-hospitals-validation-v0.2.2.json
A	statterrain/docs/CMS_HOSPITAL_BASELINE_PILOT.md
M	statterrain/docs/PRODUCT_SCOPE.md
M	statterrain/docs/PUBLIC_DATA_PIPELINE.md
M	statterrain/docs/PUBLIC_DATA_SOURCE_BENCHMARK_AND_INTAKE_PLAN.md
M	statterrain/docs/TESTING.md
A	statterrain/docs/handoffs/HANDOFF-v0.2.2-CMS-HOSPITAL-FACILITY-BASELINE-PILOT.md
M	statterrain/package.json
M	statterrain/scripts/public-data/README.md
A	statterrain/scripts/public-data/pull-cms-hospitals.mjs
A	statterrain/scripts/public-data/validate-cms-hospitals.mjs
M	statterrain/src/config/product.ts
M	statterrain/tests/smoke.spec.ts
```

## 5. Implementation summary

- CMS source selection: `cms-hospital-general-information`, selected from `data/sources/source-benchmark.json`.
- Fetch behavior: uses benchmark URL and resolves CMS datastore endpoint when `downloadUrl` is `TBD`; current environment fetch failed/was blocked, so no fake records were created.
- Raw snapshot metadata: written to `data/raw/cms-hospitals/cms-hospitals-raw-metadata-v0.2.2.json`.
- Normalized model: implemented for successful fetches at `data/normalized/cms-hospitals/cms-hospitals-normalized-v0.2.2.json`.
- Generated file: implemented for successful fetches at `data/generated/cms-hospitals.generated.json` with `usedInCurrentApp: false`.
- Validation report: `data/reports/cms-hospitals-validation-v0.2.2.json`.
- Refresh report: `data/reports/cms-hospitals-refresh-v0.2.2.json`.
- Last-known-good behavior: updates only when validation is non-failing; failed fetches do not update it.
- UI/synthetic-mode decision: no real CMS UI switch; synthetic warnings remain.
- Safety boundaries: no patient-level, claims, PHI, live operational data, routing/diversion/bed status, or clinical decision support.

## 6. Tests

- Updated Playwright version assertion to v0.2.2 prototype.
- Added data validation script checks for generated-data contract, forbidden fields, source-supported emergency/critical-access fields, and last-known-good behavior.

## 7. Commands run

Commands are listed in the final report and PR body. Required commands were run where possible.

## 8. Verification results

- npm ci: run.
- lint: run.
- typecheck: run.
- build: run.
- data validation scripts: run.
- CMS pull result: fetch failed gracefully in this environment; no fake records.
- CMS validation result: warning/no-data fetch-failed status.
- Playwright result: attempted.
- git diff check: run.
- GitHub Actions: not available locally.
- Vercel preview: not available locally.

## 9. Known limitations

- CMS generated data may not yet be map-ready if coordinates are missing.
- Geocoding is planned for v0.2.3.
- App still uses synthetic map/facility data by default.
- No dialysis or nursing home ingestion yet.
- No Census/CDC/SAMHSA/NPPES ingestion yet.
- No scheduled automated refresh yet.
- No backend/database/auth.
- No PHI.
- No live routing/diversion/bed status.
- No clinical decision support.
- Legal disclaimer should still be reviewed before external beta/public launch.

## 10. Scope control

This patch added no patient-level data, claims data, PHI, real Census records, real CDC records, real SAMHSA records, real NPPES records, dialysis ingestion, nursing home ingestion, synthetic-to-real full UI switch, scheduled cron refresh, automatic generated-data commits, backend, database, authentication, AI API, live routing, diversion status, bed status, dispatch recommendation, triage recommendation, transfer recommendation, medical-control guidance, clinical decision support, or v0.2.3 geocoding pipeline.

## 11. Rollback

Revert the final commit for this branch, then remove any local generated CMS pilot artifacts if necessary: `data/raw/cms-hospitals/`, `data/reports/cms-hospitals-*`, `data/normalized/cms-hospitals/`, `data/generated/cms-hospitals.generated.json`, and `data/last-known-good/cms-hospitals.generated.json`.

## 12. Recommended next patch

v0.2.3 — Facility Geocoding and Geography Join. Do not implement v0.2.3 in this patch.
