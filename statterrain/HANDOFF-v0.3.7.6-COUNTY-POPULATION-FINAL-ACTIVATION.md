# StatTerrain v0.3.7.6 — County Population Final Activation Handoff

Status: PARTIAL — COUNTY POPULATION CONTEXT ACTIVATED, BROWSER VERIFICATION PENDING

## Implementation summary

- Activated whole-county ACS context behind national ACS and county-boundary guards.
- Resolves the containing county by boundary GEOID and joins ACS records by five-digit GEOID.
- Loads radius-intersecting state boundary partitions on demand and joins whole-county ACS records for intersecting county GEOIDs.
- Updates Area Summary terminology to Population context and avoids any radius-population claim.
- Adds county ACS records and limitations to Evidence Brief schema and Markdown.
- Adds downloadable county ACS CSV and JSON exports.
- Activates a county polygon choropleth for selected ACS metrics while preserving hospital markers, the planning marker, and radius.
- Fixes responsive header/search layout by keeping controls in normal flow, allowing wrapping, and using min-width: 0.
- Updates visible version to v0.3.7.6 prototype.

## Data status

- ACS manifest: national 2024 ACS 5-Year Estimates, 2020-2024, 52 state/territory partitions, 3222 county records.
- Boundary manifest: PASS national coverage, at least 52 partitions.

## Limitations

County ACS values are whole-county estimates. They are geographic context only and are not estimates of the population located inside the selected radius. Missing, suppressed, invalid, or unavailable ACS values remain non-zero status values and render as unavailable rather than zero.

## Browser verification

Automated Chromium/manual browser verification was not completed in this handoff. Non-browser checks should be rerun in the target environment.
