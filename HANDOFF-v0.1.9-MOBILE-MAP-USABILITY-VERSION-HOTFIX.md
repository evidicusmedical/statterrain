# HANDOFF — StatTerrain v0.1.9 Mobile Map Usability and Version Label Hotfix

## 1. Patch identification

- Product: StatTerrain
- Version: v0.1.9 prototype
- Date: 2026-07-09
- Repository: https://github.com/evidicusmedical/statterrain
- Starting main commit: 8c91180cff044ecbae40fb056f478e38e86bd17c
- Branch: v0.1.9-mobile-map-usability-version-hotfix
- Final commit: 021d16e4ede535a4a2c34a6174ae006266293661
- PR URL: Not available in this environment; PR metadata recorded with make_pr tool.
- Vercel preview URL: Not available.

## 2. Objective

Fix the remaining v0.1.8 mobile map usability issues before public-data pipeline work begins. The patch updates the visible prototype label to v0.1.9, prevents the legend from covering the map on fresh mobile loads, provides touch-friendly legend open/collapse controls, reduces the legend footprint, and makes small mobile workspace/popup refinements without changing prototype scope.

## 3. Scope completed

- Visible version label: Complete — central product config now reports `v0.1.9 prototype`.
- Permanent version-label documentation rule: Complete — README and product scope document the future-patch requirement.
- Mobile legend collapsed by default: Complete — mobile starts with only a compact Legend button.
- Desktop legend discoverable and usable: Complete — desktop opens the legend by default, includes Hide, and can reopen from the Legend button.
- Collapse button inside legend: Complete — open legend includes a touch-friendly Hide control.
- Avoid mobile refresh reopening: Complete — mobile default initializes closed on each page load.
- Reduce legend visual footprint: Complete — compact dimensions and source note disclosure added.
- Improve mobile map default view: Complete — legend is collapsed, summary toggle is smaller, bottom tabs remain reachable.
- Reposition/reduce floating controls: Complete — summary toggle chip was reduced on mobile.
- Improve mobile popup usability: Complete — popup content max width and View details tap target improved.
- Preserve previous v0.1.3-v0.1.8 behavior: Complete — tests were updated/extended to continue covering these flows.
- No real-data ingestion or backend scope: Complete — UI/docs/tests only.

## 4. Files changed

- `statterrain/src/config/product.ts` — Modified — updates central prototype version.
- `statterrain/src/components/map/MapLegend.tsx` — Modified — compact collapsible legend with internal Hide control and Map note disclosure.
- `statterrain/src/components/map/MapView.tsx` — Modified — viewport-aware legend default state, Legend open button, mobile popup sizing/tap target.
- `statterrain/src/app/page.tsx` — Modified — smaller mobile summary toggle chip.
- `statterrain/tests/smoke.spec.ts` — Modified — v0.1.9 label checks plus mobile/desktop legend and popup coverage.
- `statterrain/README.md` — Modified — v0.1.9 notes and permanent version-label rule.
- `statterrain/docs/PRODUCT_SCOPE.md` — Modified — v0.1.9 scope and exclusions.
- `statterrain/docs/TESTING.md` — Modified — v0.1.9 test coverage description.
- `statterrain/docs/handoffs/HANDOFF-v0.1.9-MOBILE-MAP-USABILITY-VERSION-HOTFIX.md` — Added — canonical handoff.
- `HANDOFF-v0.1.9-MOBILE-MAP-USABILITY-VERSION-HOTFIX.md` — Added — root handoff copy.

`git diff --name-status` before handoff creation:

```text
M	statterrain/README.md
M	statterrain/docs/PRODUCT_SCOPE.md
M	statterrain/docs/TESTING.md
M	statterrain/src/app/page.tsx
M	statterrain/src/components/map/MapLegend.tsx
M	statterrain/src/components/map/MapView.tsx
M	statterrain/src/config/product.ts
M	statterrain/tests/smoke.spec.ts
```

## 5. Implementation summary

The visible version label was updated through the centralized product configuration so the header/version badge reads `StatTerrain` plus `v0.1.9 prototype`. Documentation now states that every future patch must update the visible heading/version label using `StatTerrain vX.X.X prototype` or the equivalent product-title/version-badge layout.

The map legend now has viewport-aware default behavior: mobile initializes collapsed with a compact Legend button, while desktop opens the legend by default for discoverability. The open legend includes a clear Hide button inside the panel. The legend has a smaller mobile max height/width, shorter text, readable marker keys, and a Map note disclosure for the longer OpenStreetMap caveat.

The mobile map workspace was lightly cleaned up by reducing the summary toggle chip on small screens and improving the facility popup content width and View details tap target. Existing bottom tabs, evidence brief behavior, feedback workflow, synthetic-data warnings, source/freshness inventory, exports, and v0.1.3-v0.1.8 behaviors were preserved.

## 6. Tests

- Modified `statterrain/tests/smoke.spec.ts`.
- Added/updated coverage for visible v0.1.9 label, mobile collapsed legend default, mobile legend open/collapse, default legend footprint ratio, desktop legend discoverability/collapse/reopen, mobile facility popup width and View details reachability.
- Existing tests continue to cover app load, summary Hide/Show, quick-read metric lines, metric meaning accordion behavior, evidence brief v0.1.3 scope, v0.1.5 freshness/source inventory, feedback, exports, mobile tabs, no horizontal overflow, and desktop map enlargement.

## 7. Commands run

From `statterrain/`:

- `npm ci`
- `npm run lint`
- `npm run typecheck`
- `npm run build`
- `npx playwright install chromium`
- `npm run test:e2e`

From repository root:

- `git diff --check`
- `git status --short`
- `git diff --name-status`

## 8. Verification results

- npm ci: Passed.
- lint: Passed.
- typecheck: Passed.
- build: Passed.
- Playwright browser install: Warning/blocked — Chromium download failed with HTTP 403 Forbidden from `https://cdn.playwright.dev/builds/cft/149.0.7827.55/linux64/chrome-linux64.zip`.
- Playwright test run: Warning/blocked — `npm run test:e2e` was run, but all 18 tests failed before execution because the Chromium executable was missing after browser installation failed.
- git diff check: Passed.
- GitHub Actions result: Not available in this environment.
- Vercel preview result: Not available in this environment.

## 9. Known limitations

- Still synthetic data.
- No real CMS data yet.
- No Census/CDC/SAMHSA data yet.
- No real source-defined pediatric age cutoff yet.
- No real rurality classification yet.
- No real chronic disease estimates yet.
- No live routing/diversion/bed status.
- No clinical decision support.
- Mobile usability still should be reviewed on real devices after deployment.

## 10. Scope control

Confirmed this patch added no CMS data, Census data, CDC data, SAMHSA data, NPPES data, backend, database, authentication, AI API, PHI, live routing, clinical decision support, Replit runtime dependency, or v0.2.0 public-data pipeline.

## 11. Rollback

To roll back this patch after merge, revert the final commit with:

```bash
git revert FINAL_COMMIT_HASH
```

Before merge, abandon the branch or reset it to the starting commit:

```bash
git checkout v0.1.9-mobile-map-usability-version-hotfix
git reset --hard 8c91180cff044ecbae40fb056f478e38e86bd17c
```

## 12. Recommended next patch

Recommended next patch: v0.2.0 — Public Data Pipeline Foundation.

Do not implement v0.2.0 as part of this hotfix.
