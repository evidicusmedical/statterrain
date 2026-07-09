# StatTerrain v0.1.11 — Mobile Map, Summary, and Facility Panel Hotfix Handoff

## 1. Patch identification

- Version: v0.1.11 prototype
- Branch: v0.1.11-mobile-map-summary-facility-hotfix
- Commit message: `ui: fix mobile summary and facility panels`
- Base branch requested: main

## 2. Objective

Make the mobile Map / Summary / Facility workflow usable and high-fidelity by preventing Leaflet map bleed through the mobile tabs, restoring mobile Summary content, and making mobile Facility details readable in a full-width panel.

## 3. Scope completed

- Updated the visible product version to v0.1.11 prototype.
- Raised and solidified the mobile tab bar above Leaflet panes.
- Isolated/clipped the Leaflet map shell while preserving attribution, popups, markers, controls, and legend.
- Refactored Summary visibility so mobile Summary remains available and restores `summaryOpen` when selected.
- Redesigned mobile Facility details with a full-width readable panel and clearer empty state.
- Kept the popup compact with reachable View details behavior.
- Added Playwright coverage for the v0.1.11 mobile map, summary, facility, and regression expectations.
- Updated README, product scope, and testing documentation.
- Did not add real public data, backend, database, authentication, AI API, PHI handling, routing, diversion, bed status, dispatch, triage, transfer recommendation, medical-control guidance, clinical decision support, or v0.2.0 work.

## 4. Files changed with git diff --name-status

```text
M	statterrain/README.md
M	statterrain/docs/PRODUCT_SCOPE.md
M	statterrain/docs/TESTING.md
M	statterrain/src/app/globals.css
M	statterrain/src/app/page.tsx
M	statterrain/src/components/facilities/FacilityDetailPanel.tsx
M	statterrain/src/components/map/MapView.tsx
M	statterrain/src/config/product.ts
M	statterrain/tests/smoke.spec.ts
A	HANDOFF-v0.1.11-MOBILE-MAP-SUMMARY-FACILITY-HOTFIX.md
A	statterrain/docs/handoffs/HANDOFF-v0.1.11-MOBILE-MAP-SUMMARY-FACILITY-HOTFIX.md
```

## 5. Implementation summary

- `product.ts` now reports `v0.1.11 prototype`.
- Mobile tab bar now uses a solid white background, border-y, shadow, `isolate`, and high z-index.
- Map and Leaflet panes are contained with an isolated map shell, `overflow-hidden`, and scoped Leaflet z-index rules.
- Regional Summary is always mounted for mobile tab access, while desktop still honors the summary collapse state.
- Tapping mobile Summary restores `summaryOpen` and shows the regional summary content rather than a blank tab.
- Facility details use a mobile-friendly full-width, larger-text panel with the standardized facility sections preserved.
- Facility empty state now clearly instructs: “Select a facility on the map to view details.”

## 6. Tests

- Playwright smoke tests were updated to cover v0.1.11 mobile tab containment, attribution preservation, Summary restoration, Facility empty/detail states, full-width mobile Facility details, compact popup View details, and existing regressions.

## 7. Commands run

From `statterrain/`:

```text
npm ci
npm run lint
npm run typecheck
npm run build
npx playwright install chromium
npm run test:e2e
```

From repo root:

```text
git diff --check
git status --short
git diff --name-status
```

## 8. Verification results

- `npm ci`: Passed.
- `npm run lint`: Passed with no ESLint warnings or errors.
- `npm run typecheck`: Passed.
- `npm run build`: Passed.
- `npx playwright install chromium`: Failed because the Playwright Chromium download returned HTTP 403 Forbidden from `https://cdn.playwright.dev/builds/cft/149.0.7827.55/linux64/chrome-linux64.zip`.
- `npm run test:e2e`: Ran after the install failure, but all tests failed at browser launch because `/root/.cache/ms-playwright/chromium_headless_shell-1228/chrome-headless-shell-linux64/chrome-headless-shell` does not exist.
- `git diff --check`: Passed.
- `git status --short`: Showed expected modified and added files before commit.
- `git diff --name-status`: Showed expected modified and added files before commit.

## 9. Known limitations

- Playwright browser installation was blocked by HTTP 403, so e2e assertions could not execute in this environment.
- The app remains a synthetic-data frontend prototype.
- No Vercel preview URL was available in this local environment.

## 10. Scope control

No real public data was added. No CMS, Census, CDC, SAMHSA, NPPES, backend, database, authentication, AI API, PHI handling, live routing, diversion, bed status, dispatch, triage, transfer recommendation, medical-control guidance, clinical decision support, or v0.2.0 public-data-pipeline work was added.

## 11. Rollback

Revert the commit `ui: fix mobile summary and facility panels`, then reinstall dependencies and rerun lint/typecheck/build/e2e checks when browser installation is available.

## 12. Recommended next patch

v0.2.0 — Public Data Pipeline Foundation.
