# StatTerrain v0.3.5.1 — Restore Functional Search and Browser Verification

## 1. Patch identification
Branch: `v0.3.5.1-restore-functional-search-browser-verification`. Version: `v0.3.5.1 prototype`.

## 2. Completion declaration
PARTIAL — SEARCH FIX IMPLEMENTED, DEPLOYED BROWSER VERIFICATION PENDING. Local browser verification was blocked because no Chromium/Chrome executable existed and Playwright/apt downloads returned HTTP 403.

## 3. Regression impact
Typed address/place/ZIP search used a direct browser request to the U.S. Census geocoder, so production success depended on browser external-network/CORS/upstream response behavior instead of a stable same-origin contract.

## 4. Reproduction
A machine-readable report is in `statterrain/data/reports/search-regression-v0.3.5.1.json`. The local repository had no `origin` or `main` ref, so reproduction was against the available pre-edit worktree.

## 5. Actual root cause
The address search path invoked `https://geocoding.geo.census.gov/...` directly from browser code and parsed raw Census response shape in UI-facing code. The form submit handler existed and called preventDefault, but address searches could fail before state updates if the external browser fetch failed or returned an unexpected shape.

## 6. Search form behavior
The search form now has stable test IDs, a visible status region, a submit button, and keeps query text on failure. Enter and button submit share the same handler.

## 7. Coordinate search
Coordinate parsing is separated into a pure helper. Valid comma and whitespace coordinate pairs construct a PlanningLocation locally without any network call. Out-of-range coordinate-like input returns `Invalid coordinates` before fetch.

## 8. Address/place/ZIP search
Address/place/ZIP searches call `/api/geocode?q=<encoded query>` and consume normalized matches only.

## 9. Same-origin geocode route
Added `src/app/api/geocode/route.ts`. It is GET-only, validates length/blank input, uses a fixed Census endpoint, applies an AbortController timeout, disables caching, and returns normalized fields only.

## 10. PlanningLocation transaction
Successful search still uses the canonical `setPlanningLocation(planningLocation, selectedLocation)` transaction, updating location metadata and clearing selected facility.

## 11. Map and marker result
Map recentering is driven by the app location created from PlanningLocation. The planning marker has a stable marker class for browser assertions and the selected planning location badge has a stable test ID.

## 12. CMS analysis result
CMS partition selection remains driven by the active app location plus PlanningLocation/selectedLocation state and radius. Facility results count has a stable test ID.

## 13. Radius result
Radius text input remains unchanged; the browser test asserts radius changes update the selected planning location badge.

## 14. Evidence result
Evidence Brief wiring remains unchanged and continues receiving PlanningLocation, radius, facilities in radius, public data summary, source, methods, freshness, and limitations.

## 15. Browser test
Added `tests/search-functional.spec.ts` with same-origin `/api/geocode*` mocking only. Local execution was attempted but blocked by missing browser executable and 403 downloads.

## 16. Preview verification
Not performed in this environment. Required before merge on Vercel preview for: 1600 Pennsylvania Avenue NW, Washington, DC; Washington, DC; 20500; 38.8977, -77.0365; 38.8977 -77.0365; 999, 999; clearly invalid text.

## 17. Tests
Ran npm ci, lint, typecheck, build, new geocode/search tests, and attempted Playwright. Full data/test command set should be completed in CI/maintainer environment if local time/browser availability is insufficient.

## 18. Known limitations
No local/deployed browser success could be recorded due browser installation/network restrictions. Historical direct production behavior could not be tested against `origin/main` because no remote/main branch was configured.

## 19. Scope control
No ACS, population, RUCA, SVI, AHA, OSM, routing, clinical guidance, patient data, or v0.3.6 work was started.

## 20. Rollback
Revert this commit to restore v0.3.5 behavior. No data migrations are introduced.

## 21. Next patch
v0.3.6 — National ACS County Population Baseline, only after search is browser/deployed verified.
