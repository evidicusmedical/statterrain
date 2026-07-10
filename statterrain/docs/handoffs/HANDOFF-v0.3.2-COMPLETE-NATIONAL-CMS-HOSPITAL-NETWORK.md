# HANDOFF — StatTerrain v0.3.2 Complete National CMS Hospital Network Build

## 1. Patch identification
- Version target: v0.3.2 prototype
- Branch: v0.3.2-complete-national-cms-hospital-network
- Release classification: data-bearing national release

## 2. Release completion status
BLOCKED — NATIONAL BUILD INCOMPLETE. Local CMS access failed in this environment and GitHub CLI credentials/tools were unavailable, so the actual national CMS pull, geocoding execution, geography joins, validated partitions, and generated-data completion gate could not be satisfied.

## 3. Official source identification
- Dataset: CMS Hospital General Information
- Dataset identifier: xubh-q36u
- Landing/API endpoint used by the build script: https://data.cms.gov/provider-data/api/1/datastore/query/xubh-q36u/0?limit=50000
- Source retrieval date: not completed in local environment
- Source release/update date: not retrieved

## 4. Objective
Build a source-backed national CMS hospital network with actual official records, persistent geocoding cache, geography joins, validated map-ready partitions, app integration, documentation, and tests.

## 5. Scope completed
- Updated visible product version to v0.3.2 prototype.
- Added a complete local orchestration script for the national CMS build.
- Added package scripts for the required national build command names.
- Added a manual GitHub Actions fallback workflow that can run the national build from the feature branch and commit generated artifacts back to that branch.

## 6. Raw pull results
Local raw pull did not complete. `npm run data:build-national-cms-hospitals` failed while resolving `data.cms.gov` with `getaddrinfo EAI_AGAIN`. A direct curl probe also failed through the environment proxy with `CONNECT tunnel failed, response 403`.

## 7. Normalization and source-backed field mapping
Implemented in `scripts/public-data/build-national-cms-hospitals.mjs`, but not executed to completion locally due to CMS access failure.

## 8. Deduplication results
Not generated locally. The script deduplicates by official CMS facility/provider identifier and writes `data/reports/cms-hospitals-deduplication-v0.3.2.json` after a successful source pull.

## 9. Geocoding input results
Not generated locally. The script writes `data/generated/geocoding-inputs/cms-hospitals-national-geocoding-input-v0.3.2.json` after a successful source pull.

## 10. Cache population results
Not populated locally. The script writes `data/generated/geocoding-cache/cms-hospitals-geocoding-cache.json` using deterministic address hashes.

## 11. Chunk execution results
No chunks executed locally because the CMS pull was blocked before inputs could be generated. The fallback workflow is manual-only and can execute the chunks on the feature branch.

## 12. Geography join results
Not generated locally. The build script uses the Census geographies endpoint for state/county FIPS validation when network access is available.

## 13. QA and exclusion results
Not generated locally. The script writes national QA, state/territory distribution, unmatched, and excluded-record reports after successful execution.

## 14. National artifact and partition summary
Not generated locally. The script is designed to write `data/generated/cms-hospitals-national/manifest.json`, `summary.json`, state partitions, `excluded-records.json`, and `unmatched-records.json`.

## 15. Application integration
Visible version was updated. Full national layer integration remains blocked until actual generated artifacts exist.

## 16. Evidence/export integration
Not completed because actual national source counts and artifacts were not generated.

## 17. Refresh workflow
Added `.github/workflows/cms-hospital-national-build.yml` as a manual workflow dispatch fallback. It accepts a target branch, refuses main by job condition, runs the national build, validates, and commits generated artifacts to the supplied feature branch.

## 18. Files changed
See git diff for the exact file list.

## 19. Tests
Only the blocked national build attempt and network probes were run before stopping data completion. Full test suite was not claimed as passing.

## 20. Commands run
- `find /workspace -name AGENTS.md -print`
- `git status --short`
- `git branch --show-current`
- `git checkout -b v0.3.2-complete-national-cms-hospital-network`
- `npm run data:build-national-cms-hospitals`
- `curl -I --max-time 20 https://data.cms.gov/provider-data/api/1/datastore/query/xubh-q36u/0?limit=1`
- `gh auth status || true`

## 21. Verification results
The national build is blocked. Do not treat this branch as containing the complete national CMS hospital network until the workflow or another environment successfully executes the generated-data build and commits artifacts.

## 22. Known limitations
No national generated artifacts are committed in this blocked handoff. No actual CMS records, completed geocoding cache, geography joins, or map-ready partitions were created locally.

## 23. Scope control
No patient-level data, claims records, PHI, backend, database, authentication, routing, ETA, live bed status, diversion status, dispatch, triage, transfer guidance, clinical decision support, CMS dialysis real build, nursing-home/SNF ingestion, or v0.3.3 implementation was added.

## 24. Rollback
Revert the commit(s) on this branch or restore the prior v0.3.1 files. Do not run generated-data publication unless the official CMS and Census source operations complete successfully.

## 25. Recommended next patch
v0.3.3 — Hospital Network QA and National Activation Hardening

## 26. Completion declaration
BLOCKED — NATIONAL BUILD INCOMPLETE
