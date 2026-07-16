# StatTerrain v0.3.8.6 browser verification and release hardening handoff

**PARTIAL — RELEASE HARDENING COMPLETE, BROWSER EXECUTION BLOCKED**

## Delivered

- Updated visible product version and active version guards to `v0.3.8.6 prototype`.
- Added `GET /api/health`, a minimal local readiness response with only status, product, and version.
- Changed Playwright from the development server to the deterministic production command `npx next start -p 3100 -H 127.0.0.1`; it waits for `/api/health` and uses the same fixed base URL.
- Added a concise, polite live-region data-status line to Area Summary. It reports loading, complete, partial, county-unavailable, hospital-unavailable, and no-mapped-hospital outcomes without claiming live data.
- Added browser readiness coverage for the safe health payload and status live region.

## Production build

`npm run build` completed successfully after the CMS public-asset synchronization step. Next.js completed compilation, lint/type checking, static-page generation, and build tracing. No application warnings were emitted; npm reported an environment `http-proxy` configuration warning.

## Playwright server

A direct production-server check passed: `npx next start -p 3100 -H 127.0.0.1`, followed by `curl http://127.0.0.1:3100/api/health`, returned the expected JSON. It became ready in 694 ms and was terminated cleanly. The previous configuration ran `npm run dev` on port 3000 and had no deterministic health target; this change removes that mismatch.

## Browser verification limitation

The full `npx playwright test` run started the configured server, but browser tests could not launch because the Chromium executable was absent. `npx playwright install chromium` was attempted and the environment returned HTTP 403 from the Playwright CDN. Consequently no browser interaction, network assertion, responsive verification, or screenshots can be claimed. The run recorded 33 non-browser/static tests passed and 41 failed browser tests due solely to the missing executable.

No screenshots were produced or committed. Re-run browser verification in an environment with the Playwright Chromium bundle available, then capture the required desktop, half-width, tablet, and mobile states.

## Regression checks

The required ACS, CMS, planning-location, radius, Evidence Brief/export, layout, panel-replacement, estimate-presentation, and visual-hierarchy Node suites passed. `npm run lint`, `npm run typecheck`, and `git diff --check` passed.

## Remaining limitation

This handoff intentionally does not declare the v0.3.8 prototype fully verified: the external browser-download block must be resolved and the required Playwright matrix/screenshots completed before a COMPLETE declaration.
