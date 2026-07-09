# StatTerrain (v0.1.0 prototype)

Emergency-care resources and population-health intelligence — a polished, portable
**frontend-only** prototype built with Next.js (App Router), TypeScript, Tailwind CSS,
and Leaflet/react-leaflet over OpenStreetMap tiles.

> **Synthetic demonstration data — not a real-world source. Do not use for
> operational or clinical purposes.** See the in-app disclaimer, shown in the footer,
> facility detail panel, and every evidence-brief export.

## What it does

- Search a synthetic demonstration region by hospital, city, ZIP, county, or address.
- Explore an interactive map of hospitals, critical access hospitals, pharmacies,
  dialysis facilities, nursing homes, and behavioral-health facilities.
- Use map display filters for facility type, hospital capability (trauma level, stroke center type,
  STEMI/PCI, pediatric, obstetric, behavioral-health receiving), and source-confidence
  threshold. These controls change what appears on the map and summary panels.
- Toggle a population-health choropleth overlay (age 65+, poverty, chronic disease
  prevalence, social vulnerability, rurality, and more); no overlay is selected by default.
- View a facility detail panel with per-capability source, confidence, and freshness
  attribution.
- View a regional summary panel comparing local vs. state vs. national metrics.
- Generate a shareable evidence brief and export it as Markdown, JSON, or CSV — fully
  client-side, no server involved. By default the evidence brief includes all available
  facility categories in the selected geography/radius, even when map display filters hide
  some categories.

## Tech stack

- Next.js 14 (App Router) + TypeScript
- Tailwind CSS
- Leaflet + react-leaflet (OpenStreetMap tiles)
- Zero backend, zero database, zero authentication, zero required environment
  variables

## Getting started

```bash
npm install
npm run dev
```

Then open `http://localhost:3000`.

## Other commands

```bash
npm run lint         # ESLint (next lint)
npm run typecheck    # TypeScript --noEmit
npm run build        # Production build
npm run start        # Serve the production build
npm run test:e2e     # Playwright end-to-end smoke tests (see docs/TESTING.md)
```

## Project structure

```
src/
  app/                Next.js App Router entry (layout, page, global styles)
  components/
    layout/            Header, Footer
    filters/           Filter sidebar
    map/                Leaflet map, legend, marker styling
    facilities/         Facility detail panel
    regional-summary/   Regional summary panel + metric cards
    evidence/            Evidence-brief drawer
    sources/             Source attribution card
    ui/                  Shared primitives (badges, drawer, collapsible)
  config/               Centralized product name/tagline/disclaimer config
  data/                 Synthetic demonstration data (facilities, sources, metrics, region)
  hooks/                Client app-state hook
  lib/                  Formatting, export (MD/JSON/CSV), planning considerations
  types/                Shared TypeScript types
docs/                   Product scope, data-source plan, deployment guide, brand notes
tests/                  Playwright end-to-end smoke tests
```

## Data

All data is synthetic and fictional — not verified real-world data — generated to resemble the shape and trust
metadata of real public datasets (CMS, Census ACS, CDC PLACES/SVI, USDA RUCA, SAMHSA,
and example state trauma/stroke registries). See `docs/DATA_SOURCE_PLAN.md` for the
full mapping and `docs/FUTURE_REFRESH_ARCHITECTURE.md` for a proposed path to real
data.

## Testing

End-to-end smoke tests run against a real browser via Playwright and cover the
critical workflow: page load, map rendering, filters, facility selection,
population overlay, and evidence-brief export. See `docs/TESTING.md` for the
full breakdown and how to run them. A GitHub Actions workflow
(`.github/workflows/ci.yml`) runs lint, typecheck, build, and the smoke suite
on every push and pull request.

## Deployment

This is a standard Next.js project with no Replit-specific dependencies. See
`docs/VERCEL_DEPLOYMENT.md` for step-by-step Vercel deployment instructions — no
environment variables are required.

## Documentation set

- `docs/PRODUCT_SCOPE.md` — what's in and out of scope for this prototype
- `docs/DATA_SOURCE_PLAN.md` — synthetic data provenance and future real-data plan
- `docs/VERCEL_DEPLOYMENT.md` — deployment steps
- `docs/TESTING.md` — end-to-end test coverage and how to run it
- `docs/FUTURE_REFRESH_ARCHITECTURE.md` — proposed architecture for live data refresh
- `docs/BRAND_AND_NAMING.md` — naming status and rebranding instructions

## License

MIT — see `LICENSE`.

## v0.1.4 facility detail and capability-definition framework

Facility detail panels now follow a standardized structure: Facility identity, Capability summary, Contact and access information, Source and data quality, and Known limitations. Missing contact or capability fields are intentionally shown as `Not available in current source` or `Not verified in current source` rather than hidden when omission could make records appear more complete than they are.

The prototype uses consistent verification language for facility details and capabilities: `Verified yes`, `Verified no`, `Not available in current source`, `Not applicable`, and `Synthetic demonstration value`. Missing public data must not be treated as absence of capability.

Facility category definitions and a hospital capability glossary explain plain-language meaning, planning relevance, known limitations, and operational caution. These definitions prepare the UI for future public-data source mapping without claiming that the synthetic demonstration records are nationally verified.

All facility records remain synthetic demonstration data and are labeled: `Synthetic demonstration data — not a real-world source.` StatTerrain remains planning and situational-awareness software only; it does not provide live routing, diversion, bed status, transfer, destination, medical-control, or clinical decision support.

## v0.1.5 beta interpretability notes

StatTerrain now includes plain-language definitions for each displayed population-health metric, including what the metric measures, the denominator or population basis, planning relevance, source status, known limitations, and the synthetic-data caveat. These definitions are visible from the population-health cards in the regional summary.

The data freshness/source inventory clearly labels all current datasets as synthetic demonstration data and states that no public-data refresh is active in this prototype. The base map note identifies OpenStreetMap as the map source and explains that map currency depends on contributor updates and tile-provider refresh.

Beta feedback is available through the **Send Feedback** mailto link and a client-only evidence-brief helper that copies app version, selected geography, selected radius, synthetic-data status, brief scope, and current page URL. No backend collection is added.

Current prototype limitations remain: no real CMS, Census, CDC, SAMHSA, NPPES, or other public-data ingestion; no backend, database, authentication, PHI handling, live routing, diversion, bed-status, triage, transfer, dispatch, medical-control, or clinical-decision-support functionality.

## v0.1.6 population metric explanation refinement

Population-health cards now include always-visible quick meaning text and expandable **What this means** details. Each metric explanation covers what it measures, how the synthetic prototype represents it, the future real-source definition requirement, denominator or population basis, planning relevance, limitations, synthetic-data status, and what not to infer.

Specific caveats were expanded for pediatric population age-band uncertainty; poverty definitions and federal-threshold or dataset-specific measures; limited English proficiency source fields; households without vehicle access; COPD, coronary heart disease, stroke, and poor mental-health prevalence as population-level estimates rather than individual diagnoses; SVI as a relative vulnerability index rather than a clinical-risk, danger, crime, or individual-risk score; and rurality as a source-defined classification that must name the classification system when real data are connected.

Evidence brief exports now include a concise metric definitions and limitations section. No real public data, backend, database, authentication, live routing, diversion, bed status, medical-control guidance, clinical decision support, or v0.2.0 public-data pipeline work was added.

## v0.1.7 plain-language metrics and responsive map workspace

Population-health cards now put short plain-language interpretation first: what the metric is, what higher and lower values generally mean, why it matters, what not to assume, and whether the current value is synthetic. Pediatric population states that real data must name the exact age range, poverty states that real data must name the poverty definition, limited English proficiency highlights interpreter and translated-communication planning, no-vehicle access warns that it does not measure ambulance availability or travel time, chronic-disease measures warn that they are not diagnoses for any person, SVI is not a crime, danger, clinical-risk, or community-judgment score, and rurality must name the real classification system when connected.

The map workspace now includes a **Hide summary / Show summary** control. On desktop, hiding the right summary column gives the map more horizontal space while preserving filters, evidence-brief controls, and facility detail behavior. On mobile, the existing map/summary/facility switcher remains available, the map keeps adequate height, and users can restore the summary when they need facility counts, population context, or data freshness.

Evidence brief exports include a concise **How to read these metrics** section in Markdown, simple interpretation fields in JSON, and concise CSV notes. All values remain synthetic demonstration data. No real CMS, Census, CDC, SAMHSA, NPPES, backend, database, authentication, AI API, PHI handling, live routing, diversion, bed-status, medical-control guidance, or clinical decision support was added.

## v0.1.8 collapsible metric panels and mobile workspace optimization

Population-health cards now keep a **Quick read** line visible so users can scan metric meaning without opening every explanation. The full **Plain-language meaning** content is collapsed by default behind a touch-friendly button, and the regional summary behaves like an accordion: opening one metric automatically closes any previously open metric explanation. Technical source details, denominator notes, future-definition requirements, and synthetic-data caveats remain available as secondary details.

The mobile workspace is more map-first. The map appears early with useful height, a bottom tab switcher keeps Map / Summary / Facility views reachable, the Filters drawer remains available from the header, and one tap returns users to the map after reviewing summary or facility details. The existing **Hide summary / Show summary** control still works; on desktop it enlarges the map by removing the right summary column, while on mobile it keeps summary access intentional instead of forcing a long stacked page.

StatTerrain remains a frontend prototype with synthetic demonstration data only. This release does not add real CMS, Census, CDC, SAMHSA, NPPES, or other public-data ingestion, and it does not add live routing, diversion status, bed status, medical-control guidance, clinical decision support, backend services, database storage, authentication, AI APIs, or PHI handling.

## v0.1.9 mobile map usability and version-label hotfix

The visible application header now uses the central product configuration and must read **StatTerrain v0.1.9 prototype** for this patch. Every future patch must update the visible top heading/version label to match the patch version using `StatTerrain vX.X.X prototype`, or the equivalent `StatTerrain` product title plus `vX.X.X prototype` version-badge layout.

The mobile map now starts in a cleaner map-first state: the map appears early, the bottom **Map / Summary / Facility** tabs remain reachable, and the map legend is collapsed by default on fresh mobile page loads. A compact **Legend** button opens the key, and an obvious **Hide** control inside the legend collapses it again. The open legend uses shorter mobile copy, keeps marker labels readable, and moves the longer base-map caveat behind a **Map note** disclosure.

StatTerrain remains a synthetic-data frontend prototype. v0.1.9 does not add real CMS, Census, CDC, SAMHSA, NPPES, or other public-data ingestion; does not add live routing, diversion, bed status, or medical-control guidance; and does not add a backend, database, authentication, AI API, or PHI workflow.

## v0.1.10 evidence brief GUI, feedback context, and disclaimer polish

The visible application header uses the central product configuration and now reads **StatTerrain v0.1.10 prototype**. The permanent rule remains: every future patch must update the visible top heading/version label to match the patch version through the central product config.

Evidence brief export actions now use consistent neutral styling until selected. Clicking Markdown, JSON, CSV, or Copy Markdown marks that action active with dark-green selected styling and `aria-pressed`, while other actions return to neutral. The desktop evidence brief drawer no longer includes an embedded **Send Feedback** or duplicate feedback-context copy control, reducing competition with export actions while preserving Markdown, JSON, CSV, and clipboard export behavior.

The standard **Send Feedback** control remains in the app header on desktop and mobile. It opens a `mailto:` addressed to `mathew.h.lowe+statterrain@gmail.com` with the subject **StatTerrain Beta Feedback** and a generated body containing app name, visible version, synthetic-data status, current URL, selected geography, radius, selected facility when available, active mobile tab, summary visibility, evidence brief scope, and a client timestamp. No backend feedback collection, analytics, external forms, database, authentication, or PHI workflow was added.

Mobile map containment was tightened so the Leaflet map is clipped inside its map section, panes stay below non-map UI, bottom tabs remain above the map, and the warning/disclaimer footer remains readable without horizontal overflow. The collapsed mobile legend, internal legend hide control, facility popup, **View details**, and **Hide summary / Show summary** workflows remain available.

Visible disclaimer language was strengthened for prototype safety: StatTerrain is a planning, education, orientation, quality-improvement, and situational-awareness prototype using synthetic demonstration data only. It is not for clinical care, patient-specific decisions, EMS routing, triage, transfers, dispatch, medical control, live diversion, bed availability, or emergency response. Facility capability, operating status, maps, and public-data findings must be verified with official sources. Disclaimer language should be reviewed by qualified legal counsel before external beta or public launch.

v0.1.10 remains GUI, feedback, disclaimer, and version-label refinement only. It does not add real CMS, Census, CDC, SAMHSA, NPPES, or other public-data ingestion; backend services; database storage; authentication; AI APIs; PHI handling; live routing; diversion status; bed status; medical-control guidance; dispatch/triage/transfer recommendations; clinical decision support; or the v0.2.0 public-data pipeline.
