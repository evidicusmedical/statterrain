# StatTerrain v0.3.3.3 handoff — real-data UI, facility contact details, evidence cleanup

## Release classification

Focused code-only UX, facility-detail, and evidence cleanup patch. This release does not add OSM, population, dialysis, or other datasets and does not regenerate CMS hospital generated artifacts.

## User-visible changes

- Visible prototype version is `v0.3.3.3 prototype` from central product configuration.
- CMS source/freshness compact panel is reduced to one status line: CMS hospitals, national map-ready count, and manifest-backed updated date.
- Expanded CMS source details avoid preview/blocked/fixture pipeline wording and focus on source, agency, dataset ID, retrieval date, map-ready count, geocoding status, and state/territory count.
- Source-confidence display control was removed from normal UI.
- Facility-label and freshness-badge display toggles were removed from normal UI.
- Map legend now describes only active normal map symbols: Hospital, Selected planning location, and Planning-radius boundary.
- Critical-access hospitals render with the standard hospital marker; critical-access remains metadata only, not a separate legend item or normal filter.
- Facility contact rows hide empty values. Source-backed phone values render as safe `tel:` links when present. Website values render only if present and safely linkable.
- Evidence brief/export copy was cleaned up to describe the active CMS public-data map experience instead of stale synthetic demonstration or bounded preview language.

## CMS partition field audit

Current deployed national partition records include: name, source facility ID, facility type, hospital type, ownership type, emergency-services indicator, critical-access indicator, address, city, state, ZIP, phone, retrieved date, validation status, geography join status, geocoding confidence, limitations, and prohibited uses.

Normalized source data includes address line 1, address line 2, source name, source agency, dataset ID, and source URL, but those fields are omitted from compact deployed partitions.

Website is unavailable in the current CMS source mapping and compact partitions; do not invent or backfill website values in v0.3.3.3. If website URLs are added later, that requires a v0.3.4 data-mapping/data-artifact update.

## Files changed

- `src/config/product.ts`
- `src/hooks/useAppState.ts`
- `src/components/filters/FilterSidebar.tsx`
- `src/components/map/MapView.tsx`
- `src/components/map/MapLegend.tsx`
- `src/components/public-data/PublicDataFreshnessPanel.tsx`
- `src/components/facilities/FacilityDetailPanel.tsx`
- `src/config/facilityTaxonomy.ts`
- `src/lib/public-data/loadNationalCmsHospitals.ts`
- `src/lib/export.ts`
- `tests/cms-public-activation.test.mjs`
- `tests/cms-partition-resolution.test.mjs`
- `tests/cms-partition-field-audit.test.mjs`

## Validation

- `npm run typecheck`
- `npm run test:cms-public-activation`
- `npm run test:cms-partition-resolution`
- `node --test tests/cms-partition-field-audit.test.mjs`

## Data restrictions observed

No generated CMS national data, normalized data, raw data, geocoding cache/chunks, reports, or public generated partition copies were modified or regenerated.
