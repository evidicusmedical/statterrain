# CMS refresh workflow

## Release tracking rule

Every patch must update `product.prototypeVersion` in `src/config/product.ts`. This visible version is used to confirm Vercel deployment freshness and prevent stale UI confusion. Tests must be updated with each patch to assert the expected visible version.

## v0.2.7.1 status

PR #24 successfully produced a manual GitHub Actions CMS Hospital General Information artifact using bounded live Census Geocoder mode with a limit of 5 records. The current committed artifact remains `usedInCurrentApp: false`, is optional preview-only, and does not replace the synthetic default map.

Do not schedule this workflow, auto-merge generated data, ingest patient-level or claims data, or use CMS records for routing, diversion, bed availability, dispatch, triage, transfer, medical-control guidance, or clinical decision support. Broader CMS national data is not complete. The next patch after v0.2.7.1 should be v0.2.8 CMS Dialysis Facility Pilot.
