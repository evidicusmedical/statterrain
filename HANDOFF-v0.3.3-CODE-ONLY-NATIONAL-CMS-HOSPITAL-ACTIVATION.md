# HANDOFF — v0.3.3 Code-Only National CMS Hospital Activation

## 1. Patch identification
StatTerrain v0.3.3 prototype code-only activation patch.

## 2. Objective
Activate the already-merged national CMS hospital map-ready artifacts as the normal hospital source without rebuilding or modifying generated national data.

## 3. Existing national-data baseline
Baseline remains the merged PR #38 national dataset: 5,432 CMS source/normalized records, 4,505 map-ready records, 927 excluded records, 52 state/territory partitions, and completed national validation. No national data build was performed.

## 4. Scope completed
Updated visible version, added ignored public asset synchronization, added browser partition loading, made CMS hospitals the default normal source, and added focused tests.

## 5. Public-asset synchronization
`npm run data:sync-national-cms-hospital-public-assets` copies only manifest, summary, and state/territory partition JSON from `data/generated/cms-hospitals-national/` into ignored `public/generated/cms-hospitals-national/` after cleaning stale files.

## 6. Partition loader
The client fetches the public manifest and only requested state/territory partitions, caches loaded partitions in memory, deduplicates by CMS source facility ID, and reports success, partial-failure, or error.

## 7. Real-data activation
Normal hospital results now come from CMS map-ready public-data records with final Haversine radius filtering.

## 8. Preview retirement
The five-record CMS preview artifact is no longer the active app data path, and no preview toggle is required for normal hospital results.

## 9. Synthetic fallback behavior
CMS load failures do not substitute synthetic facilities. The required user-facing failure copy is preserved for error handling.

## 10. Tests
Focused loader/sync tests use tiny mocked data and do not duplicate the national dataset.

## 11. Commands
Required validation commands are documented in the PR and final report. Prohibited national build commands were not run.

## 12. Diff-size verification
Diff checks confirmed no generated national source data, copied public partitions, binary files, or minified assets were staged.

## 13. Known limitations
State selection is deterministic and bounded using state hints/adjacency, with a documented bounded fallback when state metadata is unavailable. Full synthetic demo UX isolation is deferred.

## 14. Rollback
Disable the prebuild sync script, remove the loader integration, and restore v0.3.2.4 behavior if rollback is required. Generated public copies are ignored and may be deleted safely.

## 15. Recommended next patch
v0.3.3.1 — Synthetic Demo Isolation and Real-Data UI Cleanup

## 16. Completion declaration
COMPLETE — NATIONAL CMS HOSPITAL CODE ACTIVATION READY
