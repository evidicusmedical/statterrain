# HANDOFF v0.3.5.2 — Complete City/State and ZIP Search and Census Readiness

## 1. Patch identification
StatTerrain v0.3.5.2 updates the planning-location search contract before ACS population ingestion. Branch: `v0.3.5.2-complete-city-state-zip-search-census-readiness`. Version: `v0.3.5.2 prototype`.

## 2. Completion declaration
PARTIAL — SEARCH MODES IMPLEMENTED, DEPLOYED VERIFICATION PENDING

## 3. Research alignment
The patch preserves source-backed planning workflows and does not introduce clinical decision support, routing, demographics, ACS records, AHA, OSM, RUCA, SVI, CDC PLACES, or v0.3.6 implementation.

## 4. Deployed v0.3.5.1 verification
Baseline accepted from manual verification: full address and coordinate searches passed; invalid coordinates were rejected; city/state and ZIP-only searches failed.

## 5. Remaining regression
The regression matrix is recorded in `statterrain/data/reports/place-zip-search-regression-v0.3.5.2.json` for address, city/state, ZIP, coordinates, invalid coordinates, and ambiguous place input.

## 6. Actual root causes
City/state and ZIP failures were not assumed from the earlier CORS repair. The v0.3.5.1 same-origin route sent every non-coordinate query to the Census street-address `locations/onelineaddress` endpoint and normalized only `result.addressMatches`. `Washington, DC` and `20500` require place or ZIP/ZCTA geography resolution; the route never requested those geography families and assumed address matches for all strategies.

## 7. Search strategy classifier
A pure classifier now returns `coordinates`, `invalid-coordinates`, `street-address`, `city-state`, `zip`, or `unsupported`. It classifies ZIP before street address, recognizes state abbreviations and full state names, and leaves city-only input unsupported with the message “Include a state with the city name.”

## 8. Street-address search
Street-address search remains on the official U.S. Census Geocoder `locations/onelineaddress` service with a bounded timeout, no-store responses, normalized coordinates, label, state, ZIP, source, and address geography metadata.

## 9. City/state search
City/state search dispatches server-side to official U.S. Census Bureau TIGERweb place geography queries. It returns a representative place point, state code, geography ID when provided, and a limitation explaining that the point is not a street address.

## 10. ZIP search
ZIP and ZIP+4 normalize to five-digit ZIP and dispatch server-side to official Census TIGERweb ZIP/ZCTA geography queries. Results carry ZIP/ZCTA metadata and area-derived representative-point limitations.

## 11. Coordinate search
Coordinate search remains local in the browser/client helper and does not call `/api/geocode`. Valid coordinates create the canonical PlanningLocation transaction.

## 12. Invalid-coordinate behavior
Out-of-range coordinate-like input such as `999, 999` returns `Invalid coordinates`, sends no network request, and preserves the prior valid planning location.

## 13. Ambiguous-place behavior
City-only input such as `Springfield` is unsupported and shows `Include a state with the city name.` No arbitrary city is selected.

## 14. Same-origin route
The browser-facing contract remains GET `/api/geocode?q=<encoded query>`. The route validates input length, uses fixed official upstream sources, applies a timeout, disables caching, and returns normalized payloads only.

## 15. Official Census sources
Sources used: U.S. Census Geocoder for full addresses; U.S. Census Bureau TIGERweb Places service for city/state; U.S. Census Bureau TIGERweb ZIP/ZCTA service for ZIP searches.

## 16. Representative-point semantics
City/state points represent selected Census place geographies. ZIP points represent ZIP/ZCTA area-derived reference points. Neither is presented as an exact street address.

## 17. PlanningLocation metadata
PlanningLocation now supports optional `searchStrategy`, `resolvedGeographyType`, `resolvedGeographyId`, `zip`, `source`, and `limitations` while preserving required coordinates, label, input method, resolved timestamp, query, and state.

## 18. Map and marker result
All successful search modes update the canonical PlanningLocation, recenter the map through app location state, and display the planning marker. Browser tests assert marker behavior with mocked same-origin route responses.

## 19. CMS radius-analysis result
The existing partition selector and radius filter continue to use the canonical planning location coordinates, state, query, and radius. No CMS generated artifacts were intentionally changed.

## 20. Evidence Brief update
Evidence Markdown and JSON include the enriched PlanningLocation metadata, including strategy, geography type, geography identifier, state, ZIP, coordinates, source, and limitations. Population remains unavailable.

## 21. Census API secret readiness
`docs/CENSUS_API_ACCESS.md` documents that `CENSUS_API_KEY` exists as a GitHub Actions repository secret for a future ACS national build workflow. It is not used by geocoding, not exposed to browser code, not prefixed with `NEXT_PUBLIC_`, and not committed.

## 22. Browser verification
Local mocked Playwright search-functional coverage was added for address, city/state, ZIP, coordinates, invalid coordinates, and ambiguous place behavior. Full deployed browser verification is pending.

## 23. Deployed preview verification
Pending. No Vercel preview URL was available in the local execution environment, so this handoff does not claim COMPLETE.

## 24. Files changed
Core route, classifier, search client, PlanningLocation types, Evidence Brief export, functional/unit tests, docs, CI workflow, gitignore, regression report, and version guards changed.

## 25. Tests
Executed focused classifier, city/state, ZIP, census-secret-safety, lint, typecheck, build, geocode-route, search-regression, planning-location, and evidence-contract tests locally. Broader required data and Playwright commands should be completed in CI/preview environment.

## 26. Known limitations
TIGERweb representative points are not exact addresses. ZIP/ZCTA geographies do not always equal USPS delivery ZIPs. Deployed Vercel preview verification and GitHub Actions browser verification remain pending.

## 27. Scope control
No ACS population data, AHA, OSM, RUCA, SVI, CDC PLACES, county demographics, routing, drive-time, AI APIs, authentication, PHI, or v0.3.6 code was added.

## 28. Rollback
Rollback by reverting the route/classifier/search metadata changes, version bump, tests, docs, and report. The prior v0.3.5.1 address/coordinate behavior can be restored by reverting this patch.

## 29. Next patch
v0.3.6 — National ACS County Population Baseline. That patch may consume `${{ secrets.CENSUS_API_KEY }}` in GitHub Actions and produce reviewed static ACS artifacts; it must not query Census Data API from normal browsers.
