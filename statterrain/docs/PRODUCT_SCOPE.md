# StatTerrain v0.3.0.1 map workspace declutter

StatTerrain v0.3.0.1 is a focused UI hotfix that declutters the map workspace while preserving the v0.3.0 public-data scaling foundation and default synthetic map behavior.

## Map workspace UI

- The public-data source/freshness panel is compact and collapsed by default so the map, search box, and radius controls remain the primary workspace.
- Compact mode keeps critical status visible: national public-data coverage is still in progress, CMS hospitals remain a bounded 5-record preview-ready sample, CMS dialysis remains fixture-only/not map-ready, and the optional CMS hospital preview state is visible.
- Full source, freshness, validation, geocoding, coverage-manifest, limitation, and prohibited-use details remain available from the explicit Details control and can be collapsed again.
- The summary toggle remains usable, but the prior persistent floating help copy has been removed so it does not collide with map/source panels.

## Public-data behavior

No public-data behavior changed in this patch. No new ingestion, CMS refresh, real dialysis fetch, live facility geocoding, or mass geocoding was run. The CMS hospital preview remains optional/off by default, CMS dialysis remains fixture-only/not map-ready, and generated public-data artifacts remain inactive for the default app.

## Safety boundaries

No backend, database, authentication, PHI, patient-level data, claims data, live routing, drive-time calculation, travel-time estimate, ETA, real-time traffic, live diversion, bed status, dispatch recommendations, triage recommendations, transfer recommendations, medical-control guidance, or clinical decision support is included. User-entered search locations remain session-only and are not stored.

## Testing notes

The v0.3.0.1 test gate asserts the centralized visible version label, compact/collapsed source panel source text, accessible expand/collapse state, summary-toggle artifact removal, existing address search contract, radius controls, coverage manifests, CMS hospital preview safety, CMS dialysis fixture safety, and synthetic default map behavior.

## Next patch

Recommended next patch: v0.3.1 — CMS Hospital National Pull Expansion. It should expand CMS Hospital General Information into a full national normalized artifact while keeping national records non-map-ready until chunked geocoding/geography joins are completed.

## v0.3.0.2 location-search and map-status scope

The top application search bar is the primary planning-location control. It supports address, ZIP, city/state, state, and latitude/longitude searches. Map background clicks can set the selected planning center and recenter the existing straight-line radius. These searched or clicked locations are session-only, are not stored, and must not be interpreted as patient locations.

This release does not add routing, drive-time, travel-time, ETA, real-time traffic, live diversion, bed status, dispatch guidance, triage, transfer guidance, medical-control guidance, or clinical decision support. Public-data source/freshness information is compact by default, with full Details still available. No source ingestion, CMS hospital refresh, CMS dialysis real fetch, live geocoding, or default synthetic-to-real map switch was added.

## v0.3.1 source-backed UI and data-bearing release scope

StatTerrain v0.3.1 uses a central source-backed facility taxonomy. Normal active map layers, filters, capabilities, legends, summaries, and evidence sections may appear only when backed by a validated current source mapping or clearly isolated as synthetic demonstration content.

A national source release is not complete until the official source data has been pulled, normalized, deduplicated, geocoded where necessary, geography-joined, validated, written to generated artifacts, and made available to the application under source-backed guardrails. Scripts, schemas, empty caches, reports, chunk plans, and workflows alone do not constitute completion. When local or Codex network restrictions prevent execution, the same release must execute through GitHub Actions and remains incomplete until the required generated-data pull request or pull requests are merged.

Future or unsupported items must be hidden from primary controls, marked docs-only, marked future-source-needed, or removed. They must not appear as normal active checkboxes or map layers.


## v0.3.3.1 nationwide CMS partition resolution hotfix

StatTerrain resolves CMS hospital partitions by explicit selected-location state, deterministic local coordinate-to-state/territory resolution, Census structured state fields, and state abbreviation/full-name parsing. The prior arbitrary CA/DC/FL/IL/NY/TX fallback was removed. Candidate hospital partitions are selected from manifest-supported state/territory bounds intersecting the selected radius bounding box, with final Haversine filtering remaining authoritative.

User-visible coverage states now distinguish unresolved planning locations, partition load failures or partial coverage, and genuine zero-result radius searches after requested partitions loaded successfully. The bundled resolver metadata covers all 50 states, District of Columbia, and Puerto Rico represented by the national CMS hospital manifest. Border searches may load multiple intersecting partitions; excluded or unmatched CMS facilities remain limited to the existing map-ready national artifact.

## v0.3.4 CMS facility identity field audit

The v0.3.4 CMS facility identity audit documents source-backed CMS Hospital General Information fields and forbids inferred contact or capability values. Phone uses the CMS `telephone_number` column, is stored as source text, and only creates a `tel:` link when digits/extensions can be parsed safely. Website URL is unavailable in the current CMS source mapping; the UI and export code keep safe-link support for future source-backed enrichment but never constructs URLs from facility names or external searches.

Identity-refresh mode is the expected generated-data workflow when only identity/contact fields change. It must reuse the current geocoding cache, rebuild normalized records and compact partitions, validate the national artifacts, run `npm run data:audit-cms-hospital-fields`, commit generated data to a review branch, and never auto-merge. Missing values mean “Not reported in this source” where important; absent website means “Website URL is not provided by the current CMS Hospital General Information source mapping.” No patient-level data, claims data, PHI, live capacity, routing, OSM ingestion, population ingestion, or v0.3.5 work is included.
