# StatTerrain v0.3.3.2 — Map Responsiveness, Source-Aligned Controls, Synthetic Warning Removal

## Release classification

Focused code-only GUI/GX correction patch. This is not v0.3.4 and does not rebuild or modify generated national CMS data.

## Version

- Visible prototype version: `v0.3.3.2 prototype`
- Single active source: `src/config/product.ts`

## Root cause diagnosis

The hidden-summary interaction defect came from the desktop workspace layout retaining a second right-side workspace area even after the summary was hidden. The summary itself used `lg:hidden`, but the surrounding desktop layout remained a row-style workspace with another right-column detail panel rendered at desktop sizes. That meant the map could visually appear to reclaim the summary area while a right-side workspace column could still exist above/next to the map and receive interactions. The map also did not explicitly invalidate the Leaflet size after the summary/detail layout state changed, so Leaflet could retain stale size calculations after collapse/expand.

This patch fixes the layout state rather than only changing z-index:

- Desktop workspace now uses explicit grid columns.
- When neither the summary nor the facility-detail column should be visible, the grid collapses to `minmax(0, 1fr)`.
- The summary is conditionally rendered only when open or when the mobile summary tab is active.
- Hidden summary state uses `aria-hidden`, `inert`, and `lg:pointer-events-none`.
- The facility-detail column is not desktop-visible unless the summary is hidden and a facility is selected.
- The map receives a layout key and calls `map.invalidateSize()` on layout changes.

## User-facing behavior changes

- Hiding the regional summary fully removes the summary panel from desktop interaction and focus flow.
- The map expands into the reclaimed desktop width when no facility detail is selected.
- Leaflet recalculates its container after summary/detail visibility changes.
- Normal controls now show source-backed CMS hospital categories only:
  - Hospitals / emergency departments
  - Critical access hospitals
- Synthetic demo category controls are no longer displayed in normal mode.
- Map legend no longer lists unsupported pharmacy, dialysis, nursing-home, or behavioral-health markers.
- Header/source copy no longer warns users that normal operation is synthetic data.
- Facility details now label active CMS records as CMS public-data records instead of preview/synthetic default records.

## Preserved behavior

- National CMS hospital partition loading remains intact.
- Nationwide state/territory partition resolution remains intact.
- Radius filtering remains intact.
- Facility selection and facility details remain intact.
- Map-click planning center selection remains intact.
- Source status and evidence export code paths remain present.
- Synthetic/demo warning copy remains available for explicit developer/demo fixture contexts.

## Tests/checks run

- `npm run typecheck`
- `npm run test:cms-public-activation`

## Data restrictions compliance

No generated national CMS hospital data, raw data, normalized data, geocoding cache/chunks, generated public partitions, or generated CMS reports were modified. No national CMS data build, pull, geocoding, join, partition, coverage-manifest, or artifact-manifest command was run.
