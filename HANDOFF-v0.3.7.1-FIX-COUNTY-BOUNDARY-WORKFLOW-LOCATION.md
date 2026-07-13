# StatTerrain v0.3.7.1 — Fix County Boundary Workflow Location

- Branch: `v0.3.7.1-fix-county-boundary-workflow-location`
- Version: `v0.3.7.1 prototype`
- Completion declaration: **COMPLETE — COUNTY BOUNDARY WORKFLOW DISCOVERABLE**

## Summary

This patch moves the County Boundary National Build workflow from the nested application directory to the repository-root GitHub Actions workflow directory so GitHub can discover and display it in the Actions menu.

## Changes

- Moved `statterrain/.github/workflows/county-boundary-national-build.yml` to `.github/workflows/county-boundary-national-build.yml`.
- Removed the nested workflow copy; the workflow is not duplicated.
- Preserved the workflow name: `County Boundary National Build`.
- Preserved workflow inputs and behavior:
  - `target_branch`
  - `boundary_vintage`
  - `commit_generated_artifacts`
  - `auto_merge`
  - Node 24 setup
  - generated-data commit guard using `commit_generated_artifacts && !auto_merge`
  - explicit no-auto-merge assertion
  - boundary build and validation
  - national coverage checks
- Preserved the application working directory for npm/script steps as `statterrain`.
- Updated the visible prototype version to `v0.3.7.1 prototype`.
- Updated active version tests to expect `v0.3.7.1 prototype`.

## Verification Notes

- `.github/workflows/county-boundary-national-build.yml` exists.
- `statterrain/.github/workflows/county-boundary-national-build.yml` does not exist.
- Workflow YAML parses.
- Workflow name is exactly `County Boundary National Build`.
- No ACS population build workflow logic was introduced.

## Completion

COMPLETE — COUNTY BOUNDARY WORKFLOW DISCOVERABLE
