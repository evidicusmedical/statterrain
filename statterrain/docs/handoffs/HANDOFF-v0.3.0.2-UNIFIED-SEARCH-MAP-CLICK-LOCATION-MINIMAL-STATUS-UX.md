# HANDOFF — StatTerrain v0.3.0.2 Unified Search, Map Click Location, and Minimal Status UX

## 1. Patch identification

- Product: StatTerrain
- Version: v0.3.0.2 prototype
- Date: 2026-07-10
- Repository: https://github.com/evidicusmedical/statterrain
- Starting main commit: 269f48a2f4041df6a3297b4732933d9f3ed705fc (local checkout did not expose a `main` branch; work started from the provided base commit)
- Branch: v0.3.0.2-unified-search-map-click-location-minimal-status-ux
- Final commit: ddf56e2890c9db85c7f153d33d855dc0968e22c0
- PR URL: TO_BE_FILLED_AFTER_PR
- Vercel preview URL: Not available in this environment

## 2. Objective

This patch improves GUI/GX by making the top search bar the primary planning-location search, adding latitude/longitude and map-click planning-center support, moving selected-location status into a compact top-left map badge, and shrinking public-data status to a small map-edge note with Details for provenance.

## 3. Scope completed

- Version label updated to v0.3.0.2 prototype: Complete
- Version gate updated: Complete
- Top search bar primary location search: Complete
- Large in-map search card removed from default map overlay: Complete
- Address/ZIP/city/state/state search preserved: Complete
- Latitude/longitude search support: Complete
- Map-click selected planning center: Complete
- Compact selected-location/radius/status badge: Complete
- Show Summary control separated from selected-location badge: Complete
- Public-data/source/freshness status reduced to compact chip/note: Complete
- Details control preserves full provenance/source/freshness/limitations: Complete
- Radius behavior preserved: Complete
- CMS hospital preview behavior preserved: Complete
- CMS dialysis fixture safety preserved: Complete
- Default synthetic map preserved: Complete
- Tests/docs/handoff added or updated: Complete
- v0.3.1 national CMS hospital pull: Deferred / not started

## 4. Files changed

- `statterrain/README.md` — Modified — documents unified top search, lat/lon, map-click, compact status, and session-only boundaries.
- `statterrain/docs/PRODUCT_SCOPE.md` — Modified — documents scope and prohibited-use boundaries for searched/clicked locations.
- `statterrain/docs/TESTING.md` — Modified — documents v0.3.0.2 test gates.
- `statterrain/src/app/page.tsx` — Modified — routes top search handlers through header, removes large map search overlay, adds map-click planning center handler, moves public-data chip.
- `statterrain/src/components/layout/Header.tsx` — Modified — embeds primary LocationSearchBox in top header.
- `statterrain/src/components/map/MapView.tsx` — Modified — adds map-click handler and compact top-left selected-location badge.
- `statterrain/src/components/public-data/PublicDataFreshnessPanel.tsx` — Modified — makes public-data state compact by default while preserving expanded details.
- `statterrain/src/components/search/LocationSearchBox.tsx` — Modified — makes search compact, top-bar-oriented, and lat/lon-aware in copy.
- `statterrain/src/config/product.ts` — Modified — updates centralized visible version label.
- `statterrain/src/lib/geocoding/searchLocation.ts` — Modified — adds coordinate parsing/session-only coordinate selected locations and preserves Census Geocoder flow.
- `statterrain/tests/public-data-registry.spec.ts` — Modified — updates version gate and adds v0.3.0.2 static/registry coverage.
- `HANDOFF-v0.3.0.2-UNIFIED-SEARCH-MAP-CLICK-LOCATION-MINIMAL-STATUS-UX.md` — Added — release handoff.
- `statterrain/docs/handoffs/HANDOFF-v0.3.0.2-UNIFIED-SEARCH-MAP-CLICK-LOCATION-MINIMAL-STATUS-UX.md` — Added — identical release handoff.

`git diff --name-status` before handoff files:

```text
M	statterrain/README.md
M	statterrain/docs/PRODUCT_SCOPE.md
M	statterrain/docs/TESTING.md
M	statterrain/src/app/page.tsx
M	statterrain/src/components/layout/Header.tsx
M	statterrain/src/components/map/MapView.tsx
M	statterrain/src/components/public-data/PublicDataFreshnessPanel.tsx
M	statterrain/src/components/search/LocationSearchBox.tsx
M	statterrain/src/config/product.ts
M	statterrain/src/lib/geocoding/searchLocation.ts
M	statterrain/tests/public-data-registry.spec.ts
```

## 5. Implementation summary

- Version label update: centralized `product.prototypeVersion` is `v0.3.0.2 prototype`.
- Version gate: public-data registry tests now require the new version and reject stale versions.
- Top search unification: Header now renders the primary planning-location search and wires it to existing selected-location state.
- Removed/hidden map search card: the former large map overlay search card is removed; map overlays are now status/control only.
- Latitude/longitude parser: supports comma, whitespace, explicit lat/lon, and N/W hemisphere formats; validates latitude/longitude ranges.
- Census Geocoder preservation: non-coordinate address/ZIP/city/state queries still use the U.S. Census Geocoder helper.
- Map-click planning center behavior: map background clicks create a session-only map-click selected location, recenter marker/radius, preserve radius, and do not create routes or drive-time estimates.
- Selected-location badge: top-left compact badge displays selected location, radius, and short synthetic/public coverage status.
- Show Summary reposition/simplification: control remains simple Show summary/Hide summary in the top-right map corner, away from the selected-location badge.
- Public-data compact status chip: source/freshness status is a small default chip with CMS preview availability/enabled/off state.
- Details/provenance preservation: expanded Details still shows artifact metadata, coverage manifest summary, limitations, prohibited uses, and preview toggle.
- Warning/copy reduction: long public-data and prohibited-use copy is moved into Details/footer instead of repeated over the map.
- Address search preservation: Census Geocoder flow remains for non-coordinate searches.
- Radius preservation: quick buttons, slider, marker, radius circle, and exports keep straight-line planning-radius behavior.
- CMS hospital preview preservation: bounded 5-record optional preview behavior remains unchanged.
- CMS dialysis fixture preservation: dialysis remains fixture-only/not map-ready.
- Manifest preservation: coverage/artifact manifest tests continue passing.
- Default synthetic behavior: default map remains synthetic demonstration data.
- Preserved safety boundaries: no backend, database, auth, PHI, live routing, drive-time, travel-time, ETA, live operational fields, or clinical decision support were added.

## 6. Tests

Updated `tests/public-data-registry.spec.ts` to verify the v0.3.0.2 version gate, top search unification, absence of a large in-map search card by default, lat/lon parser/source behavior by static contract, map-click handler, compact selected-location badge, summary-control non-overlap intent, compact public-data chip/details behavior, CMS hospital preview preservation, CMS dialysis fixture safety, manifest preservation, default synthetic map behavior, and absence of prohibited operational field language.

## 7. Commands run

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
- `cd statterrain && npm run test:e2e -- tests/public-data-registry.spec.ts`
- `cd statterrain && npx playwright install chromium`
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
- CMS hospital validation: WARN expected validator state; bounded 5-record preview remains
- CMS dialysis validation: WARN expected fixture-only/not-map-ready safety state
- changed-address detection: PASS; wrote planning report, not committed
- chunk planning: PASS; wrote planning report, not committed
- public-data tests: PASS, 27 passed
- smoke/Playwright result: Chromium install attempted but failed with HTTP 403 Forbidden from `https://cdn.playwright.dev/builds/cft/149.0.7827.55/linux64/chrome-linux64.zip`; smoke tests were not run because browser install failed
- git diff check: PASS
- Vercel preview: Not available in this environment

## 9. Known limitations

- Location search depends on public Census Geocoder availability for non-coordinate queries.
- Coordinates/map-click are planning centers only and are session-only.
- No route/drive-time/travel-time/ETA.
- Current map-ready CMS hospital preview remains only 5 records.
- National CMS hospital pull has not been run.
- CMS dialysis remains fixture-only/not map-ready.
- No live facility geocoding was run.
- No mass geocoding was run.
- No nursing home/SNF ingestion yet.
- No Census ACS/CDC/SAMHSA/NPPES ingestion yet.
- No scheduled automated refresh yet.
- No backend/database/auth.
- No PHI.
- No live routing/diversion/bed status.
- No clinical decision support.
- Legal disclaimer should still be reviewed before external beta/public launch.

## 10. Scope control

Confirmed no patient-level data, patient addresses stored, clicked locations stored, claims data, PHI, treatment schedules, appointment availability, staffing status, live capacity, source ingestion, national CMS pull, mass geocoding, facility live geocoding, national records made map-ready without coordinates, live routing, drive-time calculation, travel-time estimate, ETA, real-time traffic, new non-CMS real datasets, real Census ACS records, real CDC records, real SAMHSA records, real NPPES records, real nursing home records, dialysis real fetch, dialysis live geocoding, dialysis map preview, fixture data as real preview, synthetic-to-real default UI switch, scheduled cron refresh, auto-merge, direct generated-data push to main, backend, database, authentication, AI API, diversion status, bed status, dispatch recommendation, triage recommendation, transfer recommendation, medical-control guidance, clinical decision support, or v0.3.1 work was added.

## 11. Rollback

Rollback by reverting the final commit for this branch, then redeploy the previous v0.3.0.1 artifact. If only the UI needs rollback, restore the previous versions of the header search, map overlay status, public-data panel, and geocoding helper from the parent commit. Do not run source ingestion or live geocoding during rollback.

## 12. Recommended next patch

Recommended next patch: v0.3.1 — CMS Hospital National Pull Expansion.

Purpose: expand CMS Hospital General Information from the 5-record sample into a full national normalized artifact while keeping national records non-map-ready until chunked geocoding/geography joins are completed.

Do not implement v0.3.1 as part of this patch.
