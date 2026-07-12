# StatTerrain v0.3.5 — Unified Planning Location, Radius Control, Adaptive Layers, and Evidence Contract Handoff

## 1. Patch identification
Branch: `v0.3.5-unified-planning-location-radius-evidence-contract`. Product version: `v0.3.5 prototype`.

## 2. Completion declaration
PARTIAL — CORE CONTRACT COMPLETE, INTERACTION VERIFICATION PENDING

## 3. Research alignment
The patch establishes the permanent workflow: define a planning point, define a radius, load CMS hospitals within radius-relevant partitions, filter with Haversine distance, show only source-backed active layers, and export a reproducible evidence schema.

## 4. Search root cause
The broken typed-search workflow came from duplicate location state and update paths. Search completion set `selectedLocation` and `location` separately in the page, while map click independently created a manual coordinate result and also set both states. Partition selection and filtering depended on `location`, metadata depended on `selectedLocation`, and no single canonical setter guaranteed ordering, coordinate validation, marker update, recenter, selected-facility clearing, and radius analysis. Dynamic Leaflet recentering itself was present; the failure was state split/order and duplicated search vs map-click paths, not timing. No arbitrary delay was added.

## 5. PlanningLocation contract
Added canonical `PlanningLocation` with latitude, longitude, displayLabel, inputMethod, resolvedAt, optional searchQuery, and optional state. Search and map-click locations carry this model and call `setPlanningLocation`.

## 6. Search behavior
Supported typed searches remain street address, city/state, ZIP, and latitude/longitude pairs. Invalid coordinates return a clear error and never fall back to a default point.

## 7. Map-click parity
Map clicks build a `PlanningLocation` with `inputMethod: map-click` and use the same setter as typed search. Search/map-click parity differs only in input method, label, and query metadata.

## 8. Radius control
Radius has one canonical value in miles. Slider, text input, and 10/25/50/100-mile buttons update that value. Text input preserves partial typing; invalid commits restore the previous valid value with an inline error. Bounds are 1–250 miles.

## 9. Radius synchronization
Radius changes update radius boundary, CMS partition selection, Haversine filtering, selected-facility validity through filtered lists, summary, and evidence context.

## 10. Adaptive layer registry
Added a source-backed research-layer registry. Only `cms-hospitals` is active/available in v0.3.5.

## 11. GUI/GX changes
Normal UI is organized around Define/Explore/Export semantics through search, selected planning marker, radius controls, active CMS layer control, map, summary, facility detail, and Evidence Brief actions. Population and unsupported capability controls are hidden from normal controls.

## 12. Evidence contract
Evidence generation is modular and retains source, release/retrieval metadata, methods, freshness, completeness, limitations, and unavailable inactive sections.

## 13. Evidence schema
JSON export now uses `statterrain-evidence-v1` with research area, canonical planning location, radius, active layers, summary, facilities, null population/accessibility/resilience, sources, methods, limitations, freshness, completeness, and export manifest.

## 14. CMS evidence content
CMS facility exports retain facility ID, name, address, city/state/ZIP, county when available, coordinates, distance, hospital type, ownership, emergency services, critical-access fields, phone when present, source metadata, provenance, and missing-field status. Website remains unavailable unless source-backed.

## 15. Performance
Search does not load national facility data directly. CMS loading remains partition-aware through radius-intersecting partition selection; loaded partition caching behavior remains in the existing loader. Map movement alone does not rerun analysis unless it changes the planning point.

## 16. Error states
Clear states exist for no planning location, search in progress, no results, invalid coordinates, geocoder failures, no hospitals within radius, invalid radius, temporary radius text input, and CMS partition load failures.

## 17. Files changed
Core changes include product config, planning-location type, search geocoder, app state, page wiring, radius controls, layer registry, evidence export, docs, focused tests, and this handoff.

## 18. Tests
Focused static tests were added for planning location, radius control, research layer registry, and evidence contract. Public registry and standard checks were run or attempted as recorded below.

## 19. Commands
See PR body and final response for exact command outcomes.

## 20. Known limitations
Full live browser interaction verification may depend on Chromium availability. Population, accessibility, redundancy, resilience, and AHA capability layers remain unavailable.

## 21. Scope control
No ACS, RUCA, SVI, PLACES, AHA, OSM, CMS dialysis activation, routing, drive-time, live status, dispatch, clinical guidance, backend, auth, AI APIs, or patient-level data were added.

## 22. Rollback
Revert the v0.3.5 commit. No generated CMS artifacts or national data downloads are required to roll back.

## 23. Next patch
v0.3.6 — National ACS County Population Baseline. Do not implement in this patch.
