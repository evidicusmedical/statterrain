# HANDOFF — StatTerrain v0.3.1 Source-Backed Taxonomy and Data-Delivery Policy

## 1. Patch identification
- Version: v0.3.1 prototype
- Branch: v0.3.1-source-backed-taxonomy-data-delivery-policy
- Commit: pending at handoff creation

## 2. Objective
Create a source-backed facility taxonomy, remove unsupported active UI expectations, and add permanent policies requiring future national data releases to deliver completed generated datasets rather than scaffolding alone.

## 3. Scope completed
- Updated centralized product version.
- Added central facility taxonomy and capability readiness status.
- Limited primary filters to source-backed hospital category and isolated synthetic demo categories.
- Hid unsupported hospital capability filters from primary controls.
- Added source-scope and unavailable-category language to exports.
- Updated manifests with taxonomy readiness metadata.
- Added national data release checklist template and permanent policies.

## 4. Files changed
See git diff for the authoritative list. Major areas include product config, facility taxonomy config, filter UI, facility details, evidence export, manifests, documentation, tests, and this handoff.

## 5. Implementation summary
The patch introduces `src/config/facilityTaxonomy.ts` as the central source of truth for v0.3.1 facility/category and capability readiness. UI filters now derive source-backed and synthetic-only categories from taxonomy instead of exposing every historical demo type as a normal active control.

## 6. Taxonomy decisions
- Hospital: source-backed-now through CMS Hospital General Information baseline fields; bounded preview only.
- Critical access: source-mapping-needed and synthetic-only until a reliable current source mapping is verified.
- Dialysis: future-source-needed; fixture-only and not map-ready, synthetic-only outside real public-data controls.
- Nursing home/SNF: future-source-needed and docs-only.
- Behavioral health: future-source-needed and docs-only.
- Pharmacy: future-source-needed and docs-only.
- Hospital capabilities: hidden/synthetic-only pending validated public source mappings.

## 7. Policies added
- Data-Bearing Release Policy.
- Source-Backed UI Policy.
- National data release completion checklist and PR-ready template.

## 8. Tests
Static Playwright registry tests were expanded to cover taxonomy, version guardrails, hidden unsupported filters, export scope language, manifest readiness metadata, policies, and prohibited field safeguards.

## 9. Commands run
Commands and final results are recorded in the final report and PR body.

## 10. Verification results
Expected verification includes lint, typecheck, build, source validations, benchmark validation, CMS hospital validation, CMS dialysis validation, geocoding comparison/chunk planning, public-data registry e2e, and smoke e2e if Chromium is available.

## 11. Known limitations
- No national CMS hospital pull was run.
- No live geocoding was run.
- CMS hospital preview remains a bounded five-record sample.
- CMS dialysis remains fixture-only and not map-ready.
- Default map remains synthetic.
- No Vercel preview URL is available from this local environment unless supplied by hosting automation.

## 12. Scope control
No backend, database, authentication, AI API, PHI, patient-level records, claims records, patient address storage, route calculation, drive-time, ETA, traffic, isochrones, live diversion, live bed availability, dispatch recommendation, triage recommendation, transfer recommendation, medical-control guidance, clinical decision support, national CMS hospital pull, CMS dialysis real pull, live facility geocoding, scheduled refresh, automatic merge, or v0.3.2 implementation was added.

## 13. Rollback
Revert the commit `ui: enforce source-backed taxonomy and data delivery policy` to restore v0.3.0.2 taxonomy/filter/export/policy state.

## 14. Recommended next patch
v0.3.2 — Complete National CMS Hospital Network Build
