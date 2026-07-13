# StatTerrain v0.3.7.4 — Add County Boundary Runtime Dependencies

Branch: `v0.3.7.4-add-county-boundary-runtime-dependencies`
Base branch: `main`
Do not auto-merge.

## Summary

This patch declares the County Boundary National Build shapefile parser as an explicit runtime dependency so GitHub Actions can install it through `npm ci` from the committed lockfile. The workflow now verifies that `shapefile` can be imported immediately after dependency installation and before the live national boundary build runs.

## Completed changes

- Added `shapefile` as a normal StatTerrain dependency.
- Updated `package-lock.json` to include `shapefile` and its transitive runtime packages.
- Inspected `scripts/public-data/build-county-boundaries.mjs`; its only external dynamic runtime import is `shapefile`. ZIP extraction continues to use the system `unzip` command, and no unused packages were added.
- Added a County Boundary National Build workflow preflight after `npm ci`:
  - `node -e "import('shapefile').then(()=>console.log('shapefile dependency available'))"`
- Added runtime dependency guard tests covering package manifest declaration, package-lock entries, build-script runtime imports, workflow `npm ci` ordering, absence of dynamic package installation, workflow preflight, and untracked `node_modules`.
- Updated the visible product version to `v0.3.7.4 prototype` and refreshed version guard tests.

## Completion declaration

COMPLETE — COUNTY BOUNDARY RUNTIME DEPENDENCIES INSTALLED
