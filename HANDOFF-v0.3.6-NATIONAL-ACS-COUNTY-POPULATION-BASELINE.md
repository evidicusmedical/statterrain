# HANDOFF v0.3.6 — National ACS County Population Baseline

## 1. Patch identification
Branch: `v0.3.6-national-acs-county-population-baseline`. Version: `v0.3.6 prototype`.

## 2. Completion declaration
PARTIAL — ACS PIPELINE COMPLETE, NATIONAL GENERATED DATA PENDING

## 3. Research alignment
StatTerrain is framed as a National Emergency-Care Capability, Access, and Resilience Research Platform supporting Availability, Accessibility, and Resilience.

## 4. Objective
Build the implementation foundation for a real ACS county population baseline without activating demographic UI layers in v0.3.6.

## 5. Existing CMS and search baseline
CMS Hospital General Information remains the active national hospital identity and facility-location backbone. Existing search modes and radius workflows remain unchanged.

## 6. ACS source
United States Census Bureau American Community Survey 5-Year Estimates.

## 7. Release and estimate period
ACS 2024 release, 2020-2024 estimate period.

## 8. API credential handling
`CENSUS_API_KEY` is consumed only by server-side GitHub Actions and local real-mode scripts. Fixture mode requires no key. The key is not logged or committed.

## 9. Metric registry
The registry is `scripts/public-data/acs-county-metric-registry.mjs`; shared inactive app metadata is in `src/config/populationMetricRegistry.ts`.

## 10. Variable metadata validation
`npm run data:validate-acs-variable-metadata` validates configured variables against Census metadata in real mode and writes `data/reports/acs-county-variable-validation-v0.3.6.json`.

## 11. Metric definitions
Eight metrics are registered: total population; under 18; age 65+; poverty; uninsured; no-vehicle households; disability; limited-English-speaking households.

## 12. Universe definitions
Each metric records its ACS universe, numerator variables, denominator variables, and unit semantics.

## 13. Margin-of-error methodology
Direct MOEs are retained. Summed estimates use square-root-of-sum-of-squares combined MOE.

## 14. Missing and suppressed semantics
Central parsing classifies available, zero-reported, missing, suppressed, not-applicable, invalid-source-value, denominator-zero, and calculation-failed. Missing/suppressed/sentinel values are not zero.

## 15. Extraction strategy
The client retrieves counties state by state through the ACS API using one statewide county query per state.

## 16. Resume and retry behavior
`--resume` skips valid completed partitions; transient API failures retry with bounded backoff.

## 17. Normalized schema
Records use schema version `acs-county-population-v0.3.6` with source metadata, inactive flags, metrics, estimates, MOEs, numerators, denominators, percentages, statuses, and source variables.

## 18. Generated artifact structure
Generated artifacts are under `data/generated/acs-county-population-national/` with manifest, summary, metric registry, and state partitions.

## 19. National manifest
The manifest records source, release, estimate period, partitions, checksums, completeness, validation state, and inactive UI flags.

## 20. Completeness report
The build writes `data/reports/acs-county-population-completeness-v0.3.6.json`; documentation is in `docs/ACS_COUNTY_POPULATION_COMPLETENESS.md`.

## 21. Validation
`npm run data:validate-acs-county-population` checks schema, checksums, counts, GEOIDs, statuses, source metadata, inactive flags, and secret-safety patterns.

## 22. Workflow
`.github/workflows/acs-county-population-national-build.yml` is a manual-only workflow using Node 24 and `CENSUS_API_KEY`.

## 23. Implementation PR
Implementation PR should be opened from this branch after commit.

## 24. Generated-data branch and PR
Generated data branch remains pending until implementation merges: `v0.3.6-acs-county-population-generated-data`.

## 25. Actual national results
National results are pending GitHub Actions. Fixture output contains 4 county/county-equivalent records across MI, OH, and PR for test coverage only.

## 26. UI activation status
Inactive. `safeToDisplay` is false and visualization activation is pending v0.3.7.

## 27. Evidence Brief status
Population remains unavailable. v0.3.7 must add ACS release, estimate period, selected county records, metric values, MOEs, numerators, denominators, variable IDs, inclusion method, missingness, limitations, and raw record export.

## 28. Files changed
Version, source registry, ACS scripts, workflow, tests, docs, generated fixture artifacts, reports, and handoff files.

## 29. Tests
Focused ACS fixture, registry, metadata, parser, normalization, validation, and secret-safety tests were added.

## 30. Commands
See final report for exact executed commands and results.

## 31. Performance
Fixture generation completes in under a few seconds locally. National runtime depends on Census API latency and GitHub Actions environment.

## 32. Known limitations
National generated artifacts are pending. Fixture data must not be interpreted as completion.

## 33. Scope control
No demographic map controls, AHA, OSM, RUCA, SVI, PLACES, patient-level, claims, PHI, routing, live operations, or v0.3.7 implementation was added.

## 34. Rollback
Revert the implementation commit and remove generated ACS fixture/report artifacts if necessary.

## 35. Next patch
v0.3.7 — County Population Visualization and Evidence Integration. Do not implement v0.3.7 in this patch.
