# StatTerrain v0.2.8.1 — Flexible Radius Control and Dense-Market Usability handoff

## 1. Patch identification

- Product: StatTerrain
- Version: v0.2.8.1 prototype
- Date: 2026-07-10
- Repository: https://github.com/evidicusmedical/statterrain
- Starting main commit: 9a23055109da9f82692cedcdd428a4bbcf858dfc
- Branch: v0.2.8.1-flexible-radius-control-dense-market-usability
- Final commit: See final report / PR metadata for exact final commit hash (Git commit hashes cannot self-reference inside the committed file).
- PR URL: Created with make_pr tool; URL unavailable in this environment
- Vercel preview URL: Not available in this environment

## 2. Objective

This patch improves radius usability for dense markets by adding a 10-mile quick option and a flexible 1–250 mile slider without adding drive-time, routing, travel-time estimate, ETA, route calculation, traffic, or isochrone scope.

## 3. Scope completed

- Version label update to v0.2.8.1 prototype: Complete
- 10-mile quick radius option: Complete
- 25/50/100-mile quick options preserved: Complete
- 1–250 mile slider with 1-mile step: Complete
- Straight-line planning-distance radius semantics: Complete
- Selected radius consistently applies to map, regional summary, evidence, and exports: Complete
- Dense-market helper copy: Complete
- CMS hospital preview behavior preserved: Complete
- CMS dialysis fixture-safety behavior preserved: Complete
- Default map remains synthetic: Complete
- Tests and docs: Complete
- v0.2.9 work: Not completed; intentionally not started

## 4. Files changed

- `statterrain/src/config/product.ts` — Modified — centralized visible prototype version label.
- `statterrain/src/data/demo-region.ts` — Modified — 10/25/50/100-mile quick radius options; inactive drive-time options removed.
- `statterrain/src/components/filters/FilterSidebar.tsx` — Modified — radius quick buttons, 1–250-mile slider, dense-market helper copy.
- `statterrain/src/components/map/MapView.tsx` — Modified — selected planning-radius status label; existing radius overlay follows selected radius.
- `statterrain/src/components/regional-summary/RegionalSummaryPanel.tsx` — Modified — selected-radius scope and zero-facility small-radius copy.
- `statterrain/src/app/page.tsx` — Modified — passes selected radius into regional summary.
- `statterrain/src/lib/export.ts` — Modified — selected planning-radius scope in Markdown/JSON/CSV export behavior; drive-time export copy removed.
- `statterrain/src/components/facilities/FacilityDetailPanel.tsx` — Modified — distance-only facility detail label.
- `statterrain/src/types/facility.ts`, `statterrain/src/data/facilities.ts`, `statterrain/src/lib/public-data/readPublicDataArtifacts.ts` — Modified — active facility model no longer carries the unused drive-time field.
- `statterrain/tests/public-data-registry.spec.ts` — Modified — version gate and static radius/safety tests.
- `statterrain/tests/smoke.spec.ts` — Modified — browser coverage for quick buttons and slider behavior.
- `statterrain/README.md`, `statterrain/docs/PRODUCT_SCOPE.md`, `statterrain/docs/TESTING.md`, `statterrain/docs/PUBLIC_DATA_PIPELINE.md` — Modified — v0.2.8.1 radius and public-data-preservation docs.
- Handoff files — Added — root and docs copies.

Output from `git diff --name-status`:

```text
M	statterrain/README.md
M	statterrain/docs/PRODUCT_SCOPE.md
M	statterrain/docs/PUBLIC_DATA_PIPELINE.md
M	statterrain/docs/TESTING.md
M	statterrain/src/app/page.tsx
M	statterrain/src/components/facilities/FacilityDetailPanel.tsx
M	statterrain/src/components/filters/FilterSidebar.tsx
M	statterrain/src/components/map/MapView.tsx
M	statterrain/src/components/regional-summary/RegionalSummaryPanel.tsx
M	statterrain/src/config/product.ts
M	statterrain/src/data/demo-region.ts
M	statterrain/src/data/facilities.ts
M	statterrain/src/lib/export.ts
M	statterrain/src/lib/public-data/readPublicDataArtifacts.ts
M	statterrain/src/types/facility.ts
M	statterrain/tests/public-data-registry.spec.ts
M	statterrain/tests/smoke.spec.ts
A	HANDOFF-v0.2.8.1-FLEXIBLE-RADIUS-CONTROL-DENSE-MARKET-USABILITY.md
A	statterrain/docs/handoffs/HANDOFF-v0.2.8.1-FLEXIBLE-RADIUS-CONTROL-DENSE-MARKET-USABILITY.md
```

## 5. Implementation summary

- Updated centralized visible version label to `v0.2.8.1 prototype`.
- Updated the version gate so stale product labels fail.
- Added a 10-mile quick radius alongside 25, 50, and 100 miles.
- Added a 1–250 mile slider with 1-mile steps; quick buttons update the slider and slider updates selected radius everywhere.
- Map overlay, map status, summary counts, evidence brief, and Markdown/JSON/CSV export scope use the selected radius.
- Radius copy uses straight-line planning-distance language and avoids drive-time/routing feature claims.
- Added dense-market helper copy recommending smaller radii such as 10 miles.
- Preserved CMS hospital preview behavior, CMS dialysis fixture safety, default synthetic behavior, and public-data guardrails.
- Preserved safety boundaries: no backend, database, auth, PHI, live operational data, drive-time calculation, route calculation, travel-time estimate, ETA, traffic, or clinical decision support.

## 6. Tests

- `tests/public-data-registry.spec.ts`: verifies v0.2.8.1 version gate, quick radius options, slider min/max/step, handler wiring, selected-radius language in summary/map/export, no travel-scope feature copy, CMS hospital preview preservation, CMS dialysis fixture safety, default synthetic behavior, and prohibited-field guardrails.
- `tests/smoke.spec.ts`: adds browser workflow coverage for quick radius options, slider attributes, quick-button selection, custom slider values, low-radius zero-facility-safe copy, and evidence selected-radius scope.

## 7. Commands run

- `cd statterrain && npm ci`
- `cd statterrain && npm run lint && npm run typecheck`
- `cd statterrain && npm run build && npm run data:validate-sources && npm run data:validate-benchmark && npm run data:validate-cms-hospitals && npm run data:validate-cms-dialysis && npm run test:e2e -- tests/public-data-registry.spec.ts`
- `cd statterrain && npm run test:e2e -- tests/public-data-registry.spec.ts`
- `cd statterrain && npx playwright install chromium && npm run test:e2e -- tests/smoke.spec.ts`
- `cd statterrain && npm run test:e2e -- tests/smoke.spec.ts`
- `git diff --check`
- `git status --short`
- `git diff --name-status`

## 8. Verification results

- npm ci: Pass.
- lint: Pass.
- typecheck: Pass.
- build: Pass.
- source validation: Pass.
- benchmark validation: Pass.
- CMS hospital validation: Completed with existing WARN state; 5 records.
- CMS dialysis validation: Completed with existing WARN state; 3 records.
- public-data tests: Pass; 12 passed.
- smoke/Playwright result: Chromium install failed with HTTP 403 from Playwright CDN; smoke suite then failed because `/root/.cache/ms-playwright/chromium_headless_shell-1228/chrome-headless-shell-linux64/chrome-headless-shell` was missing.
- git diff check: Pass.
- Vercel preview: Not available in this environment.

## 9. Known limitations

- Radius is straight-line planning distance, not drive time.
- No route calculation.
- No travel-time estimate.
- National facility artifacts are not complete yet.
- Current CMS hospital preview remains only 5 records.
- Dialysis records are fixture-only/not preview-ready.
- No address/place search yet unless already present from previous work.
- No scheduled automated refresh yet.
- No backend/database/auth.
- No PHI.
- No live routing/diversion/bed status.
- No clinical decision support.
- Legal disclaimer should still be reviewed before external beta/public launch.

## 10. Scope control

Confirmed no patient-level data, patient addresses stored, claims data, PHI, treatment schedules, appointment availability, staffing status, live capacity, new source ingestion, mass geocoding, live routing, drive-time calculation, travel-time estimate, ETA, real-time traffic, new non-CMS real datasets, real Census ACS records, real CDC records, real SAMHSA records, real NPPES records, real nursing home records, dialysis live geocoding, dialysis map preview, fixture data as real preview, synthetic-to-real default UI switch, scheduled cron refresh, auto-merge, direct generated-data push to main, backend, database, authentication, AI API, diversion status, bed status, dispatch recommendation, triage recommendation, transfer recommendation, medical-control guidance, clinical decision support, or v0.2.9 work was added.

## 11. Rollback

Revert the final commit for this branch, then redeploy the prior v0.2.8 build. If rollback is needed after merge, run `git revert <final-commit>` from an up-to-date main branch and verify the version label returns to the prior approved release state.

## 12. Recommended next patch

Recommended: v0.2.9 — National Scale Address Search and Coverage Status.

Purpose: Add U.S. address/place/ZIP/city search, map recentering, selected-location marker, and honest coverage messages for areas outside the current synthetic/preview data.

Alternative: v0.2.9 — National CMS Facility Artifact Scaling Foundation.

Do not implement v0.2.9 in this patch.
