# StatTerrain v0.1.4 — Facility Detail Standardization and Capability Definitions Handoff

## 1. Patch identification

- Product: StatTerrain
- Version: v0.1.4
- Date: 2026-07-09
- Repository: https://github.com/evidicusmedical/statterrain
- Starting `main` commit: a0cddd7
- Branch: v0.1.4-facility-detail-capability-definitions
- Final commit: see the git commit containing this handoff
- PR URL: pending from pull request creation
- Vercel preview URL: Not available in this environment

## 2. Objective

This patch standardizes the selected-facility detail panel and adds reusable facility category and hospital capability definition frameworks. It is intended to make clear what is known, unavailable, synthetic, source-linked, and safe to infer before future real public data is introduced.

## 3. Scope completed

- Facility detail standardized sections: Complete.
- Verified/missing-data language: Complete.
- Facility category explanations: Complete.
- Hospital capability explanation framework: Complete.
- Source / learn-more links where available: Complete.
- Synthetic demonstration status: Complete.
- v0.1.3 evidence brief behavior preservation: Complete.
- No real-data ingestion: Complete.
- Playwright coverage updates: Complete, but local execution was blocked by Chromium download failure.
- Documentation updates: Complete.

## 4. Files changed

| File path | Change type | Purpose |
| --- | --- | --- |
| `statterrain/README.md` | Modified | Documents v0.1.4 facility detail structure, missing-data language, definitions, and operational limits. |
| `statterrain/docs/PRODUCT_SCOPE.md` | Modified | Clarifies product scope for facility details and capability definitions. |
| `statterrain/docs/TESTING.md` | Modified | Documents expanded Playwright coverage expectations. |
| `statterrain/src/components/facilities/FacilityDetailPanel.tsx` | Modified | Implements standardized facility detail sections, synthetic labeling, source links, missing-data language, and definition accordions. |
| `statterrain/src/config/capabilityDefinitions.ts` | Added | Adds reusable hospital capability definitions. |
| `statterrain/src/config/facilityCategoryDefinitions.ts` | Added | Adds reusable facility category explanations. |
| `statterrain/src/types/facility.ts` | Modified | Adds optional contact fields and capability terms for future-safe UI preparation. |
| `statterrain/tests/smoke.spec.ts` | Modified | Adds facility detail, synthetic status, missing-data, category explanation, and capability glossary checks. |
| `statterrain/docs/handoffs/HANDOFF-v0.1.4-FACILITY-DETAIL-CAPABILITY-DEFINITIONS.md` | Added | Canonical handoff document. |
| `HANDOFF-v0.1.4-FACILITY-DETAIL-CAPABILITY-DEFINITIONS.md` | Added | Root copy of the handoff document. |

`git diff --name-status` before handoff creation showed:

```text
M	statterrain/README.md
M	statterrain/docs/PRODUCT_SCOPE.md
M	statterrain/docs/TESTING.md
M	statterrain/src/components/facilities/FacilityDetailPanel.tsx
M	statterrain/src/types/facility.ts
M	statterrain/tests/smoke.spec.ts
```

## 5. Implementation summary

- Facility detail standardization: selected facilities now show Facility identity, Capability summary, Contact and access information, Source and data quality, and Known limitations.
- Missing-data language: important unavailable fields render explicit language such as `Not available in current source` or `Not verified in current source`; missing public data is not presented as absence of capability.
- Synthetic-data labeling: source/data-quality information visibly states `Synthetic demonstration data — not a real-world source.`
- Facility category definitions: hospitals, critical access hospitals, pharmacies, dialysis centers, skilled nursing facilities, and behavioral-health facilities have plain-language meaning, planning relevance, and known limitation copy.
- Hospital capability definitions: glossary framework covers emergency department, critical access hospital, trauma, stroke subtypes, STEMI/PCI, pediatric, behavioral-health, and dialysis-related capabilities.
- Source/learn-more link handling: existing source URLs are surfaced; missing source links show unavailable language.
- v0.1.3 evidence brief preservation: evidence brief tests continue to verify geography-based default scope and export formats independent of display filters.

## 6. Tests

- Tests modified: `statterrain/tests/smoke.spec.ts`.
- Coverage added: selected facility detail standardized sections, synthetic status, unavailable data language, category explanation access, and hospital capability glossary access.
- Existing coverage preserved: app load, display filters, evidence brief scope statement, map-filter independence, Markdown/JSON/CSV exports, and mobile/tablet usability.

## 7. Commands run

```bash
git checkout -b v0.1.4-facility-detail-capability-definitions
cd statterrain
npm run typecheck
npm ci
npm run lint && npm run typecheck && npm run build
npx playwright install chromium && npm run test:e2e
npm run test:e2e
git diff --check
git status --short
git diff --name-status
```

## 8. Verification results

- `npm ci`: Passed.
- `npm run lint`: Passed.
- `npm run typecheck`: Passed.
- `npm run build`: Passed.
- `npx playwright install chromium`: Failed due environment/network restriction: CDN returned HTTP 403 Forbidden for Chromium download.
- `npm run test:e2e`: Failed because Playwright Chromium executable was unavailable after the failed browser installation.
- `git diff --check`: Passed.
- GitHub Actions result: Not available in this environment.
- Vercel preview result: Not available in this environment.

## 9. Known limitations

- Still synthetic data.
- No real CMS data yet.
- No Census/CDC/SAMHSA data yet.
- No real specialty capability data.
- No real jurisdiction layer.
- No live routing/diversion/bed status.
- No clinical decision support.

## 10. Scope control

Confirmed no CMS data, Census data, CDC data, SAMHSA data, backend, database, authentication, AI API, PHI, live routing, clinical decision support, or Replit runtime dependency was added.

## 11. Rollback

To roll back this patch, revert the final commit on this branch or reset the branch to starting commit `a0cddd7`, then redeploy from the prior known-good branch if needed.

## 12. Recommended next patch

Recommend: v0.1.5 — Population Metric Definitions, Data Freshness, and Feedback Button.

Do not implement v0.1.5 as part of this patch.
