# HANDOFF — StatTerrain v0.1.8 Collapsible Metric Panels and Mobile Workspace Optimization

## 1. Patch identification

- Product: StatTerrain
- Version: v0.1.8
- Date: 2026-07-09
- Repository: https://github.com/evidicusmedical/statterrain
- Starting main commit: 61ac8f6601258d2f79fc149050c5661f26f2cf4e
- Branch: v0.1.8-collapsible-metrics-mobile-workspace
- Final commit: To be recorded after commit: `ui: improve metric panels and mobile workspace`.
- PR URL: Pending; opened with the required PR tool after commit.
- Vercel preview URL: Not available in this environment at handoff time.

## 2. Objective

This patch improves StatTerrain usability before public-data pipeline work begins. It reduces metric-card vertical space by collapsing full plain-language explanations by default while preserving a short quick-read line, and it makes the phone workspace more map-first so users can move between map, filters, summary, facility details, and evidence brief controls without scrolling through a long stacked page.

## 3. Scope completed

- Collapsible plain-language metric panels: Complete. Full plain-language panels are closed by default and opened with a button.
- Quick-read metric line: Complete. Each card shows a visible quick-read line based on the plain-language higher-means interpretation.
- Metric accordion / one expanded at a time: Complete. Regional summary state tracks the active metric and auto-collapses the prior panel.
- Clicking open metric collapses it: Complete.
- Keyboard interaction: Complete. Native buttons expose aria-expanded / aria-controls and support keyboard activation.
- Technical details secondary: Complete. Source details and technical notes remain in the existing details disclosure.
- Mobile map-first / map-accessible layout: Complete. Mobile keeps the map visible in the primary tab with useful height and bottom tabs for Map / Summary / Facility.
- Mobile filters reachable without permanent space use: Complete. Filters remain available through the existing drawer.
- Summary hide/show preservation: Complete.
- Desktop layout preservation and map enlargement: Complete.
- Responsive helper copy: Complete. Short mobile and map-helper copy was added.
- Preservation of v0.1.3 through v0.1.7 behavior: Complete to the extent verifiable without Playwright browser availability.
- Real-data ingestion: Not completed by design / out of scope. No real public data was added.
- Backend/database/auth/AI/PHI/live operations: Not completed by design / out of scope. None were added.
- v0.2.0 public-data pipeline: Deferred by design. No v0.2.0 work began.

## 4. Files changed

| File path | Change type | Purpose |
| --- | --- | --- |
| `statterrain/src/components/population/MetricDefinitionPanel.tsx` | Modified | Adds visible quick-read line, collapsed-by-default plain-language panel button, aria-expanded/aria-controls, and preserves technical details. |
| `statterrain/src/components/regional-summary/SummaryCard.tsx` | Modified | Accepts accordion state and passes expanded/toggle controls to metric definition panel. |
| `statterrain/src/components/regional-summary/RegionalSummaryPanel.tsx` | Modified | Owns active metric accordion state and adds short mobile helper copy. |
| `statterrain/src/app/page.tsx` | Modified | Improves mobile map height, touch targets, bottom-tab test hooks, and switches to Facility tab after mobile facility selection. |
| `statterrain/tests/smoke.spec.ts` | Modified | Adds/updates Playwright coverage for quick reads, collapsed defaults, accordion behavior, mobile tabs, filters drawer, detail tab, and return-to-map flow. |
| `statterrain/README.md` | Modified | Documents v0.1.8 quick-read, collapsible metric panels, mobile workspace, summary hide/show, and scope controls. |
| `statterrain/docs/PRODUCT_SCOPE.md` | Modified | Documents v0.1.8 UI-only scope, map-first mobile behavior, and exclusions. |
| `statterrain/docs/TESTING.md` | Modified | Documents v0.1.8 test coverage. |
| `statterrain/docs/handoffs/HANDOFF-v0.1.8-COLLAPSIBLE-METRIC-PANELS-MOBILE-WORKSPACE.md` | Added | Canonical handoff document. |
| `HANDOFF-v0.1.8-COLLAPSIBLE-METRIC-PANELS-MOBILE-WORKSPACE.md` | Added | Root handoff copy; identical to canonical copy. |

Output from `git diff --name-status` before commit:

```text
M	statterrain/README.md
M	statterrain/docs/PRODUCT_SCOPE.md
M	statterrain/docs/TESTING.md
M	statterrain/src/app/page.tsx
M	statterrain/src/components/population/MetricDefinitionPanel.tsx
M	statterrain/src/components/regional-summary/RegionalSummaryPanel.tsx
M	statterrain/src/components/regional-summary/SummaryCard.tsx
M	statterrain/tests/smoke.spec.ts
A	HANDOFF-v0.1.8-COLLAPSIBLE-METRIC-PANELS-MOBILE-WORKSPACE.md
A	statterrain/docs/handoffs/HANDOFF-v0.1.8-COLLAPSIBLE-METRIC-PANELS-MOBILE-WORKSPACE.md
```

## 5. Implementation summary

- Quick-read visible line: Every population metric card now shows `Quick read:` followed by the short higher-means interpretation so scanning does not require expansion.
- Collapsed default state: Full plain-language panels are not rendered by default.
- Accordion behavior: `RegionalSummaryPanel` tracks one `expandedMetricId`; selecting another metric closes the previous one, and selecting the open metric closes it.
- Desktop spacing improvement: Metric cards are shorter by default because full explanation blocks are hidden until requested.
- Mobile map-first / map-accessible improvement: The map tab receives useful mobile height, bottom tabs keep Map / Summary / Facility reachable, and selected facilities switch users to the Facility tab.
- Mobile controls used: Bottom tab navigation, existing Filters drawer, summary hide/show button, and collapsible metric panels.
- Preserved exports: Evidence brief Markdown, JSON, and CSV export code was not changed.
- Preserved Hide summary / Show summary behavior: The existing summary toggle remains in the map workspace and still removes/restores the regional summary panel.
- v0.1.3 preservation: Evidence brief scope behavior was not intentionally changed.
- v0.1.4 preservation: Facility detail standardized sections were not intentionally changed.
- v0.1.5 preservation: Data freshness/source inventory and feedback button were not intentionally changed.
- v0.1.6 preservation: Metric source, denominator, future definition, and technical-note framework remains present.
- v0.1.7 preservation: Plain-language fields remain available when expanded, summary collapse remains, no population overlay remains default, synthetic-data warnings and base-map note remain.

## 6. Tests

- Tests modified: `statterrain/tests/smoke.spec.ts`.
- Tests added within the smoke suite: quick-read visibility, plain-language collapsed-by-default state, single-open accordion behavior, collapse-on-second-click behavior, pediatric/poverty/SVI expanded text preservation, mobile tab reachability, filters drawer reachability, facility detail tab reachability, and return-to-map behavior.
- Test coverage explanation: The suite continues to cover app load, filters, facility detail, data freshness/source inventory, feedback, evidence brief scope, exports, summary collapse/restore, and responsive layout, with v0.1.8-specific checks added to the metric and mobile sections.

## 7. Commands run

From `statterrain/`:

- `npm ci`
- `npm run lint`
- `npm run typecheck`
- `npm run build`
- `npx playwright install chromium`
- `npm run test:e2e`

From repo root:

- `git diff --check`
- `git status --short`
- `git diff --name-status`

## 8. Verification results

- `npm ci`: Passed.
- `npm run lint`: Passed.
- `npm run typecheck`: Passed.
- `npm run build`: Passed.
- `npx playwright install chromium`: Failed due to environment/network restriction. The browser download returned HTTP 403 Forbidden from `https://cdn.playwright.dev/builds/cft/149.0.7827.55/linux64/chrome-linux64.zip`.
- `npm run test:e2e`: Failed because the Playwright Chromium executable was unavailable after the browser install failure: `/root/.cache/ms-playwright/chromium_headless_shell-1228/chrome-headless-shell-linux64/chrome-headless-shell` did not exist.
- `git diff --check`: Passed.
- GitHub Actions result: Not available in this environment.
- Vercel preview result: Not available in this environment.

## 9. Known limitations

- Still synthetic demonstration data.
- No real CMS data yet.
- No Census/CDC/SAMHSA data yet.
- No NPPES data yet.
- No real source-defined pediatric age cutoff yet.
- No real rurality classification yet.
- No real chronic disease estimates yet.
- No live routing, diversion status, or bed status.
- No clinical decision support.
- Playwright browser installation was blocked by HTTP 403 in this environment, so end-to-end test assertions were updated but not successfully executed here.

## 10. Scope control

This patch added no:

- CMS data
- Census data
- CDC data
- SAMHSA data
- NPPES data
- backend
- database
- authentication
- AI API
- PHI
- live routing
- clinical decision support
- Replit runtime dependency

## 11. Rollback

To roll back this patch after merge, revert the final commit:

```bash
git revert <final-commit-hash>
```

If the branch has not been merged, close the PR and delete the branch:

```bash
git branch -D v0.1.8-collapsible-metrics-mobile-workspace
git push origin --delete v0.1.8-collapsible-metrics-mobile-workspace
```

## 12. Recommended next patch

Recommended next patch: **v0.2.0 — Public Data Pipeline Foundation**.

Do not implement v0.2.0 as part of this patch.
