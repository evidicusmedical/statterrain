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
