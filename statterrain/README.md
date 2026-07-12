# StatTerrain v0.3.0.1 map workspace declutter

StatTerrain v0.3.0.1 is a focused UI hotfix that declutters the map workspace while preserving the v0.3.0 public-data scaling foundation and default synthetic map behavior.

## Map workspace UI

- The public-data source/freshness panel is compact and collapsed by default so the map, search box, and radius controls remain the primary workspace.
- Compact mode keeps critical status visible: national public-data coverage is still in progress, CMS hospitals remain a bounded 5-record preview-ready sample, CMS dialysis remains fixture-only/not map-ready, and the optional CMS hospital preview state is visible.
- Full source, freshness, validation, geocoding, coverage-manifest, limitation, and prohibited-use details remain available from the explicit Details control and can be collapsed again.
- The summary toggle remains usable, but the prior persistent floating help copy has been removed so it does not collide with map/source panels.

## Public-data behavior

No public-data behavior changed in this patch. No new ingestion, CMS refresh, real dialysis fetch, live facility geocoding, or mass geocoding was run. The CMS hospital preview remains optional/off by default, CMS dialysis remains fixture-only/not map-ready, and generated public-data artifacts remain inactive for the default app.

## Safety boundaries

No backend, database, authentication, PHI, patient-level data, claims data, live routing, drive-time calculation, travel-time estimate, ETA, real-time traffic, live diversion, bed status, dispatch recommendations, triage recommendations, transfer recommendations, medical-control guidance, or clinical decision support is included. User-entered search locations remain session-only and are not stored.

## Testing notes

The v0.3.0.1 test gate asserts the centralized visible version label, compact/collapsed source panel source text, accessible expand/collapse state, summary-toggle artifact removal, existing address search contract, radius controls, coverage manifests, CMS hospital preview safety, CMS dialysis fixture safety, and synthetic default map behavior.

## Next patch

Recommended next patch: v0.3.1 — CMS Hospital National Pull Expansion. It should expand CMS Hospital General Information into a full national normalized artifact while keeping national records non-map-ready until chunked geocoding/geography joins are completed.

## v0.3.0.2 GUI/GX update

StatTerrain v0.3.0.2 makes the top search bar the primary planning-location search. It accepts U.S. addresses, ZIP codes, city/state queries, states, and latitude/longitude pairs such as `43.615, -116.202`; valid coordinates are handled session-only without calling the Census Geocoder. Users can also click the map background to set a session-only planning center and recenter the straight-line radius.

Searched and clicked locations are not stored, are not patient addresses, and do not enable routing, travel-time, ETA, diversion, bed-status, dispatch, triage, transfer, or clinical decision-support behavior. The default map remains synthetic demonstration data. Public-data source/freshness status is shown as a compact map note by default, with Details preserving source, provenance, limitations, and preview controls. No public-data ingestion, CMS refresh, or live facility geocoding behavior changed in this patch.


## v0.3.3.1 nationwide CMS partition resolution hotfix

StatTerrain resolves CMS hospital partitions by explicit selected-location state, deterministic local coordinate-to-state/territory resolution, Census structured state fields, and state abbreviation/full-name parsing. The prior arbitrary CA/DC/FL/IL/NY/TX fallback was removed. Candidate hospital partitions are selected from manifest-supported state/territory bounds intersecting the selected radius bounding box, with final Haversine filtering remaining authoritative.

User-visible coverage states now distinguish unresolved planning locations, partition load failures or partial coverage, and genuine zero-result radius searches after requested partitions loaded successfully. The bundled resolver metadata covers all 50 states, District of Columbia, and Puerto Rico represented by the national CMS hospital manifest. Border searches may load multiple intersecting partitions; excluded or unmatched CMS facilities remain limited to the existing map-ready national artifact.

## v0.3.4 CMS facility identity field audit

StatTerrain v0.3.4 audits CMS Hospital General Information identity/contact fields end-to-end. The active CMS source columns include `facility_id`, `facility_name`, `address`, `citytown`, `state`, `zip_code`, `countyparish`, `telephone_number`, `hospital_type`, `hospital_ownership`, and `emergency_services`. The current deployed artifacts contain 5,432 normalized records, 4,505 map-ready records, and 4,505 deployed partition records.

The audit found `telephone_number` present in all 5,432 raw CMS rows but missing from the current normalized and partition artifacts because the previous normalizer looked for `phone_number`. The builder now maps `telephone_number`; regenerated identity partitions are required through identity-refresh before the phone path is complete in deployed data. CMS Hospital General Information does not provide a website URL field in the active source mapping, so website rows remain hidden unless a future source-backed URL exists.

## v0.3.4.2 CMS identity-refresh cache and metric contract

Identity refresh is cache-first maintenance. It loads `data/generated/geocoding-cache/cms-hospitals-geocoding-cache.json`, keys reusable entries by `sourceFacilityId::addressHash`, and treats the normalized address hash as authoritative for legacy cache rows whose input checksum included a run timestamp. `build_mode=identity-refresh` takes precedence over geocoding mode and does not silently fall back to a full national geocode unless an explicit workflow fallback is enabled.

Metrics are split into source, eligibility, cache, current-run request, final record-state, and final artifact groups. Current-run request metrics count only records submitted in the current run. Final geocoding metrics are derived by one reducer that assigns each CMS `sourceFacilityId` exactly one state: matched, no-match, multiple-match, failed, or invalid-input. Historical chunk files and duplicate cache entries are not summed into final matched/unmatched totals.

Validation writes `data/reports/cms-hospital-metric-validation-v0.3.4.2.json` and enforces reconciliation rules for final-state totals, matched-vs-eligible, cache hits/misses, request workset bounds, identity-refresh full-regeocode refusal, chunks, and map-ready/excluded totals. The dry-run audit command is `npm run data:audit-cms-identity-refresh`; it does not call CMS or Census, does not rewrite partitions, and writes `data/reports/cms-identity-refresh-audit-v0.3.4.2.json`.

The previous workflow figures of 9,161 matched and 1,687 unmatched were invalid because they mixed cache-history/chunk-history entries with current final record state. The current deployed baseline remains 5,432 normalized records, 4,669 map-ready records, 763 excluded records, 52 partitions, and phone values in all 4,669 partition records; websites remain absent unless source-backed.

## v0.3.5 unified planning location, radius, layers, and evidence contract

StatTerrain v0.3.5 establishes search/map-click parity through one canonical planning-location state and one canonical analysis-radius value. Supported typed search forms are U.S. street address, city/state, ZIP code, and latitude/longitude pairs; unsupported county, landmark, hospital-name, AHA capability, and population/demographic controls remain hidden. Slider, numeric radius input, and 10/25/50/100-mile buttons update the same 1–250 mile radius and rerun the same radius-bounded CMS hospital partition selection and Haversine filtering.

The active research-layer registry contains only CMS hospitals for this patch. Future ACS population, rurality, vulnerability, community-health, accessibility, resilience, and licensed capability work must register source-backed layers and update both the visual interface and Evidence Brief. Evidence exports now use `statterrain-evidence-v1` with source, release, retrieval date, methods, freshness, completeness, limitations, unavailable-section markers, and CMS facility provenance. No ACS, RUCA, SVI, PLACES, AHA, OSM, routing, live-status, dispatch, clinical, or patient-specific functionality is introduced.

## v0.3.5.2 search contract and Census readiness

StatTerrain supports typed searches for full U.S. street addresses, city plus state, ZIP/ZIP+4, and latitude/longitude, plus map clicks. Browser code calls the stable same-origin `/api/geocode?q=<encoded query>` route for address, city/state, and ZIP searches; valid coordinates resolve locally without a network request. City searches require a state, so ambiguous input such as `Springfield` shows “Include a state with the city name.” ZIP results are ZIP/ZCTA representative points, not precise addresses. City/state results are Census place representative points, not street addresses. The Census Data API key remains a future GitHub Actions ingestion secret only; v0.3.5.2 does not ingest ACS population records.

## v0.3.6 national ACS county population baseline

StatTerrain v0.3.6 adds an inactive, validation-gated ACS 2024 5-Year county population baseline pipeline for the National Emergency-Care Capability, Access, and Resilience Research Platform. The source is the United States Census Bureau American Community Survey 5-Year Estimates, 2024 release, 2020-2024 estimate period. The eight registered county metrics are total population, under-18 population, age-65-and-older population, poverty population, uninsured population, no-vehicle households, civilian noninstitutionalized population with a disability, and limited-English-speaking households. Estimates and margins of error are retained; missing, suppressed, invalid, denominator-zero, and ACS sentinel values are not treated as zero.

The GitHub Actions workflow uses `CENSUS_API_KEY` only as a server-side repository secret. Browser code does not call the Census Data API, and ACS metrics remain `safeToDisplay: false`, unavailable to normal research-layer controls, and absent from Evidence Brief demographic values until v0.3.7. AHA capability work remains a separate future track; no AHA, OSM, RUCA, SVI, PLACES, patient-level, claims, PHI, live operational, routing, or clinical decision-support data is introduced.
