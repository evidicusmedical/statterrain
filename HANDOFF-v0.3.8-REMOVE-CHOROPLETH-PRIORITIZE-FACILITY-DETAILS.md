# StatTerrain v0.3.8 — Remove Choropleth and Prioritize Facility Details

Completion declaration: COMPLETE — COUNTY OVERLAY SIMPLIFIED AND FACILITY DETAILS PRIORITIZED

## Summary
- Removed the user-facing county choropleth capability because whole-county ACS estimates could imply spatial precision and within-county variation that the data do not support.
- Retained geography-only county boundary outlines, including containing-county and radius-intersecting county roles.
- Updated the visible Census ACS source link to the official Census ACS program page while preserving technical ACS dataset/API identifiers in Evidence metadata.
- Replaced the Area Summary with Facility Details in the same right-side panel whenever a facility is selected.
- Preserved summary restoration by tracking persistent `summaryPreference` separately from temporary facility-detail replacement.
- Removed the unsupported-capability explanatory paragraph from public facility detail UI while preserving guardrails in Evidence/source-scope language.
- Removed display-derived choropleth/export metadata and retained raw ACS county records, metrics, roles, GEOIDs, boundary source, and limitation language.
- Updated visible product version to `v0.3.8 prototype`.

## Verification
- Required npm, lint, typecheck, build, ACS, CMS, planning, radius, evidence, workspace, search, footer, and facility-contact commands were run.
- New county-overlay removal and facility-panel replacement tests were added and run.
- Playwright coverage was attempted; browser verification status is recorded in the PR and final response.

## Notes
- CMS, ACS, and county boundary generated datasets were not rebuilt.
- No tract, block-group, benchmark, live routing, unsupported capability inference, Census browser API call, or second persistent panel column was added.
