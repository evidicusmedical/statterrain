# StatTerrain v0.1.3 — Evidence Brief Scope and Default Situational Awareness Handoff

## 1. Patch identification

- Product: StatTerrain
- Version: v0.1.3
- Date: 2026-07-09
- Repository: https://github.com/evidicusmedical/statterrain
- Starting `main` commit: fcc65c3ce3731ece5b39f8da5f0e3dabfeb9f2ad
- Branch: v0.1.3-evidence-brief-scope
- Final commit: created on this branch with message `fix: make evidence brief scope geography-based`; see PR/final report for immutable hash
- PR URL: Not available before PR creation; see final report / PR record
- Vercel preview URL: Not available in this local environment

## 2. Objective

This patch fixes the product-safety and workflow risk that evidence briefs could silently omit facility categories because the user hid those categories with map display filters. The intended default workflow is full situational awareness first: all facility categories visible, all demonstration confidence levels included, no population-health overlay selected by default, no selected facility preloaded, and evidence briefs scoped to all available facility categories in the selected geography/radius unless a future explicit brief-scope control is introduced.

## 3. Scope completed

- Complete — Default full situational awareness: all facility categories and all demonstration confidence levels are selected by default; no overlay is selected by default; selected facility is cleared on initial load and after location selection.
- Complete — Misleading count label renamed to `Facilities in selected geography`.
- Complete — Map filters separated from evidence brief scope with display-control labeling and explanatory copy.
- Complete — Evidence brief scope statement added near the top of the drawer and generated Markdown content.
- Complete — Markdown, JSON, and CSV export formats preserved and updated to include the scope statement.
- Complete — Drawer z-index increased above Leaflet map panes.
- Complete — Selected-facility display lightly improved with stronger marker selection state already present and a highlighted right-side detail panel/selected badge.
- Complete — Synthetic-data language clarified as synthetic demonstration data, not a real-world source.
- Complete — Playwright smoke coverage updated for defaults, display filters, evidence brief scope, exports, drawer layering, and mobile/tablet usability.
- Complete — Documentation updated without adding real public data.

## 4. Files changed

| File path | Change type | Purpose |
| --- | --- | --- |
| `statterrain/README.md` | Modified | Documents display-filter behavior, default no overlay, evidence brief default scope, and synthetic-data status. |
| `statterrain/docs/PRODUCT_SCOPE.md` | Modified | Clarifies display controls, default scope, and explicit out-of-scope operational/clinical functions. |
| `statterrain/docs/TESTING.md` | Modified | Updates smoke-test coverage description for v0.1.3 scope behavior. |
| `statterrain/src/app/page.tsx` | Modified | Resets filters and selected facility on location selection; passes geography/radius-scoped records to evidence brief context. |
| `statterrain/src/components/evidence/EvidenceBriefDrawer.tsx` | Modified | Shows the evidence brief scope statement in the drawer and preserves export controls. |
| `statterrain/src/components/facilities/FacilityDetailPanel.tsx` | Modified | Highlights the selected facility as the primary detail panel and clarifies synthetic-data status. |
| `statterrain/src/components/filters/FilterSidebar.tsx` | Modified | Labels filters as display controls and adds scope explanatory text. |
| `statterrain/src/components/layout/Header.tsx` | Modified | Replaces freshness-like demonstration retrieval language with synthetic-data status. |
| `statterrain/src/components/regional-summary/RegionalSummaryPanel.tsx` | Modified | Renames `Facilities in view` to `Facilities in selected geography`. |
| `statterrain/src/components/ui/Drawer.tsx` | Modified | Raises drawer stacking above Leaflet map panes. |
| `statterrain/src/config/product.ts` | Modified | Updates synthetic-data notice to state data is not a real-world source. |
| `statterrain/src/hooks/useAppState.ts` | Modified | Starts with no selected facility and exposes clear-selected helper while retaining full default filters. |
| `statterrain/src/lib/export.ts` | Modified | Separates displayed facilities from evidence brief facilities; includes scope statement in Markdown, JSON, and CSV exports. |
| `statterrain/tests/smoke.spec.ts` | Modified | Adds/updates Playwright coverage for required v0.1.3 behavior. |
| `HANDOFF-v0.1.3-EVIDENCE-BRIEF-SCOPE.md` | Added | Root handoff copy. |
| `statterrain/docs/handoffs/HANDOFF-v0.1.3-EVIDENCE-BRIEF-SCOPE.md` | Added | Canonical handoff document. |

```bash
M	statterrain/README.md
M	statterrain/docs/PRODUCT_SCOPE.md
M	statterrain/docs/TESTING.md
M	statterrain/src/app/page.tsx
M	statterrain/src/components/evidence/EvidenceBriefDrawer.tsx
M	statterrain/src/components/facilities/FacilityDetailPanel.tsx
M	statterrain/src/components/filters/FilterSidebar.tsx
M	statterrain/src/components/layout/Header.tsx
M	statterrain/src/components/regional-summary/RegionalSummaryPanel.tsx
M	statterrain/src/components/ui/Drawer.tsx
M	statterrain/src/config/product.ts
M	statterrain/src/hooks/useAppState.ts
M	statterrain/src/lib/export.ts
M	statterrain/tests/smoke.spec.ts
A	HANDOFF-v0.1.3-EVIDENCE-BRIEF-SCOPE.md
A	statterrain/docs/handoffs/HANDOFF-v0.1.3-EVIDENCE-BRIEF-SCOPE.md
```

## 5. Implementation summary

- Default filter behavior: facility type defaults remain all selected, source confidence defaults to all demonstration records, overlay defaults to none, and the app no longer preselects a facility. Selecting a new location resets display filters and clears the selected facility.
- Evidence brief scope behavior: the evidence brief context now receives both `visibleFacilities` for display state and `briefFacilities` for all records within the selected geography/radius. Brief generation uses `briefFacilities` for facility summaries and source selection.
- Export behavior: Markdown, JSON, and CSV exports still work and include the evidence brief scope statement. JSON now distinguishes active display filters/displayed facilities from the geography/radius-scoped brief facilities.
- Drawer/map layering fix: the drawer overlay z-index was raised to sit above Leaflet stacking contexts.
- Selected-facility display change: selected facility state no longer appears by default; when selected, the detail panel is visually highlighted and includes a `Selected facility` badge while retaining the right-side panel as the primary information area.
- Synthetic-data language change: product copy now says `Synthetic demonstration data — not a real-world source` so demonstration records do not appear to be verified public data.

## 6. Tests

- Tests added/modified in `statterrain/tests/smoke.spec.ts`.
- Coverage now includes: app load; default all facility categories; default no overlay; display filters changing displayed counts; evidence brief opening; scope statement; hidden-by-display facility categories remaining in brief scope; Markdown/JSON/CSV downloads; drawer stacking above map; mobile and tablet usability.
- Playwright could not complete in this environment because Chromium download returned HTTP 403 and the expected browser executable was unavailable.

## 7. Commands run

```bash
git checkout -b v0.1.3-evidence-brief-scope
cd statterrain
npm ci
npm run lint
npm run typecheck
npm run build
npx playwright install chromium
npm run test:e2e
cd ..
git diff --check
git status --short
git diff --name-status
```

## 8. Verification results

- npm ci: Passed.
- lint: Passed.
- typecheck: Passed.
- build: Passed.
- Playwright install: Failed due to environment/network limitation — browser download returned HTTP 403 from the Playwright CDN.
- Playwright e2e: Failed because Chromium executable was unavailable after the install failure.
- git diff check: Passed (`git diff --check`).
- GitHub Actions result: Not available in this local environment.
- Vercel preview result: Not available in this local environment.

## 9. Known limitations

- Still synthetic demonstration data.
- No real CMS data yet.
- No real Census data yet.
- No CDC data yet.
- No SAMHSA data yet.
- No address search beyond the existing synthetic search suggestions.
- No true drive-time support.
- No real jurisdiction layer.
- No live routing, diversion, or bed-status information.

## 10. Scope control

Confirmed this patch added no:

- CMS data
- Census data
- CDC data
- SAMHSA data
- backend
- database
- authentication
- AI API
- PHI
- live routing
- clinical decision support
- Replit runtime dependency

## 11. Rollback

To roll back before merge, close the PR and delete branch `v0.1.3-evidence-brief-scope`. To roll back after merge, revert the merge commit or run:

```bash
git revert <final-commit-or-merge-commit>
```

Then redeploy from `main` through the existing Vercel workflow.

## 12. Recommended next patch

Recommended next patch: `v0.1.4 — Facility Detail Standardization and Capability Definitions`.

Do not implement v0.1.4 as part of this patch.
