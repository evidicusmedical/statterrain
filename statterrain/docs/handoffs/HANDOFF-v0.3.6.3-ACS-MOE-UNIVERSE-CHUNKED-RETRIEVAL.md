# StatTerrain v0.3.6.3 ACS MOE, Universe, and Chunked Retrieval Handoff

Completion declaration: PARTIAL — ACS VALIDATOR AND RETRIEVAL FIXED, LIVE VERIFICATION PENDING

## Summary

This patch separates ACS estimate metadata validation from live E/M queryability validation. It corrects the v0.3.6.3 diagnostics where 100 configured variables were checked and all 100 were rejected because M variables were treated as required variables.json entries, table universe validation searched concept/title text, and limited-English labels used an outdated phrase.

## Corrections

- ACS-META-001 is now limited to missing required estimate metadata.
- ACS-META-004 is reserved for live E/M query or response-header failures.
- Metadata reports include metadataEstimateExists, metadataMoeListed, liveEstimateQueryable, liveMoeQueryable, livePairQueryable, liveProbeResponseHeaderStatus, and pairValidationMethod.
- Universe validation uses a pinned table contract for B01003, B01001, B17001, B27010, B08201, B18101, and C16002.
- Limited-English semantic validation accepts "Limited English speaking household" while retaining the explanatory phrase as documentation only.
- ACS retrieval uses deterministic variable chunks and merges county rows by state+county GEOID before normalization.
- Live data calls require CENSUS_API_KEY and avoid printing keyed URLs.

## Verification status

Fixture validation has been added for metadata, E/M queryability, chunking, county chunk merge, and secret-safety behavior. Live verification remains pending until a real CENSUS_API_KEY run validates metadata, verifies E/M queryability, and completes a selected-state build for DC,MI,PR or MI,OH,PR.

## Required next gates

1. Metadata validation: `npm run data:validate-acs-variable-metadata -- --release 2024`
2. E/M queryability: `npm run data:verify-acs-estimate-moe-queryability -- --release 2024`
3. Selected-state build: `npm run data:pull-acs-county-population -- --selected-states --states MI,OH,PR --release 2024 --force`
4. Artifact validation: `npm run data:validate-acs-county-population -- --output-root <selected-state-output>`

Do not run or declare a national build until all selected-state gates pass with zero failed variables, zero failed pairs, PASS chunk merge reconciliation, and PASS artifact validation.

Next patch remains: v0.3.7 — County Population Visualization, Evidence Integration, and Research Workspace Simplification.
