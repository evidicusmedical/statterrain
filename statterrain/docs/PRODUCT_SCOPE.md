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

## v0.1.9 mobile map usability and version-label scope

v0.1.9 is a UI hotfix only. The current visible header/version label is **StatTerrain v0.1.9 prototype**. Every future patch must update the visible top heading/version label to match the patch version using `StatTerrain vX.X.X prototype`, or the equivalent product-title plus version-badge layout.

The mobile map is intended to load in a map-first state: the legend is collapsed by default, a compact **Legend** control opens it, and the open legend includes an internal **Hide** control. The legend footprint is reduced on mobile, with the longer OpenStreetMap caveat behind a short **Map note** disclosure. Bottom mobile tabs continue to keep Map, Summary, and Facility views reachable.

Scope remains unchanged from prior prototype releases: data is synthetic demonstration data only. No real public data pipeline, CMS data, Census data, CDC data, SAMHSA data, NPPES data, backend, database, authentication, AI API, PHI handling, live routing, diversion, bed status, medical-control guidance, or clinical decision support is included.

## v0.1.10 evidence brief GUI, feedback context, and disclaimer scope

v0.1.10 is a UI, feedback, disclaimer, and version-label refinement patch only. The current visible header/version label is **StatTerrain v0.1.10 prototype**, sourced from the central product configuration. Every future patch must update the visible top heading/version label to match the patch version.

Evidence brief actions now behave like a selected action group: Markdown, JSON, CSV, and Copy Markdown share neutral inactive styling and use dark-green active styling with `aria-pressed` after the user clicks an action. This avoids implying Markdown is permanently preferred while preserving all client-side export behavior and the v0.1.3 geography-based brief scope statement.

The embedded desktop evidence-brief **Send Feedback** and duplicate copy-feedback-context control were removed from the drawer to reduce clutter. The standard **Send Feedback** link remains reachable from the header on desktop and mobile, uses `mathew.h.lowe+statterrain@gmail.com`, and automatically embeds client-side context in the mailto body. Feedback remains mailto-only; no backend collection, analytics, form dependency, database, authentication, or PHI workflow was added.

The mobile map is contained within its map section so Leaflet panes do not overlap the warning/disclaimer footer or create horizontal overflow. Existing mobile map controls, collapsed legend behavior, bottom Map / Summary / Facility tabs, facility popup, **View details**, and summary hide/show behavior remain in scope.

Disclaimer language now more clearly states that StatTerrain is a planning, education, orientation, quality-improvement, and situational-awareness prototype; current data are synthetic demonstration data only; it is not for clinical care, patient-specific decisions, EMS routing, triage, transfer decisions, dispatch, medical control, live diversion, bed availability, or emergency response; maps and facility status may be incomplete, outdated, or inaccurate; population metrics are area-level planning context only; and official sources must be verified. The disclaimer does not claim to remove liability and should be reviewed by qualified legal counsel before external beta or public launch.

No real CMS, Census, CDC, SAMHSA, NPPES, or other public-data ingestion, backend, database, authentication, AI API, PHI handling, live routing, diversion status, bed status, dispatch recommendation, triage recommendation, transfer recommendation, medical-control guidance, clinical decision support, Replit runtime dependency, or v0.2.0 public-data pipeline was added.

## v0.1.11 mobile map, summary, and facility panel scope

v0.1.11 is the final mobile GUI hotfix before v0.2.0 public-data-pipeline foundation work. The current visible header/version label is **StatTerrain v0.1.11 prototype**, sourced from the central product configuration.

The mobile map is contained under non-map UI: Leaflet panes are isolated/clipped within the map shell, the mobile **Map / Summary / Facility** tab bar is a solid bordered white layer above map panes, and attribution remains visible inside the map instead of overlapping the tab bar. The mobile **Summary** tab shows the regional summary content even after summary hide/show has been toggled, and the mobile **Facility** tab uses readable full-width details rather than a compressed map-popup-sized panel.

No real public data, backend, database, authentication, AI API, PHI workflow, live routing, diversion, bed status, dispatch, triage, transfer recommendation, medical-control guidance, clinical decision support, or v0.2.0 public-data-pipeline work is included in v0.1.11. The recommended next patch remains **v0.2.0 — Public Data Pipeline Foundation**.
