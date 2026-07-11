# Source-Backed UI and Data-Bearing Release Policy

## Data-Bearing Release Policy

A national source release is not complete until the official source data has been pulled, normalized, deduplicated, geocoded where necessary, geography-joined, validated, written to generated artifacts, and made available to the application under source-backed guardrails.

Scripts, schemas, empty caches, reports, chunk plans, and workflows alone do not constitute completion.

When local or Codex network restrictions prevent execution, the same release must execute through GitHub Actions. The release remains incomplete until the required generated-data pull request or pull requests are merged.

Completion requires the checklist in `docs/templates/NATIONAL-DATA-RELEASE-CHECKLIST.md`.

## Source-Backed UI Policy

No active map layer, filter, capability, legend item, summary, or evidence section may appear unless it is backed by a validated current source mapping or clearly isolated as synthetic demonstration content.

Future or unsupported items must be:

- hidden from primary controls;
- marked docs-only;
- marked future-source-needed; or
- removed.

They must not appear as normal active checkboxes or map layers.

## v0.3.4 CMS facility identity field audit

The v0.3.4 CMS facility identity audit documents source-backed CMS Hospital General Information fields and forbids inferred contact or capability values. Phone uses the CMS `telephone_number` column, is stored as source text, and only creates a `tel:` link when digits/extensions can be parsed safely. Website URL is unavailable in the current CMS source mapping; the UI and export code keep safe-link support for future source-backed enrichment but never constructs URLs from facility names or external searches.

Identity-refresh mode is the expected generated-data workflow when only identity/contact fields change. It must reuse the current geocoding cache, rebuild normalized records and compact partitions, validate the national artifacts, run `npm run data:audit-cms-hospital-fields`, commit generated data to a review branch, and never auto-merge. Missing values mean “Not reported in this source” where important; absent website means “Website URL is not provided by the current CMS Hospital General Information source mapping.” No patient-level data, claims data, PHI, live capacity, routing, OSM ingestion, population ingestion, or v0.3.5 work is included.
