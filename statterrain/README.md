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

## v0.3.0.2 GUI/GX update

StatTerrain v0.3.0.2 makes the top search bar the primary planning-location search. It accepts U.S. addresses, ZIP codes, city/state queries, states, and latitude/longitude pairs such as `43.615, -116.202`; valid coordinates are handled session-only without calling the Census Geocoder. Users can also click the map background to set a session-only planning center and recenter the straight-line radius.

Searched and clicked locations are not stored, are not patient addresses, and do not enable routing, travel-time, ETA, diversion, bed-status, dispatch, triage, transfer, or clinical decision-support behavior. The default map remains synthetic demonstration data. Public-data source/freshness status is shown as a compact map note by default, with Details preserving source, provenance, limitations, and preview controls. No public-data ingestion, CMS refresh, or live facility geocoding behavior changed in this patch.
