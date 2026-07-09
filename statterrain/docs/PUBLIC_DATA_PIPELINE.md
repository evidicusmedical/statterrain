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
