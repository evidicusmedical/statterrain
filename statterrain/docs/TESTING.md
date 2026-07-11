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

## v0.3.0.2 tests

The v0.3.0.2 test gate requires `product.prototypeVersion` to be `v0.3.0.2 prototype`. Static and registry tests verify that the top search bar is the primary location search, the large in-map search card is absent by default, the placeholder covers address/ZIP/city/state and lat/lon, coordinate parsing accepts comma and space-separated pairs, invalid coordinates return `invalid-input`, valid coordinate searches do not call the Census Geocoder, and selected coordinate locations are session-only.

Additional tests cover the map-click planning-center handler, concise coordinate labels, selected-radius preservation through existing state, the compact selected-location badge, non-overlap intent for the top-right Show Summary control, absence of persistent summary helper copy, compact public-data status by default, hidden long provenance details until Details is opened, and preservation of coverage manifests, CMS hospital preview bounds, CMS dialysis fixture safety, and synthetic default map behavior.

## v0.3.1 tests

The v0.3.1 test gate requires `product.prototypeVersion` to be `v0.3.1 prototype`, verifies the source-backed taxonomy, confirms unsupported facility categories and hospital capabilities are hidden from normal active controls, checks source-scope export language, validates manifest taxonomy readiness metadata, and confirms the Data-Bearing Release Policy, Source-Backed UI Policy, and national data release checklist exist.


## v0.3.3.1 nationwide CMS partition resolution hotfix

StatTerrain resolves CMS hospital partitions by explicit selected-location state, deterministic local coordinate-to-state/territory resolution, Census structured state fields, and state abbreviation/full-name parsing. The prior arbitrary CA/DC/FL/IL/NY/TX fallback was removed. Candidate hospital partitions are selected from manifest-supported state/territory bounds intersecting the selected radius bounding box, with final Haversine filtering remaining authoritative.

User-visible coverage states now distinguish unresolved planning locations, partition load failures or partial coverage, and genuine zero-result radius searches after requested partitions loaded successfully. The bundled resolver metadata covers all 50 states, District of Columbia, and Puerto Rico represented by the national CMS hospital manifest. Border searches may load multiple intersecting partitions; excluded or unmatched CMS facilities remain limited to the existing map-ready national artifact.
