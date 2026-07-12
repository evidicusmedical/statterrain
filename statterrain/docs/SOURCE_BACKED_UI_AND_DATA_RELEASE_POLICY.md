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

## v0.3.5 unified planning location, radius, layers, and evidence contract

StatTerrain v0.3.5 establishes search/map-click parity through one canonical planning-location state and one canonical analysis-radius value. Supported typed search forms are U.S. street address, city/state, ZIP code, and latitude/longitude pairs; unsupported county, landmark, hospital-name, AHA capability, and population/demographic controls remain hidden. Slider, numeric radius input, and 10/25/50/100-mile buttons update the same 1–250 mile radius and rerun the same radius-bounded CMS hospital partition selection and Haversine filtering.

The active research-layer registry contains only CMS hospitals for this patch. Future ACS population, rurality, vulnerability, community-health, accessibility, resilience, and licensed capability work must register source-backed layers and update both the visual interface and Evidence Brief. Evidence exports now use `statterrain-evidence-v1` with source, release, retrieval date, methods, freshness, completeness, limitations, unavailable-section markers, and CMS facility provenance. No ACS, RUCA, SVI, PLACES, AHA, OSM, routing, live-status, dispatch, clinical, or patient-specific functionality is introduced.

## v0.3.6 national ACS county population baseline

StatTerrain v0.3.6 adds an inactive, validation-gated ACS 2024 5-Year county population baseline pipeline for the National Emergency-Care Capability, Access, and Resilience Research Platform. The source is the United States Census Bureau American Community Survey 5-Year Estimates, 2024 release, 2020-2024 estimate period. The eight registered county metrics are total population, under-18 population, age-65-and-older population, poverty population, uninsured population, no-vehicle households, civilian noninstitutionalized population with a disability, and limited-English-speaking households. Estimates and margins of error are retained; missing, suppressed, invalid, denominator-zero, and ACS sentinel values are not treated as zero.

The GitHub Actions workflow uses `CENSUS_API_KEY` only as a server-side repository secret. Browser code does not call the Census Data API, and ACS metrics remain `safeToDisplay: false`, unavailable to normal research-layer controls, and absent from Evidence Brief demographic values until v0.3.7. AHA capability work remains a separate future track; no AHA, OSM, RUCA, SVI, PLACES, patient-level, claims, PHI, live operational, routing, or clinical decision-support data is introduced.
