# StatTerrain — Product Scope (v0.1.0 prototype)

## What this is

StatTerrain is a **frontend-only, portable prototype** that demonstrates a mapping and
evidence-brief experience for emergency-care and population-health planning. It ships
with entirely **synthetic, static demonstration data** — there are no live API calls,
no backend service, no database, and no authentication.

## Primary audience

Emergency and EMS clinicians, medical directors, quality-improvement teams, and
regional planners who want a fast, visual orientation to nearby facilities, publicly
documented capabilities, and population-health context for a region.

## In scope for v0.1.0

- Header with search (hospital / city / ZIP / county / address) and geography controls
  (radius selection; drive-time UI is present but disabled/planned).
- Filter sidebar: map display controls for facility types, hospital capabilities, population-health overlay,
  source confidence threshold, and map display toggles. All facility categories and all demonstration
  confidence levels are visible by default, and no population-health overlay is selected by default.
- Interactive Leaflet/OpenStreetMap map with facility markers, a search-radius circle,
  and choropleth-style overlay polygons for population metrics.
- Regional summary panel with facility counts and population-health metric cards
  (local vs. state vs. national), each carrying confidence/freshness badges.
- Facility detail panel with capability records, per-record source attribution, and
  known limitations.
- Trust layer: every data point exposes its source, freshness, and confidence.
- Evidence-brief generator producing Markdown, JSON, and CSV exports (client-side only). Default brief scope includes all available facility categories in the selected geography/radius; map display filters do not exclude records from the brief.
- Mandatory disclaimer and synthetic-data notice, shown in the footer, facility detail,
  and every exported brief.
- Responsive layout with mobile bottom-tab navigation and slide-in drawers for filters
  and the evidence brief.
- Baseline accessibility: semantic landmarks, focus management in drawers, keyboard
  operable controls, visible focus states, `prefers-reduced-motion` support.

## Explicitly out of scope for v0.1.0

- Any live data source, API integration, authentication, or persistent backend/database.
- Real facility operational status, live diversion/bed availability, transfer routing, dispatch recommendations, medical-control advice, or patient-specific clinical decision support.
- Drive-time isochrones (UI is present as a disabled placeholder for a future release).
- Server-side rendering of user-specific state (fully client-rendered, static-data app).

## Definition of done for this prototype

`npm install`, `npm run dev`, `npm run lint`, and `npm run build` succeed with no
Replit-specific configuration, environment variables, or services required. The app
deploys unmodified to Vercel as a static/standard Next.js App Router project.

## v0.1.4 facility detail scope

Facility detail screens use a standardized display structure covering facility identity, capability summary, contact/access information, source and data quality, and known limitations. The UI distinguishes synthetic demonstration values from future real source-linked fields and uses explicit missing-data language such as `Not available in current source` and `Not verified in current source`.

Facility category explanations cover hospitals, critical access hospitals, pharmacies, dialysis centers, skilled nursing facilities, and behavioral-health facilities. Hospital capability definitions cover emergency department, critical access hospital, trauma, stroke, STEMI/PCI, pediatric, behavioral-health, and dialysis-related capability terms. Each definition includes operational caution: this product is not live routing, diversion, transfer, destination, medical-control, bed-status, or clinical decision-support software.

No real CMS, Census, CDC, SAMHSA, NPPES, or other public data ingestion was added for v0.1.4. No backend, database, authentication, PHI handling, AI API, or live operational workflow was added.

## v0.1.5 beta-readiness scope

v0.1.5 adds interpretability and beta-review support only. Population-health metrics include plain-language definitions, denominator/source-status notes, planning relevance, known limitations, and synthetic-data caveats. Pediatric population, poverty, Social Vulnerability Index, and rurality explicitly note that real definitions must come from future connected public datasets.

The app displays a source/freshness inventory for the current demonstration dataset categories and states that all current records are synthetic demonstration data. No public-data refresh is active. The base-map note identifies OpenStreetMap and explains that map currency depends on contributor and tile-provider updates, not an official government source.

The beta feedback workflow is a centrally configured mailto link plus a client-only copy-context helper in the evidence brief. It does not collect feedback in a backend.

StatTerrain remains a prototype for planning and situational awareness only. It is not for live routing, diversion, bed status, triage, transfer decisions, dispatch, medical-control advice, clinical decision support, or PHI handling. Real public-data ingestion has not started; future versions should connect official public datasets with source metadata and refresh validation.

## v0.1.6 population metric explanation scope

v0.1.6 refines explanation and discoverability for population demographics and health-context metrics only. Population-health cards now include compact helper text plus expandable metric details covering the metric meaning, current synthetic prototype definition, future real-source definition needs, denominator or population basis, planning relevance, known limitations, synthetic-data caveat, and what users should not infer.

The pediatric metric explicitly states that the current prototype is synthetic and does not yet use a real source-defined pediatric age cutoff. Future Census/ACS integration must show the exact age band, such as ages 0–17, under 18, or another source-defined category. Poverty, limited English proficiency, no-vehicle access, chronic disease prevalence, SVI, and rurality explanations now document their source-definition caveats and planning uses in plain language.

All population metrics remain synthetic demonstration values. No real CMS, Census, CDC, SAMHSA, NPPES, or other public-data ingestion was added. StatTerrain remains planning and situational-awareness software only, not live routing, diversion, bed-status, dispatch, medical-control, transfer, triage, or clinical decision-support software.

## v0.1.7 plain-language metric and workspace scope

v0.1.7 is an explanation and layout refinement only. Population metrics now prioritize short plain-language text before technical source details: what the metric is, higher/lower meaning, planning relevance, do-not-assume warnings, and synthetic-data status. Pediatric, poverty, LEP, no-vehicle access, chronic disease, SVI, and rurality caveats remain explicit and must be replaced with source-defined details only when future real public data are connected.

The right-side regional summary column can be collapsed and restored so desktop users can enlarge the map workspace. Mobile users keep the map/summary/facility view switcher, touch-friendly controls, evidence brief access, feedback access, and usable map area. The app still does not provide live routing, destination recommendations, diversion status, bed availability, dispatch, medical-control guidance, triage, clinical decision support, PHI handling, authentication, database, backend, or real public-data ingestion.

## v0.1.8 collapsible metrics and mobile workspace scope

v0.1.8 is a UI refinement only. Population metric cards show a visible **Quick read** line, collapse full plain-language meaning panels by default, and use local accordion behavior so only one metric explanation is expanded at a time. Existing v0.1.6/v0.1.7 technical source details, denominator notes, future real-source definition requirements, and synthetic-data caveats remain available as secondary details.

The mobile layout is map-first and map-accessible: users can switch between Map, Summary, and Facility views with bottom tabs, open Filters from the header drawer, return to the map in one tap, and use **Hide summary / Show summary** without losing access to population context or facility details. Desktop keeps the three-area workspace, with summary collapse continuing to enlarge the map.

Scope remains controlled: no real public-data pipelines, no backend, no database, no authentication, no PHI handling, no AI API integration, no live routing/diversion/bed-status features, and no clinical or medical-control guidance are included.
