# StatTerrain v0.3.7.3 — Restore County Boundary Manual Workflow

Branch: `v0.3.7.3-fix-county-boundary-workflow-schema`

## Summary

This patch restores the repository-root GitHub Actions workflow at `.github/workflows/county-boundary-national-build.yml` to a conservative, GitHub-valid manual `workflow_dispatch` configuration that should display in Actions as `County Boundary National Build` with a visible `Run workflow` button on `main` after merge.

## Key changes

- Simplified the county boundary national build workflow schema to manual dispatch only.
- Removed risky step-level boolean expressions such as `!inputs.auto_merge`.
- Moved final workflow summary generation into `statterrain/scripts/public-data/write-county-boundary-workflow-summary.mjs`.
- Ensured application run steps explicitly use `working-directory: statterrain` without job-wide defaults.
- Added workflow regression coverage for the manual trigger, exact workflow name, forbidden automatic triggers, risky expressions, embedded summary heredoc expressions, undefined step outputs, and working-directory expectations.
- Updated the visible product version to `v0.3.7.3 prototype`.

## Completion declaration

COMPLETE — COUNTY BOUNDARY WORKFLOW VALID AND MANUALLY RUNNABLE
