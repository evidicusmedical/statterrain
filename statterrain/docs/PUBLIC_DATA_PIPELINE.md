# Public Data Pipeline

StatTerrain v0.2.0 creates the public-data automation framework only. It does not ingest CMS, Census, CDC, SAMHSA, NPPES, SVI, RUCA/RUCC, dialysis, nursing-home, or other real public datasets. The current app remains a synthetic demonstration.

## Intended future flow

Official public data source → manual or scheduled GitHub Action → raw snapshot metadata → validation → normalized JSON → generated app data → refresh report → publish only if validation passes, otherwise keep last-known-good fallback → Vercel redeploy.

## Registry and folders

The source registry is `data/sources/source-registry.json`. It contains planned official-public-data placeholders with `usedInCurrentApp: false`, `dataMode: not-yet-ingested`, no successful refresh timestamp, and no active automation.

Folders under `data/` separate `raw`, `normalized`, `generated`, `reports`, and `last-known-good` artifacts.

## Data modes

Supported modes are `synthetic-demo`, `real-public-data`, `mixed`, `unavailable`, and `not-yet-ingested`. v0.2.0 does not switch the app from synthetic demo mode.

## Validation gates and fallback

Generated public data must not become app-visible unless validation passes or an explicitly labeled last-known-good fallback is used. If validation fails, generated data are not published, the last-known-good dataset remains active, and reports must identify fallback activation.

## Safety rules

Use official public sources where possible. Preserve raw snapshots or snapshot metadata. Validate before display. Never publish unvalidated data directly. Always display retrieval date, release date if available, source name, confidence/freshness, and limitations. Facility capability and operating status must be verified from official/local sources. Public data are for planning and situational awareness only. Never use public datasets for live routing, diversion, dispatch, bed status, triage, transfer, medical-control, or clinical decision support. No PHI may be accepted, uploaded, processed, stored, or displayed.

## Manual workflow

`.github/workflows/public-data-refresh.yml` is manual-only via `workflow_dispatch`. It runs `npm ci`, source-registry validation, and refresh-readiness report generation from `statterrain/`. It has no cron schedule, performs no external fetches, and does not commit generated files.

## Future sequence

- v0.2.1 — CMS Hospital Data Pilot
- v0.2.2 — Automated CMS Refresh
- v0.2.3 — Source Freshness UI
- v0.3.0 — Census ACS Demographics
- v0.3.1 — CDC PLACES Health Context

## v0.2.2 CMS hospital baseline pilot

v0.2.2 adds the first real public-data ingestion pilot for CMS Hospital General Information, the top hospital source identified in the v0.2.1 benchmark. The pull script reads the benchmark, resolves the CMS dataset endpoint when the benchmark download URL is still `TBD`, writes raw snapshot metadata, and either normalizes/generates CMS hospital records or records a fetch-failed refresh report without creating fake records.

The current run in this environment was fetch-blocked, so no generated CMS hospital records were published. Reports are stored in `data/reports/cms-hospitals-validation-v0.2.2.json` and `data/reports/cms-hospitals-refresh-v0.2.2.json`; raw metadata is stored in `data/raw/cms-hospitals/cms-hospitals-raw-metadata-v0.2.2.json`. If a connected environment fetch succeeds, normalized output goes to `data/normalized/cms-hospitals/cms-hospitals-normalized-v0.2.2.json`, generated output goes to `data/generated/cms-hospitals.generated.json`, and passing validation updates `data/last-known-good/cms-hospitals.generated.json`.

The main app remains synthetic by default and the CMS pilot does not power the main map. Coordinates may be missing because geocoding is explicitly deferred to v0.2.3. Emergency-services and critical-access labels are source-supported only. No patient-level data, claims data, PHI, live routing/diversion/bed status, or clinical decision support is added. The next patch should be v0.2.3 Facility Geocoding and Geography Join.

## v0.2.6 manual CMS hospital refresh PR workflow

v0.2.6 adds `.github/workflows/cms-hospital-refresh.yml`, a manual-only GitHub Actions workflow for CMS Hospital General Information refreshes. The workflow is intentionally not scheduled. It checks out `main`, runs the refresh from `statterrain/`, and uses a generated branch plus pull request for human review instead of committing generated artifacts directly to `main`.

The workflow runs `npm run data:refresh-cms-hospitals`, which validates source metadata, pulls CMS Hospital General Information, validates generated CMS records, runs geocoding in the requested mode, validates again, and regenerates the public-data readiness report. The default geocoding mode is `dry-run`, which records eligibility without making external geocoder calls. Live Census Geocoder calls require both `geocoding_mode=live-census` and `confirm_live_geocoding=true`, and are bounded by `live_geocoding_limit` with an allowed range of 1-100 records.

The generated CMS artifacts remain review artifacts only. The workflow preserves `usedInCurrentApp: false`, requires preview labeling, keeps the default map synthetic, and does not change v0.2.5 fixture/unvalidated/ungeocoded artifact blocking or public-data preview guardrails.

## v0.2.7.1 release tracking and PR #24 artifact status

Release tracking rule: every patch must update `product.prototypeVersion` in `src/config/product.ts`. This visible version is used to confirm Vercel deployment freshness and prevent stale UI confusion. Tests must be updated with each patch to assert the expected visible version.

PR #24 successfully produced a bounded live-geocoded CMS Hospital General Information artifact with 5 records, 5 Census Geocoder matches, and 5 geography joins. The artifact is preview-eligible only because those records have valid coordinates, matched geocoding status, joined geography status, real-public-data mode, non-fixture metadata, and `usedInCurrentApp: false`. The CMS preview remains optional and off by default; default app data remains synthetic. Broader CMS national data is not complete, and generated data must not be auto-merged or scheduled by cron.

## v0.2.8 CMS Dialysis Facility pilot

StatTerrain v0.2.8 adds a manual, validation-gated CMS Dialysis Facility public-data ingestion pilot. The source is the official CMS Provider Data Catalog / Care Compare dialysis facility listing (`cms-dialysis-facilities`). The pipeline is intentionally not connected to the default synthetic map.

Safety constraints:

- dialysis records are `usedInCurrentApp: false`;
- fixture records are `synthetic-test-fixture` only and never update last-known-good;
- generated dialysis records are not geocoded, not geography-joined, and not map-ready;
- prohibited uses include patient referral, routing, treatment, appointment availability, dialysis station availability, live capacity, staffing, dispatch, triage, transfer, diversion, bed status, and clinical decision support.

Manual commands:

```bash
npm run data:pull-cms-dialysis -- --fixture
npm run data:validate-cms-dialysis
```

Real fetch mode uses the official CMS endpoint when reachable, but failed fetches report a safe no-publish state instead of fabricating records.

## v0.2.8.1 radius-control note

v0.2.8.1 does not change public-data ingestion. Radius is straight-line planning distance only, not drive-time or routing. Quick radius options are 10, 25, 50, and 100 miles, and the custom slider supports 1–250 miles. The selected radius scopes map summaries and evidence/export output for whichever safe display mode is active: synthetic default records, and CMS hospital preview records only when the optional preview is explicitly enabled.

CMS hospital preview behavior remains optional/off by default with the existing bounded 5-record artifact. CMS dialysis remains fixture-only, not geocoded, not preview-ready, and not used by the map.
