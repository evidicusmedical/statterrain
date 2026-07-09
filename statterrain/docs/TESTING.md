# StatTerrain — Testing

This project uses [Playwright](https://playwright.dev) for end-to-end smoke testing.
There is no unit-test framework wired up (no Jest/Vitest) — the app is a thin,
mostly-presentational client over static synthetic data, so a focused e2e smoke
suite gives the highest signal per line of test code.

## What is covered

`tests/smoke.spec.ts` exercises the critical user workflow end-to-end in a real
Chromium browser:

- The home page loads (HTTP < 400) and the product name renders.
- The synthetic-demonstration-data notice and the mandatory disclaimer text are
  visible (see `src/config/product.ts` for the source-of-truth copy).
- The Leaflet map container mounts and renders at least one map tile, with no
  fatal client-side console/page errors.
- All facility categories are selected by default, no population-health overlay is selected by default, and facility-type, hospital-capability, and source-confidence display filters each measurably change the number of visible facilities.
- Selecting a facility marker opens the facility detail panel with a name,
  source list, and confidence information.
- The population-health overlay control can be changed.
- The evidence-brief drawer opens above the Leaflet map, includes the required scope statement, keeps hidden-by-display facility categories in the default brief scope, and all three exports (Markdown, JSON, CSV) can be triggered and produce a file with the expected extension.
- The layout has no horizontal overflow at a common mobile viewport (390×844)
  and remains usable at a tablet viewport (820×1180), including the mobile
  view-switcher navigation and the map/search controls.

This adds up to the 20 required checks from the v0.1.1 test-foundation spec
(page load, disclaimer/notice visibility, map rendering, three filter types,
facility selection + detail content, overlay change, three export formats,
and two responsive-layout checks, each involving multiple assertions).

## Selector strategy

In priority order:

1. **Accessible roles + accessible names** (`getByRole`) — buttons, checkboxes,
   radios, dialogs. This is the most resilient to markup changes and doubles
   as a lightweight accessibility check.
2. **Label text** (`getByText`) — for static, spec-mandated copy that should
   not change casually (disclaimer, synthetic-data notice).
3. **`data-testid`** — used only where an accessible selector would be
   ambiguous or brittle:
   - `map-view` on the `MapView` wrapper (the Leaflet container itself has no
     stable accessible role).
   - `facility-marker facility-marker-<id>` classes on each Leaflet circle
     marker (markers are SVG/canvas elements with no accessible name).
   - `search-location-marker` on the search-result marker.
   - `facility-count-<type>` on each facility-type tile in the regional
     summary panel (the visible text combines a live count with a label, so a
     stable hook is needed to read just the count).
   - `facility-detail-panel` / `facility-detail-name` on the facility detail
     panel (opened by marker selection, not by an accessible trigger).

If you add new interactive UI, prefer adding an accessible name (a `<label>`,
`aria-label`, or visible text tied to a role) over reaching for `data-testid`.

## Running the tests locally

```bash
cd statterrain
npm install
npx playwright install chromium   # first run only; downloads the browser
npm run test:e2e                  # headless run against a dev server
npm run test:e2e:ui               # interactive Playwright UI mode
npm run test:e2e:report           # open the last HTML report
```

`playwright.config.ts` starts `npm run dev` automatically (via `webServer`) if
port 3000 is not already serving the app, and reuses an already-running dev
server outside of CI. You do not need to start the dev server manually first.

### Replit-specific note

`npx playwright install --with-deps chromium` fails in this Replit environment
because the container has no `apt`/`sudo` access, which Playwright's installer
depends on for its own dependency install step. Use `npx playwright install
chromium` (without `--with-deps`) instead, and ensure the underlying shared
libraries Chromium needs (glib, nss, nspr, dbus, at-spi2-atk, gtk3, pango,
cairo, mesa, the relevant Xorg libs, etc.) are present via the Nix package
manager. This is already handled in this workspace. On a standard Linux CI
runner (including the GitHub Actions workflow in this repo) or a normal
developer machine, `npx playwright install --with-deps chromium` works as
documented upstream and this workaround is unnecessary.

## Continuous integration

`.github/workflows/ci.yml` (at the repository root) runs on every push and
pull request that touches `statterrain/**`: install, lint, typecheck, build,
then install Playwright's Chromium browser and run the smoke suite. The HTML
report is uploaded as a build artifact on every run (pass or fail) for
debugging failures without needing local reproduction.

## Adding new tests

- Keep new smoke tests in `tests/smoke.spec.ts` unless the suite grows large
  enough to warrant splitting by feature area (filters, export, responsive).
- Prefer asserting on user-visible behavior (text, visibility, counts) over
  implementation details (internal state, class names beyond the stable
  testids listed above).
- If a new synthetic data field is added, and a test needs to reference a
  specific record, add a `const SAMPLE_..._ID = "..."` constant at the top of
  the spec file (see `SAMPLE_FACILITY_ID`) rather than hard-coding IDs inline.

## v0.1.4 Playwright coverage

The smoke suite now verifies that selecting a facility opens the standardized facility detail panel and shows the required sections: Facility identity, Capability summary, Contact and access information, Source and data quality, and Known limitations. It also checks synthetic-data labeling, unavailable-data language, category explanation access, and hospital capability glossary access.

Evidence brief tests continue to verify the v0.1.3 behavior: the default brief remains geography-based, includes the scope statement, and is not silently narrowed by map display filters. Markdown, JSON, and CSV export checks remain in the end-to-end workflow, along with mobile viewport usability coverage.

## v0.1.5 test coverage

The Playwright smoke suite covers the v0.1.5 beta-readiness additions: population metric definition details, pediatric and poverty caveats, SVI caveat, synthetic source/freshness inventory, OpenStreetMap base-map note, Send Feedback mailto target, copy-feedback-context behavior, evidence brief opening, v0.1.3 scope preservation, v0.1.4 facility-detail sections, Markdown/JSON/CSV exports, and mobile usability.

## v0.1.6 test coverage

The Playwright smoke suite now checks that expanded population-health definitions are accessible from metric cards, including pediatric age-band uncertainty, poverty source-definition caveats, limited English proficiency, no-vehicle access, chronic disease population-level caveats, SVI non-clinical/non-danger/non-individual-risk warning, and rurality classification-system disclosure. Existing checks continue to cover synthetic data freshness/source inventory, feedback, evidence brief v0.1.3 scope, v0.1.4 facility-detail sections, Markdown/JSON/CSV exports, and mobile viewport usability.

## v0.1.7 test coverage

The smoke suite now checks the plain-language metric layer: visible **What it is** text, pediatric children/age-range wording, poverty income-related barriers, LEP interpreter or translated communication needs, no-vehicle transportation barriers and ambulance-availability warning, chronic-disease non-diagnosis language, SVI non-crime/non-danger/non-clinical-risk warning, and rurality higher-value distance-from-care interpretation. It also checks that evidence brief exports expose plain-language metric interpretation, the summary column can be hidden and restored, the map remains available after collapse, data freshness returns when the summary is shown, and mobile controls remain usable without trapping essential map, summary, evidence brief, facility detail, export, or feedback workflows.

## v0.1.8 test coverage

The Playwright smoke suite now verifies quick-read metric lines, collapsed-by-default plain-language meaning panels, accordion behavior that allows only one expanded metric explanation at a time, collapse-on-second-click behavior, and preservation of pediatric age-range, poverty barrier, and SVI not-crime/not-danger/not-clinical-risk language when expanded. Responsive tests cover the map-first mobile workspace, bottom Map / Summary / Facility tabs, reachable Filters drawer, mobile return-to-map flow, non-expanded mobile metric explanations, and continued desktop summary collapse / map-enlargement behavior. Existing checks continue to cover app load, v0.1.3 evidence brief scope, v0.1.4 standardized facility detail sections, v0.1.5 data freshness/source inventory and feedback button, synthetic-data warnings, no population overlay by default, base-map source note, and Markdown/JSON/CSV exports.

## v0.1.9 test coverage

The Playwright smoke suite verifies the v0.1.9 header/version label, mobile legend collapsed-by-default behavior, legend open/collapse controls, reduced default mobile legend footprint, desktop legend discoverability, map-first mobile workspace availability, bottom Map / Summary / Facility tabs, summary Hide/Show behavior, quick-read metric lines, collapsed metric meaning panels and accordion behavior, mobile facility popup usability with reachable **View details**, evidence brief v0.1.3 scope preservation, v0.1.5 data freshness/source inventory, feedback link, Markdown/JSON/CSV exports, no horizontal overflow on a common mobile viewport, and desktop summary collapse/map enlargement.

Testing remains scoped to the synthetic-data frontend prototype. The suite does not validate real CMS, Census, CDC, SAMHSA, NPPES, routing, diversion, bed-status, medical-control, backend, database, authentication, AI API, or PHI workflows because those capabilities are intentionally out of scope.

## v0.1.10 test coverage

The Playwright smoke suite verifies the v0.1.10 visible header/version label, strengthened disclaimer text, evidence brief v0.1.3 scope preservation, neutral-by-default evidence brief action styling via `aria-pressed`, dark-green active-selection behavior for Markdown/JSON/CSV/Copy actions, and continued Markdown/JSON/CSV download behavior. It also verifies that **Send Feedback** is not embedded in the desktop evidence brief drawer, remains reachable in the intended header location on desktop and mobile, and uses the standard `mathew.h.lowe+statterrain@gmail.com` mailto with embedded app/version/context body fields.

Responsive coverage continues to check no horizontal overflow on a common mobile viewport, mobile collapsed legend behavior, legend open/hide behavior, facility popup fit, reachable **View details**, bottom Map / Summary / Facility tabs, **Hide summary / Show summary**, quick-read metric lines, collapsed-by-default metric meaning panels, accordion behavior, and data freshness/source inventory. The mobile map containment fix is covered by the overflow check and by continued visibility of warning/disclaimer text outside the map.

Testing remains scoped to the synthetic-data frontend prototype. The suite does not validate real CMS, Census, CDC, SAMHSA, NPPES, routing, diversion, bed-status, medical-control, backend, database, authentication, AI API, PHI, public-data refresh, or clinical decision-support workflows because those capabilities remain intentionally out of scope.

## v0.1.11 test coverage

The Playwright smoke suite verifies the v0.1.11 visible header/version label, the mobile **Map / Summary / Facility** tab bar, solid tab-bar background/stacking above Leaflet panes, map containment without visual overlap into the tab bar, and visible map attribution inside the map area. Responsive coverage verifies the collapsed mobile legend default, legend open/hide behavior, restored mobile Summary tab content including facilities, population context, and data freshness/source inventory, helpful Facility empty state, automatic Facility tab selection after tapping a map marker, full-width readable mobile Facility details, and continued compact popup **View details** behavior.

Regression coverage continues for evidence brief v0.1.3 scope text, v0.1.10 evidence action active styling, Send Feedback mailto context, quick-read metric lines, collapsed-by-default metric meaning panels and accordion behavior, no horizontal overflow on a common mobile viewport, and desktop summary collapse/map-enlargement behavior. No tests add or require real public data, backend, database, authentication, AI API, or PHI handling.

## v0.2.0 public-data framework checks

Run the public-data scaffold checks from `statterrain/`:

```bash
npm run data:validate-sources
npm run data:refresh-report
```

Also verify lint, typecheck, build, and e2e smoke tests. The source registry validation confirms unique IDs, planned/not-yet-ingested status, `usedInCurrentApp: false`, no successful refreshes, and no active real-ingested public data. The refresh report confirms no external fetches and no generated public records are active.

## v0.2.2 CMS hospital baseline pilot

v0.2.2 adds the first real public-data ingestion pilot for CMS Hospital General Information, the top hospital source identified in the v0.2.1 benchmark. The pull script reads the benchmark, resolves the CMS dataset endpoint when the benchmark download URL is still `TBD`, writes raw snapshot metadata, and either normalizes/generates CMS hospital records or records a fetch-failed refresh report without creating fake records.

The current run in this environment was fetch-blocked, so no generated CMS hospital records were published. Reports are stored in `data/reports/cms-hospitals-validation-v0.2.2.json` and `data/reports/cms-hospitals-refresh-v0.2.2.json`; raw metadata is stored in `data/raw/cms-hospitals/cms-hospitals-raw-metadata-v0.2.2.json`. If a connected environment fetch succeeds, normalized output goes to `data/normalized/cms-hospitals/cms-hospitals-normalized-v0.2.2.json`, generated output goes to `data/generated/cms-hospitals.generated.json`, and passing validation updates `data/last-known-good/cms-hospitals.generated.json`.

The main app remains synthetic by default and the CMS pilot does not power the main map. Coordinates may be missing because geocoding is explicitly deferred to v0.2.3. Emergency-services and critical-access labels are source-supported only. No patient-level data, claims data, PHI, live routing/diversion/bed status, or clinical decision support is added. The next patch should be v0.2.3 Facility Geocoding and Geography Join.
