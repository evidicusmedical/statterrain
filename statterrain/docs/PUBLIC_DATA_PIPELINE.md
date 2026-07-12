# StatTerrain v0.3.0 national public-data scaling foundation

StatTerrain v0.3.0 adds a national-scale public-data coverage model while keeping the default product a frontend prototype with synthetic demonstration map data.

## Current source status

- CMS Hospital General Information: real public data, bounded 5-record preview sample only, 5 geocoded/map-ready/preview-eligible records, not national coverage, not used in the default map.
- CMS Dialysis Facility pilot: synthetic test fixture only, 3 records, not geocoded, not geography-joined, not map-ready, and not preview-ready.
- Synthetic demo: local demonstration data only; not real public data and not national coverage.

## Generated artifacts

- `data/generated/source-coverage-manifest.json` summarizes readiness, coverage, map readiness, preview eligibility, limitations, prohibited uses, and next required step per source.
- `data/generated/artifact-manifest.json` inventories generated artifacts, validation state, checksums, and display/readiness flags.
- `data/generated/geocoding-cache/` contains the v0.3.0 cache schema and an intentionally empty cache scaffold.

## Scaling workflow

Future national refreshes should use static generated artifacts, PR-based review, last-known-good fallback, deterministic validation, changed-address detection, and chunked geocoding. Do not repeatedly full-geocode every run. The v0.3.0 scripts only write planning reports and make no network calls.

- `npm run data:compare-addresses-for-geocoding` writes `data/reports/address-geocoding-delta-v0.3.0.json`.
- `npm run data:create-geocoding-chunks` writes `data/reports/geocoding-chunk-plan-v0.3.0.json`.

## Safety boundaries

No backend, database, authentication, PHI, patient-level data, claims data, live routing, drive-time calculation, travel-time estimate, ETA, real-time traffic, live diversion, bed status, dispatch recommendations, triage recommendations, transfer recommendations, medical-control guidance, or clinical decision support is included. User-entered search locations remain session-only and are not stored.

## Next patch

Recommended next patch: v0.3.1 — CMS Hospital National Pull Expansion. It should expand CMS Hospital General Information into a full national normalized artifact using the v0.3.0 manifest/scaling foundation without geocoding everything at once and without turning real data on by default.

## v0.3.4 CMS facility identity field audit

The v0.3.4 CMS facility identity audit documents source-backed CMS Hospital General Information fields and forbids inferred contact or capability values. Phone uses the CMS `telephone_number` column, is stored as source text, and only creates a `tel:` link when digits/extensions can be parsed safely. Website URL is unavailable in the current CMS source mapping; the UI and export code keep safe-link support for future source-backed enrichment but never constructs URLs from facility names or external searches.

Identity-refresh mode is the expected generated-data workflow when only identity/contact fields change. It must reuse the current geocoding cache, rebuild normalized records and compact partitions, validate the national artifacts, run `npm run data:audit-cms-hospital-fields`, commit generated data to a review branch, and never auto-merge. Missing values mean “Not reported in this source” where important; absent website means “Website URL is not provided by the current CMS Hospital General Information source mapping.” No patient-level data, claims data, PHI, live capacity, routing, OSM ingestion, population ingestion, or v0.3.5 work is included.

## v0.3.4.2 CMS identity-refresh cache and metric contract

Identity refresh is cache-first maintenance. It loads `data/generated/geocoding-cache/cms-hospitals-geocoding-cache.json`, keys reusable entries by `sourceFacilityId::addressHash`, and treats the normalized address hash as authoritative for legacy cache rows whose input checksum included a run timestamp. `build_mode=identity-refresh` takes precedence over geocoding mode and does not silently fall back to a full national geocode unless an explicit workflow fallback is enabled.

Metrics are split into source, eligibility, cache, current-run request, final record-state, and final artifact groups. Current-run request metrics count only records submitted in the current run. Final geocoding metrics are derived by one reducer that assigns each CMS `sourceFacilityId` exactly one state: matched, no-match, multiple-match, failed, or invalid-input. Historical chunk files and duplicate cache entries are not summed into final matched/unmatched totals.

Validation writes `data/reports/cms-hospital-metric-validation-v0.3.4.2.json` and enforces reconciliation rules for final-state totals, matched-vs-eligible, cache hits/misses, request workset bounds, identity-refresh full-regeocode refusal, chunks, and map-ready/excluded totals. The dry-run audit command is `npm run data:audit-cms-identity-refresh`; it does not call CMS or Census, does not rewrite partitions, and writes `data/reports/cms-identity-refresh-audit-v0.3.4.2.json`.

The previous workflow figures of 9,161 matched and 1,687 unmatched were invalid because they mixed cache-history/chunk-history entries with current final record state. The current deployed baseline remains 5,432 normalized records, 4,669 map-ready records, 763 excluded records, 52 partitions, and phone values in all 4,669 partition records; websites remain absent unless source-backed.

## v0.3.5 unified planning location, radius, layers, and evidence contract

StatTerrain v0.3.5 establishes search/map-click parity through one canonical planning-location state and one canonical analysis-radius value. Supported typed search forms are U.S. street address, city/state, ZIP code, and latitude/longitude pairs; unsupported county, landmark, hospital-name, AHA capability, and population/demographic controls remain hidden. Slider, numeric radius input, and 10/25/50/100-mile buttons update the same 1–250 mile radius and rerun the same radius-bounded CMS hospital partition selection and Haversine filtering.

The active research-layer registry contains only CMS hospitals for this patch. Future ACS population, rurality, vulnerability, community-health, accessibility, resilience, and licensed capability work must register source-backed layers and update both the visual interface and Evidence Brief. Evidence exports now use `statterrain-evidence-v1` with source, release, retrieval date, methods, freshness, completeness, limitations, unavailable-section markers, and CMS facility provenance. No ACS, RUCA, SVI, PLACES, AHA, OSM, routing, live-status, dispatch, clinical, or patient-specific functionality is introduced.
