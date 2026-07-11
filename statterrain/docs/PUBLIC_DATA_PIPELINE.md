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
