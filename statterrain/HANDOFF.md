# StatTerrain — Project Handoff / Export Summary

Use this document to onboard another model or engineer to this codebase without
needing to re-derive context from scratch.

## 1. What this is

**StatTerrain** is a polished, fully portable **frontend-only prototype** (v0.1.0)
for emergency-care / population-health mapping. It targets emergency and EMS
clinicians, medical directors, quality-improvement teams, and regional planners who
need a fast visual orientation to nearby facilities, publicly documented
capabilities, and population-health context for a region.

**Hard constraints that shaped every decision:**
- Next.js App Router + TypeScript + Tailwind CSS + Leaflet/react-leaflet + OSM tiles.
- 100% static/synthetic demo data. No live APIs, no backend, no database, no auth.
- Must run standalone: `npm install && npm run dev / lint / build` with **zero**
  Replit-specific dependencies and **zero** required environment variables.
- Must deploy unmodified to Vercel.
- Mandatory exact disclaimer + synthetic-data-notice wording (see `src/config/product.ts`),
  surfaced in the footer, facility detail panel, and every evidence-brief export.

## 2. Repository / environment status (as of this handoff)

- GitHub repo: `https://github.com/evidicusmedical/statterrain` (origin, connected and pushed)
- Branch: `main` (the spec originally called for `v0.1.0-static-prototype`; the user
  created and pushed to `main` directly — confirm with the user before assuming a
  feature branch is still needed)
- Latest commit: `dae0f84` — "Add a portable frontend prototype for emergency care
  resource mapping"
- Verified working commands (all run from `statterrain/`, NOT the repo root):
  ```bash
  npm install   # 395 packages, no errors
  npm run lint  # ✔ No ESLint warnings or errors
  npm run build # ✓ Compiled successfully, static pages generated (103 kB first load JS)
  npm run dev   # runs on :3000, confirmed HTTP 200 with correct rendered content
  ```
- Location: `statterrain/` at the root of a larger Replit pnpm-workspace monorepo,
  but **deliberately excluded** from `pnpm-workspace.yaml` globs so it remains a
  pure, portable `npm`-managed project. Do not move it under `artifacts/`, `lib/`,
  or `scripts/`, and do not add it to the pnpm workspace — that would break
  portability to Vercel.
- A Replit workflow named `StatTerrain` (`cd statterrain && npm run dev`, port 3000,
  webview) exists for local preview only — it is not part of the shipped project and
  has no effect on `npm run dev`/build/deploy elsewhere.

## 3. Tech stack

- Next.js 14.2.35 (App Router), React 18.3.1, TypeScript (strict mode)
- Tailwind CSS 3.4 (custom `terrain`/`clinical`/`alert` color palette in
  `tailwind.config.ts`)
- Leaflet 1.9 + react-leaflet 4.2, OpenStreetMap tiles (no API key required)
- ESLint (`eslint-config-next`)
- No state management library — a single custom hook (`useAppState`) holds all
  client state.
- No test framework is currently wired up.

## 4. Architecture overview

```
src/
  app/                    Next.js App Router entry
    layout.tsx             Root layout, imports leaflet.css + globals.css, sets metadata
    page.tsx                Main page: assembles header, sidebar, map, summary,
                             detail panel, mobile tabs, drawers
    globals.css             Tailwind directives + a few global resets
  components/
    layout/                Header (search + brief trigger), Footer (disclaimer)
    filters/                FilterSidebar (facility types, capabilities, overlay,
                             confidence, display toggles, radius)
    map/                    MapView (actual Leaflet map, client-only),
                             MapViewClient (dynamic import wrapper, ssr:false),
                             MapLegend, mapStyles (marker colors, overlay color scale)
    facilities/             FacilityDetailPanel
    regional-summary/       RegionalSummaryPanel, SummaryCard
    evidence/               EvidenceBriefDrawer (MD/JSON/CSV export UI)
    sources/                SourceCard (source attribution display)
    ui/                     Badge (Confidence/Freshness/Synthetic), Drawer (mobile
                             slide-in panel w/ focus trap + Escape), Collapsible
  config/
    product.ts              SINGLE SOURCE OF TRUTH for product name, tagline,
                             disclaimer, synthetic-data notice. Never hard-code this
                             text elsewhere — import from here.
  data/                     All synthetic demo data (see section 5)
  hooks/
    useAppState.ts           Central client state: location, radius, filters,
                             selected facility, drawer open/closed states; computes
                             visible facilities via haversine distance + filter logic
  lib/
    format.ts                Number/percent/date formatters
    export.ts                Builds Markdown/JSON/CSV evidence briefs + triggers
                             browser download via Blob/URL (no server involved)
    planning-considerations.ts  Static list of orientation prompts shown in the
                             regional summary and evidence brief
  types/
    facility.ts               FacilityType, CapabilityName, CapabilityRecord, Facility
    source.ts                  ConfidenceLevel, FreshnessStatus, SourceRecord (+ label maps)
    metric.ts                  OverlayMetricId, PopulationMetric, Comparison
    evidence.ts                PlanningConsideration, EvidenceBrief
docs/                       PRODUCT_SCOPE, DATA_SOURCE_PLAN, VERCEL_DEPLOYMENT,
                             FUTURE_REFRESH_ARCHITECTURE, BRAND_AND_NAMING
```

### Key design decisions worth preserving

- **Deterministic pseudo-random data**: `src/data/facilities.ts` uses a hand-rolled
  `seededValue(id, min, max)` hash function instead of `Math.random()` for
  demonstration distance/drive-time values. This was a deliberate fix — `Math.random()`
  in static data caused SSR/hydration mismatches in Next.js (server and client
  render different values). Any new synthetic numeric data should follow the same
  deterministic pattern.
- **Leaflet requires `ssr: false`**: `MapView.tsx` is the real Leaflet component;
  `MapViewClient.tsx` wraps it in `next/dynamic(..., { ssr: false })` because Leaflet
  touches `window`/`document` at import time and breaks SSR otherwise.
- **Every fact carries provenance**: `Facility`, `CapabilityRecord`, `PopulationMetric`,
  and `SourceRecord` all carry `confidence`, `freshness`, and `isSynthetic: true`
  fields. The `ConfidenceBadge`/`FreshnessBadge` components in `ui/Badge.tsx` render
  these consistently everywhere. Preserve this pattern for any new data field.
- **Centralized product config**: `src/config/product.ts` holds the name, tagline,
  disclaimer, and synthetic-data-notice text verbatim from the original spec. All
  UI surfaces (footer, facility detail, evidence brief) import from here rather than
  hard-coding strings, so a rename or copy change only touches one file.
- **Client-side-only evidence export**: `lib/export.ts` has no server dependency —
  it builds Markdown/JSON/CSV strings in-memory and downloads them via
  `Blob`/`URL.createObjectURL`. This keeps the "no backend" constraint intact even
  for the export feature.

## 5. Data model summary (all synthetic, `isSynthetic: true` everywhere)

- **`src/data/sources.ts`** — 9 source records modeled after real dataset families
  (CMS Provider Data Catalog, NPPES/NPI, Census ACS, CDC PLACES, CDC/ATSDR SVI, USDA
  RUCA, SAMHSA FindTreatment, state trauma registry, state stroke/STEMI registry).
- **`src/data/facilities.ts`** — 31 facilities: 8 hospitals (varying trauma/stroke/
  STEMI/pediatric/OB/burn/critical-access capability mixes), 10 pharmacies, 3
  dialysis centers, 6 nursing homes, 4 behavioral-health facilities (2 flagged
  `behavioral_health_receiving`). Each hospital's capabilities cite a distinct
  source record with its own confidence/freshness.
- **`src/data/population-metrics.ts`** — 11 overlay metrics (age 65+, pediatric
  population, poverty, limited English, no vehicle, COPD, coronary heart disease,
  stroke prevalence, poor mental health, social vulnerability, rurality), each with
  local/state/national comparison values.
- **`src/data/map-regions.ts`** — 7 polygon regions with per-overlay intensity
  values (0–1) driving the choropleth-style overlay coloring on the map.
- **`src/data/demo-region.ts`** — the fictional "Terrace Basin" region: 6 searchable
  locations (hospital/city/ZIP/county/address types), radius options (25/50/100 mi),
  and drive-time options (UI present but disabled — planned, not implemented).

## 6. Feature completeness vs. spec

**Completed:**
Header w/ search + geography controls, filter sidebar (facility types, capabilities,
population overlay, confidence threshold, display toggles), interactive Leaflet map
with markers/radius/choropleth/legend, regional summary panel, facility detail panel,
full source/freshness/confidence trust layer, evidence-brief generator (Markdown/
JSON/CSV export), mandatory disclaimer text across all surfaces, full docs set,
responsive layout with mobile bottom-tab nav + slide-in drawers, baseline
accessibility (semantic landmarks, focus trapping in drawers, keyboard operability,
visible focus states, `prefers-reduced-motion` support).

**Explicitly out of scope (by design, documented in `docs/PRODUCT_SCOPE.md`):**
- Drive-time isochrones (disabled placeholder UI only)
- Any live API/backend/database/auth
- Real facility operational status, live diversion/bed availability, transfer routing

## 7. Known follow-ups / open items

- No automated test suite exists yet (no Playwright/Jest wiring). If continuing
  work, consider adding component or e2e tests before further feature growth.
- The spec originally requested branch name `v0.1.0-static-prototype`; the actual
  push landed on `main`. Confirm with the user whether a separate versioned branch
  is still wanted.
- `docs/FUTURE_REFRESH_ARCHITECTURE.md` sketches a path to real data ingestion but
  is intentionally unimplemented — useful starting point if real-data work begins.
- Two moderate/high npm audit advisories exist in transitive dependencies (surfaced
  during `npm install`); not investigated further since this is a static-data
  frontend prototype with no server attack surface, but worth a look before any
  production use beyond a demo.

## 8. How to resume work

1. `cd statterrain && npm install && npm run dev` — starts local dev server on :3000.
2. Read `src/config/product.ts` first for all branding/legal copy.
3. Read `src/types/*.ts` for the full data contracts before touching `src/data/*`.
4. Any new numeric "random-looking" demo value must go through a deterministic
   helper like `seededValue` in `src/data/facilities.ts` — never `Math.random()`.
5. Run `npm run lint && npm run build` before considering any change done.
