# StatTerrain v0.3.7 County Population Workspace Implementation Handoff

- Branch: v0.3.7-county-population-workspace-implementation
- Commit: df65d5277fca2166d0586ad46100a0f67b7660dc
- PR: StatTerrain v0.3.7 — Build County Population Workspace and Simplify Interface
- Version: v0.3.7 prototype
- Completion: PARTIAL — COUNTY POPULATION WORKSPACE BUILT, NATIONAL BOUNDARIES PENDING

## GUI changes
- Simplified summary column to Area Summary with planning area, facilities, demographics, and vulnerability rows.
- Removed visible Planning considerations from the workspace and moved methodological limitations into Evidence/export copy.
- Expanded search copy for address, city/state, ZIP, and coordinate workflows.
- Simplified left-column controls to Define area and Map layers.
- Replaced prototype/footer copy with compact Research prototype language.

## ACS runtime implementation
- Added strict manifest/county record TypeScript contracts.
- Added partition loading, in-memory partition caching, request de-duplication, stale-request protection, GEOID lookup, and summary helpers.
- Uses merged national ACS static artifacts only; browser code does not call Census API or expose CENSUS_API_KEY.

## Evidence implementation
- Upgraded JSON package schema to statterrain-evidence-v2.
- Added ACS county context fields, raw facility support, full metric metadata preservation, and the required whole-county limitation.
- Added County ACS CSV export builder that preserves unavailable, missing, suppressed, invalid, and zero-reported statuses.

## Geometry build pipeline
- Added official Census TIGER/Line county boundary source contract, pinned vintage support, manifest/checksum generation, validation helpers, and manual GitHub Actions workflow.
- National generated boundary partitions are reserved for PR 2 and excluded from this implementation PR.

## Fixture coverage
- Test-only fixtures cover one Michigan county, one Ohio county, District of Columbia, one Virginia independent city, and one Puerto Rico municipio.
- Fixtures are explicitly marked fixtureOnly and are not production coverage.

## National boundary data pending
- Reserved output paths remain uncommitted for national generated boundaries.
- Next branch after PR 1 merges: v0.3.7-county-boundaries-generated-data.

## Activation guard
- National county boundary runtime activation requires validationStatus PASS, coverageStatus national, and at least 52 partitions.
- Until then, normal users do not receive the national population layer from fixtures.

## Tests
- npm ci
- npm run lint
- npm run typecheck
- npm run build
- npm run data:validate-acs-county-population
- npm run test:acs-runtime-loader
- npm run test:acs-county-resolution
- npm run test:acs-radius-county-intersection
- npm run test:acs-summary-integration
- npm run test:acs-evidence-integration
- npm run test:acs-export
- npm run test:county-boundary-build
- npm run test:county-boundary-validation
- npm run test:workspace-simplification
- npm run test:search-layout
- npm run test:footer-simplification
- npx playwright test tests/public-data-registry.spec.ts
- git diff --check

## Diff size
- Updated before final PR creation from git diff --stat and --numstat.

## Excluded generated files
- No national county GeoJSON, TopoJSON, shapefiles, zipped boundary files, generated state boundary partitions, Census boundary downloads, node_modules, Playwright binaries, screenshots/videos, .next output, downloaded workflow artifacts, temp work data, or duplicate ACS national artifacts are included.

## Next workflow instructions
1. Merge PR 1 only after review.
2. Run the manual County Boundary National Build workflow on v0.3.7-county-boundaries-generated-data.
3. Open generated-data PR titled: data: build national county boundary partitions.
4. Do not auto-merge.
