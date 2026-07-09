# HANDOFF — StatTerrain v0.1.10 Evidence Brief GUI, Feedback Context, and Disclaimer Polish

## 1. Patch identification

- Product: StatTerrain
- Version: v0.1.10 prototype
- Date: 2026-07-09
- Repository: https://github.com/evidicusmedical/statterrain
- Starting main commit: b3394e72605263e59163c07d69949c8307f7b675
- Branch: v0.1.10-evidence-brief-gui-feedback-disclaimer-polish
- Final commit: See final report / Git history for the committed patch hash
- PR URL: Not available from local repository metadata; PR recorded with make_pr tool.
- Vercel preview URL: Not available in this environment.

## 2. Objective

Polish the StatTerrain synthetic-data frontend before v0.2.0 public-data pipeline work by making evidence-brief actions visually honest, moving feedback out of the desktop evidence-brief drawer, embedding useful app context in the standard feedback mailto, preventing mobile map overflow over safety text, and strengthening visible legal/safety disclaimers.

## 3. Scope completed

- Version label update: Complete — central product config now reports `v0.1.10 prototype`.
- Evidence brief action styling: Complete — Markdown, JSON, CSV, and Copy Markdown use neutral inactive styling and dark-green active styling with `aria-pressed`.
- Preserve evidence brief exports: Complete — Markdown, JSON, CSV, and Copy Markdown behavior remains client-side.
- Remove embedded desktop evidence-brief feedback: Complete — Send Feedback and the duplicate copy-feedback-context control were removed from the evidence brief drawer.
- Keep feedback reachable on mobile: Complete — the standard header Send Feedback link is visible on mobile and desktop.
- Feedback recipient/context: Complete — mailto recipient is `mathew.h.lowe+statterrain@gmail.com`; generated body includes app, version, synthetic-data status, URL, geography, radius, facility, active mobile tab, summary state, scope, timestamp, and synthetic-data note.
- Copy feedback context decision: Complete — removed from the evidence-brief drawer as duplicative because the standard mailto now embeds equivalent context; the unused helper file was not expanded.
- Mobile map overflow fix: Complete — map section and map wrapper now clip overflow, isolate map z-index, and keep mobile tabs above Leaflet panes.
- Mobile/desktop GUI polish: Complete — action alignment, active states, z-index containment, and feedback placement were refined without major redesign.
- Disclaimer hardening: Complete — central disclaimer now covers planning-only status, synthetic data, non-clinical/non-operational exclusions, official-source verification, area-level population metrics, and emergency protocol guidance.
- Documentation updates: Complete — README, product scope, testing docs, and this handoff document updated.
- Legal counsel review note: Complete — docs and handoff note qualified legal review is required before external beta or public launch.
- Preserve v0.1.3-v0.1.9 behavior: Complete to the extent verified by lint/typecheck/build and updated Playwright coverage; e2e execution was blocked by unavailable Playwright Chromium after the browser download returned 403.
- Real-data/backend exclusions: Complete — no real public data, backend, database, auth, AI API, PHI handling, live routing/diversion/bed status/medical-control/triage/dispatch/transfer/CDS, or v0.2.0 pipeline work was added.

## 4. Files changed

| File path | Change type | Purpose |
| --- | --- | --- |
| `statterrain/src/config/product.ts` | Modified | Update version, feedback recipient/subject config, and stronger central disclaimer. |
| `statterrain/src/components/feedback/FeedbackButton.tsx` | Modified | Build contextual feedback mailto body client-side. |
| `statterrain/src/components/layout/Header.tsx` | Modified | Keep feedback visible on mobile/desktop and pass context fields. |
| `statterrain/src/app/page.tsx` | Modified | Pass feedback context and improve map/mobile tab containment. |
| `statterrain/src/components/evidence/EvidenceBriefDrawer.tsx` | Modified | Add active evidence action state, neutral inactive styling, stronger disclaimer, and remove feedback controls. |
| `statterrain/src/components/map/MapView.tsx` | Modified | Clip map overflow and lower legend stacking inside map section. |
| `statterrain/src/app/globals.css` | Modified | Contain Leaflet pane/control z-index below drawers, tabs, and disclaimers. |
| `statterrain/tests/smoke.spec.ts` | Modified | Update v0.1.10 coverage for version, feedback mailto/context, evidence action active states, drawer feedback removal, disclaimer, exports, and mobile reachability. |
| `statterrain/README.md` | Modified | Document v0.1.10 behavior, feedback, map containment, disclaimer hardening, and exclusions. |
| `statterrain/docs/PRODUCT_SCOPE.md` | Modified | Document v0.1.10 scope and explicit exclusions. |
| `statterrain/docs/TESTING.md` | Modified | Document v0.1.10 Playwright coverage intent. |
| `statterrain/docs/handoffs/HANDOFF-v0.1.10-EVIDENCE-BRIEF-GUI-FEEDBACK-DISCLAIMER-POLISH.md` | Added | Canonical handoff. |
| `HANDOFF-v0.1.10-EVIDENCE-BRIEF-GUI-FEEDBACK-DISCLAIMER-POLISH.md` | Added | Root handoff copy identical to canonical handoff. |

Output from `git diff --name-status` before final commit:

```text
M	statterrain/README.md
M	statterrain/docs/PRODUCT_SCOPE.md
M	statterrain/docs/TESTING.md
M	statterrain/src/app/globals.css
M	statterrain/src/app/page.tsx
M	statterrain/src/components/evidence/EvidenceBriefDrawer.tsx
M	statterrain/src/components/feedback/FeedbackButton.tsx
M	statterrain/src/components/layout/Header.tsx
M	statterrain/src/components/map/MapView.tsx
M	statterrain/src/config/product.ts
M	statterrain/tests/smoke.spec.ts
A	HANDOFF-v0.1.10-EVIDENCE-BRIEF-GUI-FEEDBACK-DISCLAIMER-POLISH.md
A	statterrain/docs/handoffs/HANDOFF-v0.1.10-EVIDENCE-BRIEF-GUI-FEEDBACK-DISCLAIMER-POLISH.md
```

## 5. Implementation summary

- Version label update: `product.prototypeVersion` changed to `v0.1.10 prototype`, preserving central configuration as the source of truth.
- Evidence brief active-state styling: the drawer tracks the most recently clicked Markdown, JSON, CSV, or Copy Markdown action locally and exposes active state through `aria-pressed`; active buttons use dark green with white text, while inactive buttons use neutral bordered styling.
- Feedback placement change: Send Feedback was removed from the evidence brief drawer so desktop evidence actions focus on export/copy only. Feedback remains in the header.
- Feedback mailto recipient/context: the standard feedback link now uses `mathew.h.lowe+statterrain@gmail.com` and embeds app/version/context details in the email body.
- Copy-feedback-context decision: the separate evidence-drawer copy-feedback-context button was removed as duplicative and cluttering because the mailto body now includes the same context automatically.
- Mobile map overflow fix: the map region is isolated and overflow-clipped; Leaflet pane/control z-index is kept under non-map UI; mobile tabs have an explicit stacking context.
- Mobile/desktop GUI polish: action rows, map containment, legend stacking, and feedback placement were refined without changing core workflows.
- Disclaimer hardening: the central disclaimer now clearly states planning-only/prototype status, synthetic-only data, prohibited clinical/operational uses, official-source verification, area-level metric limitations, and emergency protocol guidance.
- Legal counsel review note: documentation explicitly states disclaimer language should be reviewed by qualified legal counsel before external beta or public launch.
- Preserved v0.1.3-v0.1.9 behavior: the evidence brief scope statement, facility details/capability framework, source freshness inventory, plain-language metrics, summary hide/show, quick-read lines, collapsed metric panels, mobile tabs, auto-switch to facility detail, collapsed mobile legend, no default population overlay, synthetic warnings, base-map note, and Markdown/JSON/CSV exports remain represented in code/tests.

## 6. Tests

- Tests added/modified in `statterrain/tests/smoke.spec.ts`:
  - v0.1.10 visible heading/version assertion.
  - Strengthened disclaimer assertion.
  - Feedback recipient and embedded app/version/context mailto body assertion.
  - Evidence drawer assertions that Send Feedback and Copy feedback context are absent.
  - Evidence action neutral initial state and active selected state for Markdown, JSON, CSV, and Copy Markdown.
  - Mobile Send Feedback reachability assertion.
  - Continued export, legend, popup, summary, quick-read, metric accordion, freshness inventory, and responsive overflow coverage.
- Test coverage explanation: coverage is frontend-only and synthetic-data-only. It verifies UI contracts and regressions but does not validate real public-data ingestion or operational workflows.

## 7. Commands run

From `statterrain/` app directory:

```bash
npm ci
npm run lint
npm run typecheck
npm run build
npx playwright install chromium
npm run test:e2e
```

From repo root:

```bash
git diff --check
git status --short
git diff --name-status
```

Additional development commands actually run included branch/status inspection, ripgrep searches, file viewing with `sed`, formatting with `npx prettier --write ...`, and Git commit/PR preparation commands.

## 8. Verification results

- `npm ci`: Passed.
- `npm run lint`: Passed with no ESLint warnings or errors.
- `npm run typecheck`: Passed.
- `npm run build`: Passed.
- `npx playwright install chromium`: Warning/blocked — failed because Playwright Chromium download returned HTTP 403 Forbidden from `https://cdn.playwright.dev/builds/cft/149.0.7827.55/linux64/chrome-linux64.zip`.
- `npm run test:e2e`: Warning/blocked — command was run, but all tests failed before execution because the Playwright Chromium executable was missing after the browser-install download failure.
- `git diff --check`: Passed.
- GitHub Actions result: Not available in this environment.
- Vercel preview result: Not available in this environment.

## 9. Known limitations

- Still synthetic data.
- No real CMS data yet.
- No Census/CDC/SAMHSA data yet.
- No NPPES data yet.
- No real source-defined pediatric age cutoff yet.
- No real rurality classification yet.
- No real chronic disease estimates yet.
- No live routing/diversion/bed status.
- No clinical decision support.
- No backend, database, authentication, AI API, analytics, feedback backend, or PHI workflow.
- Disclaimer text still requires qualified legal counsel review before external beta or public launch.
- Mobile usability should still be reviewed on real devices after deployment.
- Playwright e2e verification could not complete in this environment because browser installation was blocked by a 403 response from the Playwright CDN.

## 10. Scope control

Confirmed no CMS data, Census data, CDC data, SAMHSA data, NPPES data, backend, database, authentication, AI API, PHI, live routing, diversion status, bed status, dispatch recommendation, triage recommendation, transfer recommendation, medical-control guidance, clinical decision support, Replit runtime dependency, or v0.2.0 public-data pipeline was added.

## 11. Rollback

To roll back this patch after merge, revert the final commit:

```bash
git revert <final-commit-hash-from-final-report>
```

If working locally before merge, switch back to the previous branch and delete this feature branch:

```bash
git checkout main
git branch -D v0.1.10-evidence-brief-gui-feedback-disclaimer-polish
```

## 12. Recommended next patch

Recommend: v0.2.0 — Public Data Pipeline Foundation.

Do not implement v0.2.0 as part of this patch.
