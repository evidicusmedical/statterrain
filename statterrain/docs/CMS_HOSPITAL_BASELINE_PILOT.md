# CMS Hospital Baseline Pilot (v0.2.2)

StatTerrain v0.2.2 adds the first real public-data ingestion pilot for CMS hospital facility baseline records. The benchmark-selected source is `cms-hospital-general-information` / **CMS Hospital General Information** from the Centers for Medicare & Medicaid Services.

The app remains synthetic by default. Generated CMS hospital data does **not** power the main map in v0.2.2 (`usedInCurrentApp: false`).

## Source and fetch behavior

The v0.2.1 benchmark names CMS Hospital General Information as the top v0.2.2 facility source. Because its benchmark `downloadUrl` is `TBD`, the pull script resolves the CMS provider-data datastore endpoint for dataset `xubh-q36u` at runtime.

In this environment, the network fetch returned a blocked/failed result, so the script generated raw snapshot metadata plus validation and refresh reports, but did not fabricate CMS records and did not publish a generated app dataset.

## Output locations

- Raw metadata: `data/raw/cms-hospitals/cms-hospitals-raw-metadata-v0.2.2.json`
- Raw source file, when fetch succeeds: `data/raw/cms-hospitals/cms-hospitals-raw-v0.2.2.json`
- Normalized records, when fetch succeeds: `data/normalized/cms-hospitals/cms-hospitals-normalized-v0.2.2.json`
- Generated app-ready data, when fetch succeeds: `data/generated/cms-hospitals.generated.json`
- Validation report: `data/reports/cms-hospitals-validation-v0.2.2.json`
- Refresh report: `data/reports/cms-hospitals-refresh-v0.2.2.json`
- Last-known-good generated data, only after passing validation: `data/last-known-good/cms-hospitals.generated.json`

## Safety boundaries

The pilot does not ingest patient-level data, claims data, PHI, live routing, live diversion, live bed status, dispatch recommendations, triage recommendations, transfer recommendations, medical-control guidance, or clinical decision support. Emergency-services and critical-access labels are accepted only from explicit CMS source fields. Coordinates are not geocoded in v0.2.2; facility geocoding and geography joins are planned for v0.2.3.

## Commands

- `npm run data:pull-cms-hospitals`
- `npm run data:validate-cms-hospitals`

## Recommended next patch

v0.2.3 — Facility Geocoding and Geography Join.
