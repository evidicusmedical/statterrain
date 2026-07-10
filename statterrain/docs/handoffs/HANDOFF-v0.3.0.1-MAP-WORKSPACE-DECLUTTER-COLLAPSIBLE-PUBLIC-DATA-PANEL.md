# HANDOFF — v0.3.0.1 Map Workspace Declutter and Collapsible Public-Data Panel

## 1. Patch identification

- Product: StatTerrain
- Version: v0.3.0.1 prototype
- Date: 2026-07-10
- Repository: https://github.com/evidicusmedical/statterrain
- Starting main commit: c5b70b3c723717f1e7b4064928525cac7f2b6421
- Branch: v0.3.0.1-map-workspace-declutter-collapsible-public-data-panel
- Final commit: recorded in git after commit (`ui: declutter map workspace source panel`)
- PR URL: not available in local environment; PR metadata recorded with make_pr tool
- Vercel preview URL: not available

## 2. Objective

Declutter the map workspace by making the public-data source/freshness panel compact and collapsible by default, fixing the summary tooltip artifact, reducing default over-map warning clutter, and preserving all v0.3.0 public-data safety boundaries and default synthetic map behavior.

## 3. Scope completed

- Complete — Updated visible version label to v0.3.0.1 prototype.
- Complete — Made the public-data source/freshness panel compact/collapsed by default.
- Complete — Kept full source/freshness/provenance details available through Details/Collapse controls.
- Complete — Kept critical safety and preview status visible in compact mode.
- Complete — Preserved the CMS hospital preview toggle in a clear location.
- Complete — Reduced long warning text over the map.
- Complete — Moved prohibited-use text into expanded details; footer disclaimer remains unchanged.
- Complete — Removed the persistent floating Show summary helper artifact.
- Complete — Improved z-index/layering for map overlays.
- Complete — Preserved address search behavior.
- Complete — Preserved radius behavior.
- Complete — Preserved CMS hospital preview behavior.
- Complete — Preserved CMS dialysis fixture safety.
- Complete — Preserved default synthetic map behavior.
- Complete — Added/updated tests and docs.
- Complete — Created v0.3.0.1 handoff files.
- Deferred — Vercel preview URL is not available from this local environment.

## 4. Files changed

- HANDOFF-v0.3.0.1-MAP-WORKSPACE-DECLUTTER-COLLAPSIBLE-PUBLIC-DATA-PANEL.md — added root handoff document.
- statterrain/docs/handoffs/HANDOFF-v0.3.0.1-MAP-WORKSPACE-DECLUTTER-COLLAPSIBLE-PUBLIC-DATA-PANEL.md — added docs handoff copy.
- statterrain/src/config/product.ts — updated centralized visible version label.
- statterrain/src/components/public-data/PublicDataFreshnessPanel.tsx — converted source/freshness panel to compact/collapsible UI with accessible expand/collapse controls and retained details.
- statterrain/src/app/page.tsx — removed persistent summary helper copy and lowered overlay z-index layers.
- statterrain/tests/public-data-registry.spec.ts — updated version gate and static UI/safety tests for compact panel and summary artifact removal.
- statterrain/tests/smoke.spec.ts — updated summary-toggle smoke expectation.
- statterrain/README.md — documented v0.3.0.1 UI declutter and unchanged public-data behavior.
- statterrain/docs/PRODUCT_SCOPE.md — documented v0.3.0.1 scope and safety boundaries.
- statterrain/docs/TESTING.md — documented v0.3.0.1 testing expectations.

### git diff --name-status

```text
M	statterrain/README.md
M	statterrain/docs/PRODUCT_SCOPE.md
M	statterrain/docs/TESTING.md
M	statterrain/src/app/page.tsx
M	statterrain/src/components/public-data/PublicDataFreshnessPanel.tsx
M	statterrain/src/config/product.ts
M	statterrain/tests/public-data-registry.spec.ts
M	statterrain/tests/smoke.spec.ts
```

## 5. Implementation summary

- Version label update: `product.prototypeVersion` is now `v0.3.0.1 prototype`.
- Version gate: public-data registry tests assert the centralized version and reject stale active labels.
- Compact source/freshness panel: the panel initializes with `useState(false)` and shows only critical coverage, hospital, dialysis, and preview state copy by default.
- Expanded detail behavior: Details/Collapse controls reveal source/freshness fields, validation/geocoding status, record counts, coverage manifest summary, limitations, and prohibited uses.
- Preview toggle placement/status: the CMS hospital preview checkbox remains in the compact card with visible optional/off/enabled status.
- Safety status in compact mode: compact mode states the default map remains synthetic unless preview is enabled, national build is in progress, the hospital sample is bounded, and dialysis is fixture-only/not map-ready.
- Summary tooltip/popover fix: persistent helper text under Show summary was removed and replaced with screen-reader-only context.
- Warning/copy reduction: long prohibited-use copy moved out of default map overlay into expanded details.
- Layout/z-index cleanup: map overlay z-index values were lowered and the source panel was rounded/compact to avoid dominating the map.
- Address search preservation: search component wiring in page state remains unchanged.
- Radius preservation: radius props and controls remain unchanged.
- CMS hospital preview preservation: optional/off-by-default preview behavior and the 5-record sample guard remain unchanged.
- CMS dialysis fixture preservation: dialysis remains fixture-only/not map-ready and not preview-ready.
- Manifest preservation: source coverage, artifact manifest, geocoding cache, changed-address, and chunking scaffolds remain unchanged.
- Default synthetic behavior: the default map remains synthetic demonstration data.
- Preserved safety boundaries: no backend/database/auth, PHI, claims, live operational data, routing, ETA, drive-time, traffic, bed status, diversion, recommendations, or clinical decision support was added.

## 6. Tests

- Updated product version guardrail tests to require `v0.3.0.1 prototype`.
- Added/updated public-data panel static tests covering default collapsed state, compact status copy, CMS hospital bounded sample status, CMS dialysis fixture/not-map-ready status, preview status, Details/Collapse controls, accessible expanded state, expanded provenance/freshness details, and prohibited-use placement.
- Added/updated tests ensuring Show summary remains usable without persistent floating helper copy.
- Existing address search, radius, coverage manifest, CMS hospital preview, CMS dialysis fixture safety, and default synthetic map tests remain in the public-data registry suite.

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

- npm ci: PASS.
- lint: PASS.
- typecheck: PASS.
- build: PASS.
- source validation: PASS.
- benchmark validation: PASS.
- CMS hospital validation: WARN as expected for current bounded sample; command completed.
- CMS dialysis validation: WARN as expected for fixture-only state; command completed.
- changed-address detection: PASS; planning report written by existing script.
- chunk planning: PASS; planning report written by existing script.
- public-data tests: PASS, 22 passed.
- smoke/Playwright result: Playwright Chromium install attempted and failed with HTTP 403 from `https://cdn.playwright.dev/builds/cft/149.0.7827.55/linux64/chrome-linux64.zip`; smoke test was not run because the browser install failed.
- git diff check: PASS.
- Vercel preview: not available.

## 9. Known limitations

- Public-data details are collapsed by default but still available.
- Current map-ready hospital preview remains only 5 records.
- National hospital pull has not been run yet.
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

Confirmed no patient-level data, patient addresses stored, claims data, PHI, treatment schedules, appointment availability, staffing status, live capacity, source ingestion, national CMS pull, mass geocoding, facility live geocoding, national records made map-ready without coordinates, live routing, drive-time calculation, travel-time estimate, ETA, real-time traffic, new non-CMS real datasets, real Census ACS records, real CDC records, real SAMHSA records, real NPPES records, real nursing home records, dialysis real fetch, dialysis live geocoding, dialysis map preview, fixture data as real preview, synthetic-to-real default UI switch, scheduled cron refresh, auto-merge, direct generated-data push to main, backend, database, authentication, AI API, diversion status, bed status, dispatch recommendation, triage recommendation, transfer recommendation, medical-control guidance, clinical decision support, or v0.3.1 work was added.

## 11. Rollback

Revert the final commit for this branch, then redeploy the previous v0.3.0 build if needed:

```bash
git revert <final-commit-sha>
```

If only the UI declutter must be rolled back, restore `PublicDataFreshnessPanel.tsx`, `page.tsx`, and the related tests/docs from `main`, then keep or separately decide whether to revert the version label.

## 12. Recommended next patch

v0.3.1 — CMS Hospital National Pull Expansion

Purpose: Expand CMS Hospital General Information from the 5-record sample into a full national normalized artifact while keeping national records non-map-ready until chunked geocoding/geography joins are completed.

Do not implement v0.3.1 in this patch.
