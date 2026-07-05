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
- Filter sidebar: facility types, hospital capabilities, population-health overlay,
  source confidence threshold, and map display toggles.
- Interactive Leaflet/OpenStreetMap map with facility markers, a search-radius circle,
  and choropleth-style overlay polygons for population metrics.
- Regional summary panel with facility counts and population-health metric cards
  (local vs. state vs. national), each carrying confidence/freshness badges.
- Facility detail panel with capability records, per-record source attribution, and
  known limitations.
- Trust layer: every data point exposes its source, freshness, and confidence.
- Evidence-brief generator producing Markdown, JSON, and CSV exports (client-side only).
- Mandatory disclaimer and synthetic-data notice, shown in the footer, facility detail,
  and every exported brief.
- Responsive layout with mobile bottom-tab navigation and slide-in drawers for filters
  and the evidence brief.
- Baseline accessibility: semantic landmarks, focus management in drawers, keyboard
  operable controls, visible focus states, `prefers-reduced-motion` support.

## Explicitly out of scope for v0.1.0

- Any live data source, API integration, authentication, or persistent backend/database.
- Real facility operational status, live diversion/bed availability, or transfer routing.
- Drive-time isochrones (UI is present as a disabled placeholder for a future release).
- Server-side rendering of user-specific state (fully client-rendered, static-data app).

## Definition of done for this prototype

`npm install`, `npm run dev`, `npm run lint`, and `npm run build` succeed with no
Replit-specific configuration, environment variables, or services required. The app
deploys unmodified to Vercel as a static/standard Next.js App Router project.
