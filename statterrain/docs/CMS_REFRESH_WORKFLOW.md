# CMS refresh workflow

## Release tracking rule

Every patch must update `product.prototypeVersion` in `src/config/product.ts`. This visible version is used to confirm Vercel deployment freshness and prevent stale UI confusion. Tests must be updated with each patch to assert the expected visible version.

## v0.2.7.1 status

PR #24 successfully produced a manual GitHub Actions CMS Hospital General Information artifact using bounded live Census Geocoder mode with a limit of 5 records. The current committed artifact remains `usedInCurrentApp: false`, is optional preview-only, and does not replace the synthetic default map.

Do not schedule this workflow, auto-merge generated data, ingest patient-level or claims data, or use CMS records for routing, diversion, bed availability, dispatch, triage, transfer, medical-control guidance, or clinical decision support. Broader CMS national data is not complete. The next patch after v0.2.7.1 should be v0.2.8 CMS Dialysis Facility Pilot.

## v0.3.4 CMS facility identity field audit

The v0.3.4 CMS facility identity audit documents source-backed CMS Hospital General Information fields and forbids inferred contact or capability values. Phone uses the CMS `telephone_number` column, is stored as source text, and only creates a `tel:` link when digits/extensions can be parsed safely. Website URL is unavailable in the current CMS source mapping; the UI and export code keep safe-link support for future source-backed enrichment but never constructs URLs from facility names or external searches.

Identity-refresh mode is the expected generated-data workflow when only identity/contact fields change. It must reuse the current geocoding cache, rebuild normalized records and compact partitions, validate the national artifacts, run `npm run data:audit-cms-hospital-fields`, commit generated data to a review branch, and never auto-merge. Missing values mean “Not reported in this source” where important; absent website means “Website URL is not provided by the current CMS Hospital General Information source mapping.” No patient-level data, claims data, PHI, live capacity, routing, OSM ingestion, population ingestion, or v0.3.5 work is included.
