# StatTerrain Public Data Pipeline Data Area

v0.2.0 creates the public-data automation framework only. No real public data has been ingested, no generated public records are active, and the app remains in `synthetic-demo` mode.

Folders:

- `sources/` — planned source registry placeholders.
- `raw/` — future raw snapshots or raw snapshot metadata.
- `normalized/` — future normalized intermediate files.
- `generated/` — future app-ready generated JSON files, only after validation passes or last-known-good fallback is explicitly active.
- `reports/` — validation and refresh-readiness reports.
- `last-known-good/` — future fallback datasets retained when validation fails.

Safety rules: use official public sources where possible, preserve snapshot metadata, validate before display, never publish unvalidated data directly, surface retrieval/release dates and limitations, prohibit live routing/diversion/dispatch/bed/triage/transfer/medical-control/clinical decision support uses, and never accept PHI.

## v0.2.2 CMS hospital baseline pilot

v0.2.2 adds the first real public-data ingestion pilot for CMS Hospital General Information, the top hospital source identified in the v0.2.1 benchmark. The pull script reads the benchmark, resolves the CMS dataset endpoint when the benchmark download URL is still `TBD`, writes raw snapshot metadata, and either normalizes/generates CMS hospital records or records a fetch-failed refresh report without creating fake records.

The current run in this environment was fetch-blocked, so no generated CMS hospital records were published. Reports are stored in `data/reports/cms-hospitals-validation-v0.2.2.json` and `data/reports/cms-hospitals-refresh-v0.2.2.json`; raw metadata is stored in `data/raw/cms-hospitals/cms-hospitals-raw-metadata-v0.2.2.json`. If a connected environment fetch succeeds, normalized output goes to `data/normalized/cms-hospitals/cms-hospitals-normalized-v0.2.2.json`, generated output goes to `data/generated/cms-hospitals.generated.json`, and passing validation updates `data/last-known-good/cms-hospitals.generated.json`.

The main app remains synthetic by default and the CMS pilot does not power the main map. Coordinates may be missing because geocoding is explicitly deferred to v0.2.3. Emergency-services and critical-access labels are source-supported only. No patient-level data, claims data, PHI, live routing/diversion/bed status, or clinical decision support is added. The next patch should be v0.2.3 Facility Geocoding and Geography Join.
