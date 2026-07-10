# StatTerrain v0.2.9 — National Scale Address Search and Coverage Status Handoff

## 1. Patch identification

- Product: StatTerrain
- Version: v0.2.9 prototype
- Date: 2026-07-10
- Repository: https://github.com/evidicusmedical/statterrain
- Starting main commit: 9a93530b7cfc23792bf46563a39a78b1dbdf6a5a
- Branch: v0.2.9-national-scale-address-search-coverage-status
- Final commit: recorded in PR/final report after commit (commit hash is not embedded because changing this line changes the commit hash)
- PR URL: TBD after PR creation
- Vercel preview URL: Not available in this environment

## 2. Objective

This patch adds U.S. location search, map recentering, selected-location status, and honest public-data coverage messages so StatTerrain can be used for any searched U.S. area without misrepresenting synthetic Terrace Basin demo data as local real-world coverage.

## 3. Scope completed

- Update visible version label to v0.2.9 prototype: Complete
- Add U.S. location search box: Complete
- Support address, ZIP, city/state, and state/place search where feasible: Complete
- Use a public geocoder path: Complete
- Recenter map when location is found: Complete
- Add selected-location marker/status: Complete
- Preserve selected radius: Complete
- Show found, top-match, multiple-match, no-match, geocoder unavailable, network unavailable, and invalid-input statuses: Complete
- Prevent misleading synthetic Terrace Basin coverage after out-of-demo-area searches: Complete
- Add coverage status messages: Complete
- Preserve CMS hospital preview behavior: Complete
- Preserve CMS dialysis fixture-safety behavior: Complete
- Keep default map synthetic: Complete
- Add tests and docs: Complete
- Create handoff: Complete
- Vercel preview URL: Deferred; not available from this environment

## 4. Files changed

- HANDOFF-v0.2.9-NATIONAL-SCALE-ADDRESS-SEARCH-COVERAGE-STATUS.md — Added root handoff.
- statterrain/docs/handoffs/HANDOFF-v0.2.9-NATIONAL-SCALE-ADDRESS-SEARCH-COVERAGE-STATUS.md — Added identical docs handoff.
- statterrain/README.md — Documented v0.2.9 location search and coverage status.
- statterrain/docs/PRODUCT_SCOPE.md — Documented scope and safety boundaries.
- statterrain/docs/PUBLIC_DATA_PIPELINE.md — Documented non-ingestion coverage behavior.
- statterrain/docs/TESTING.md — Documented v0.2.9 test focus.
- statterrain/src/config/product.ts — Updated centralized visible version label.
- statterrain/src/lib/geocoding/searchLocation.ts — Added Census Geocoder search helper and normalized selected-location result model.
- statterrain/src/lib/coverage/coverageStatus.ts — Added coverage-status model and copy.
- statterrain/src/components/search/LocationSearchBox.tsx — Added location-search UI.
- statterrain/src/hooks/useAppState.ts — Added selected-location/search state, radius-preserving filtering, preview-in-radius support, and synthetic suppression outside demo region.
- statterrain/src/app/page.tsx — Wired search UI, recenter behavior, status updates, coverage, and evidence context.
- statterrain/src/components/map/MapView.tsx — Added selected-location marker/status and coverage summary on map.
- statterrain/src/components/regional-summary/RegionalSummaryPanel.tsx — Added selected location and coverage status messages.
- statterrain/src/lib/export.ts — Added selected location source and coverage status to evidence/export outputs.
- statterrain/tests/public-data-registry.spec.ts — Updated version gate and added v0.2.9 static coverage tests.

Output from `git diff --name-status` before handoff staging included:

```text
M	statterrain/README.md
M	statterrain/docs/PRODUCT_SCOPE.md
M	statterrain/docs/PUBLIC_DATA_PIPELINE.md
M	statterrain/docs/TESTING.md
M	statterrain/src/app/page.tsx
M	statterrain/src/components/map/MapView.tsx
M	statterrain/src/components/regional-summary/RegionalSummaryPanel.tsx
M	statterrain/src/config/product.ts
M	statterrain/src/hooks/useAppState.ts
M	statterrain/src/lib/export.ts
M	statterrain/tests/public-data-registry.spec.ts
```

## 5. Implementation summary

- Version label update: centralized `product.prototypeVersion` is now `v0.2.9 prototype`.
- Version gate: public-data registry tests now require v0.2.9 and reject stale active version labels.
- Location search component: `LocationSearchBox` provides accessible input, Search, Enter-submit, clear/reset, loading text, validation, and status copy.
- Geocoder behavior: `searchLocation` calls the U.S. Census Geocoder public endpoint, encodes input with `URLSearchParams`, handles no-match, network-error, geocoder-unavailable, and multiple-match top-used cases, and returns normalized session-only selected-location objects.
- Selected-location state: `useAppState` tracks selected location, search status, and message as client state only; no persistence or search history was added.
- Map recentering: successful search updates map center through existing Leaflet recenter behavior.
- Selected-location marker/status: map shows selected location marker/popup and status label.
- Selected-radius preservation: search updates location only and does not reset radius.
- Coverage status messages: coverage distinguishes synthetic demo region active, outside-demo searched areas, CMS preview availability/enabled state, no map-ready records, dialysis fixture status, and incomplete national coverage.
- Synthetic demo safety outside demo region: synthetic facilities are suppressed from local facility counts when a searched location is outside the demo region.
- Evidence/export search location scope: Markdown/JSON/CSV include selected location and selected planning radius; Markdown/JSON include coverage status.
- CMS hospital preview preservation: optional/off-by-default preview remains intact and filters by selected location plus selected radius when enabled.
- CMS dialysis fixture preservation: dialysis remains fixture-only/not geocoded/not map-ready.
- Default synthetic behavior: no selected search uses Terrace Basin synthetic demo data by default.
- Preserved safety boundaries: no backend, database, auth, PHI, patient-level data, claims, live operations, live routing, drive-time, travel-time, ETA, traffic, ingestion, scheduled refresh, or clinical decision support was added.

## 6. Tests

- Updated product version guardrail to require `v0.2.9 prototype`.
- Added static tests for location search component and geocoder statuses.
- Added static tests for selected-location state, map recenter props, marker/status, and radius preservation.
- Added static tests confirming outside-demo synthetic suppression and coverage messages.
- Existing CMS hospital preview, CMS dialysis fixture-safety, quick radius, slider, public-data, and forbidden active-copy tests continue to run.

## 7. Commands run

- `git checkout -b v0.2.9-national-scale-address-search-coverage-status`
- `npx prettier --write statterrain/src/lib/geocoding/searchLocation.ts statterrain/src/lib/coverage/coverageStatus.ts statterrain/src/components/search/LocationSearchBox.tsx statterrain/src/hooks/useAppState.ts statterrain/src/app/page.tsx statterrain/src/components/map/MapView.tsx statterrain/src/components/regional-summary/RegionalSummaryPanel.tsx statterrain/src/lib/export.ts`
- `cd statterrain && npm run typecheck`
- `cd statterrain && npm run lint && npm run test:e2e -- tests/public-data-registry.spec.ts`
- `cd statterrain && npm run typecheck && npm run test:e2e -- tests/public-data-registry.spec.ts`
- `cd statterrain && npm ci && npm run lint && npm run typecheck && npm run build && npm run data:validate-sources && npm run data:validate-benchmark && npm run data:validate-cms-hospitals && npm run data:validate-cms-dialysis`
- `cd statterrain && npm run test:e2e -- tests/public-data-registry.spec.ts && npx playwright install chromium && npm run test:e2e -- tests/smoke.spec.ts`
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
- CMS hospital validation: WARN expected current artifact state; command completed successfully with `CMS hospital validation: WARN`, records 5.
- CMS dialysis validation: WARN expected fixture-safe state; command completed successfully with `CMS dialysis validation: WARN`, records 3.
- public-data tests: PASS, 15 passed.
- smoke/Playwright result: Chromium install attempted but failed with HTTP 403 downloading `https://cdn.playwright.dev/builds/cft/149.0.7827.55/linux64/chrome-linux64.zip`; smoke tests did not run because browser install failed.
- git diff check: PASS
- Vercel preview: Not available in this environment

## 9. Known limitations

- Location search depends on public geocoder availability.
- No backend search persistence.
- User-entered locations are session-only.
- No route or drive-time calculation.
- No travel-time estimate.
- Current CMS hospital preview remains only 5 records.
- National facility artifacts are not complete yet.
- Dialysis records are fixture-only/not preview-ready.
- No nursing home/SNF ingestion yet.
- No Census ACS/CDC/SAMHSA/NPPES ingestion yet.
- No scheduled automated refresh yet.
- No backend/database/auth.
- No PHI.
- No live routing/diversion/bed status.
- No clinical decision support.
- Legal disclaimer should still be reviewed before external beta/public launch.

## 10. Scope control

No patient-level data, patient addresses stored, claims data, PHI, treatment schedules, appointment availability, staffing status, live capacity, new source ingestion, mass geocoding, facility live geocoding, live routing, drive-time calculation, travel-time estimate, ETA, real-time traffic, new non-CMS real datasets, real Census ACS records, real CDC records, real SAMHSA records, real NPPES records, real nursing home records, dialysis live geocoding, dialysis map preview, fixture data as real preview, synthetic-to-real default UI switch, scheduled cron refresh, auto-merge, direct generated-data push to main, backend, database, authentication, AI API, diversion status, bed status, dispatch recommendation, triage recommendation, transfer recommendation, medical-control guidance, clinical decision support, or v0.3.0 work was added.

## 11. Rollback

Revert the final commit from branch `v0.2.9-national-scale-address-search-coverage-status`, or restore the changed files listed above to the starting commit `9a93530b7cfc23792bf46563a39a78b1dbdf6a5a`. After rollback, run `cd statterrain && npm run lint && npm run typecheck && npm run build && npm run test:e2e -- tests/public-data-registry.spec.ts` if browser/static test dependencies are available.

## 12. Recommended next patch

v0.3.0 — National Public-Data Coverage Model and Scaling Foundation

Purpose: Build the core national-scale architecture for static public-data artifacts, coverage manifests, geocoding cache, changed-address detection, and chunked refresh workflows.

Do not implement v0.3.0 in this patch.
