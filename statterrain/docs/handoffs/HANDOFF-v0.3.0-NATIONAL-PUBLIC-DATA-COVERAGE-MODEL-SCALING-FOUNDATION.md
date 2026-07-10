# HANDOFF v0.3.0 — National Public-Data Coverage Model and Scaling Foundation

## 1. Patch identification

- Product: StatTerrain
- Version: v0.3.0 prototype
- Date: 2026-07-10
- Repository: https://github.com/evidicusmedical/statterrain
- Starting main commit: 6522ecd5cc7fc7755e6c4fee6a4977b94f274a95
- Branch: v0.3.0-national-public-data-coverage-model-scaling-foundation
- Final commit: branch HEAD commit for this patch
- PR URL: pending at handoff creation; see PR metadata
- Vercel preview URL: not available in this environment

## 2. Objective

This patch adds national-scale source coverage and artifact manifest scaffolding, geocoding cache planning, changed-address detection/chunking scaffolds, and coverage summaries without running national ingestion or live geocoding.

## 3. Scope completed

- Version label update: Complete
- Source coverage manifest model: Complete
- Generated artifact manifest model: Complete
- Geocoding cache schema/scaffold: Complete
- Changed-address detection utility/report: Complete
- Chunked refresh/geocoding docs and script scaffolds: Complete
- National coverage status logic: Complete
- CMS hospital preview behavior preserved: Complete
- CMS dialysis fixture safety preserved: Complete
- Address search/radius behavior preserved: Complete
- Default synthetic map preserved: Complete
- Tests/docs/handoff: Complete
- National full pulls/mass geocoding/v0.3.1: Deferred/Not completed by scope

## 4. Files changed

Change type and purpose: product config/version gate; generated manifests/reports; geocoding cache scaffold; planning scripts; coverage logic; public-data panel; exports; docs; tests; handoff.

```text
M	statterrain/README.md
A	statterrain/data/generated/artifact-manifest.json
A	statterrain/data/generated/geocoding-cache/README.md
A	statterrain/data/generated/geocoding-cache/geocoding-cache-v0.3.0.json
A	statterrain/data/generated/geocoding-cache/geocoding-cache.schema.json
A	statterrain/data/generated/source-coverage-manifest.json
A	statterrain/data/reports/address-geocoding-delta-v0.3.0.json
A	statterrain/data/reports/geocoding-chunk-plan-v0.3.0.json
M	statterrain/docs/CMS_GEOCODING_AND_GEOGRAPHY_JOIN.md
A	statterrain/docs/GEOCODING_CACHE_AND_CHUNKING.md
A	statterrain/docs/NATIONAL_SCALE_PLAN.md
M	statterrain/docs/PRODUCT_SCOPE.md
M	statterrain/docs/PUBLIC_DATA_PIPELINE.md
M	statterrain/docs/TESTING.md
A	statterrain/docs/handoffs/HANDOFF-v0.3.0-NATIONAL-PUBLIC-DATA-COVERAGE-MODEL-SCALING-FOUNDATION.md
M	statterrain/package.json
A	statterrain/scripts/public-data/compare-addresses-for-geocoding.mjs
A	statterrain/scripts/public-data/create-geocoding-chunks.mjs
M	statterrain/src/components/public-data/PublicDataFreshnessPanel.tsx
M	statterrain/src/config/product.ts
M	statterrain/src/lib/coverage/coverageStatus.ts
M	statterrain/src/lib/export.ts
M	statterrain/tests/public-data-registry.spec.ts
```

## 5. Implementation summary

- Updated centralized visible version label to v0.3.0 prototype.
- Added source coverage manifest with CMS hospital bounded sample/not national, CMS dialysis fixture-only/not map-ready, and synthetic demo local-demo-only/not-real-public-data statuses.
- Added artifact manifest with generated artifact inventory, checksums, validation links, readiness flags, and inactive current-app flags.
- Added geocoding cache schema plus empty scaffold; no fabricated records were added.
- Added deterministic changed-address detection and chunk planning scripts/reports with no network calls.
- Integrated manifest-aligned coverage summaries into coverage status, the source panel/UI, and Markdown/JSON evidence exports.
- Preserved address search, radius controls, CMS hospital preview behavior, CMS dialysis fixture safety, default synthetic behavior, and safety boundaries.

## 6. Tests

Updated `statterrain/tests/public-data-registry.spec.ts` to verify v0.3.0 version gate, manifests, cache scaffold, planning utilities, UI/source panel copy, export coverage summary, address search, radius controls, CMS hospital preview, CMS dialysis fixture safety, and default synthetic behavior.

## 7. Commands run

- `cd statterrain && npm run data:compare-addresses-for-geocoding`
- `cd statterrain && npm run data:create-geocoding-chunks`
- `cd statterrain && npm run typecheck`
- `cd statterrain && npm run lint`
- `cd statterrain && npm run test:e2e -- tests/public-data-registry.spec.ts` (first attempt failed due test expectation typo; rerun passed)
- `cd statterrain && npm ci`
- `cd statterrain && npm run lint`
- `cd statterrain && npm run typecheck`
- `cd statterrain && npm run build`
- `cd statterrain && npm run data:validate-sources`
- `cd statterrain && npm run data:validate-benchmark`
- `cd statterrain && npm run data:validate-cms-hospitals`
- `cd statterrain && npm run data:validate-cms-dialysis`
- `cd statterrain && npm run data:compare-addresses-for-geocoding`
- `cd statterrain && npm run data:create-geocoding-chunks`
- `cd statterrain && npx playwright install chromium` (failed with HTTP 403; smoke test not run)
- `git diff --check`
- `git status --short`
- `git diff --name-status`

## 8. Verification results

- npm ci: PASS
- lint: PASS
- typecheck: PASS
- build: PASS
- source validation: PASS
- benchmark validation: PASS
- CMS hospital validation: WARN expected for bounded sample, command completed
- CMS dialysis validation: WARN expected for fixture-only pilot, command completed
- new manifest/scaffold scripts: PASS
- public-data tests: PASS on rerun, 21 passed
- smoke/Playwright: browser install failed because CDN returned HTTP 403 Forbidden; smoke test not run
- git diff check: PASS
- Vercel preview: not available

## 9. Known limitations

National facility artifacts are not complete yet; current CMS hospital preview remains only 5 records; CMS dialysis remains fixture-only/not map-ready; geocoding cache is scaffolded, not nationally populated; changed-address detection/chunking are planning utilities only; no national pull was run; no live facility geocoding was run; no nursing home/SNF ingestion yet; no Census ACS/CDC/SAMHSA/NPPES ingestion yet; no scheduled automated refresh yet; no backend/database/auth; no PHI; no live routing/diversion/bed status; no clinical decision support; legal disclaimer should still be reviewed before external beta/public launch.

## 10. Scope control

Confirmed no patient-level data, patient addresses stored, claims data, PHI, treatment schedules, appointment availability, staffing status, live capacity, new source ingestion, national CMS pull, mass geocoding, facility live geocoding, live routing, drive-time calculation, travel-time estimate, ETA, real-time traffic, new non-CMS real datasets, real Census ACS records, real CDC records, real SAMHSA records, real NPPES records, real nursing home records, dialysis live geocoding, dialysis map preview, fixture data as real preview, synthetic-to-real default UI switch, scheduled cron refresh, auto-merge, direct generated-data push to main, backend, database, authentication, AI API, diversion status, bed status, dispatch recommendation, triage recommendation, transfer recommendation, medical-control guidance, clinical decision support, or v0.3.1 work was added.

## 11. Rollback

Revert the v0.3.0 commit, remove the branch, and redeploy the prior main commit. Discard v0.3.0 generated manifests, cache scaffold, reports, scripts, docs, and UI/export changes if downstream artifacts were copied externally.

## 12. Recommended next patch

v0.3.1 — CMS Hospital National Pull Expansion

Purpose: Expand CMS Hospital General Information from the 5-record sample into a full national normalized artifact while using the v0.3.0 manifest/scaling foundation and without geocoding everything at once or turning real data on by default. Do not implement v0.3.1 in this patch.
