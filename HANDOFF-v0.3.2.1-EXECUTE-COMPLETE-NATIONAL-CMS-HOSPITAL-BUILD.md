# StatTerrain v0.3.2.1 — Execute and Complete National CMS Hospital Build Handoff

## 1. Patch identification
- Branch: `v0.3.2.1-execute-complete-national-cms-hospital-build`
- Base branch: `main`
- Release classification: data-execution and release-completion patch
- Version set in app config: `v0.3.2.1 prototype`

## 2. Completion declaration
**BLOCKED — NATIONAL BUILD INCOMPLETE**

The GitHub-hosted national build could not be dispatched from this Codex workspace because the checkout has no `origin` remote and the GitHub CLI is not installed/authenticated. A local attempt to run the national CMS pull also failed DNS resolution for `data.cms.gov`, so this handoff does not claim national completion and does not start v0.3.3.

## 3. Workflow execution
- Workflow inspected and hardened: `.github/workflows/cms-hospital-national-build.yml`
- Manual trigger retained: `workflow_dispatch`
- Target branch input defaults to `v0.3.2.1-execute-complete-national-cms-hospital-build`
- Protected branches `main` and `master` are refused.
- `auto_merge` is a guarded false-only input; the workflow does not merge.
- The workflow installs dependencies, runs the national CMS build, rebuilds manifests, validates artifacts and app checks, writes a job summary, and commits generated artifacts back to the target branch when requested.

Required manual action once this branch exists on GitHub:

```bash
gh workflow run cms-hospital-national-build.yml \
  --ref v0.3.2.1-execute-complete-national-cms-hospital-build \
  -f target_branch=v0.3.2.1-execute-complete-national-cms-hospital-build \
  -f geocoding_mode=complete \
  -f commit_generated_artifacts=true \
  -f auto_merge=false
```

Use the GitHub Actions UI if `gh` is unavailable: Actions → CMS Hospital National Build → Run workflow.

## 4. Official source
- Intended source: CMS Hospital General Information
- Dataset ID: `xubh-q36u`
- Agency: Centers for Medicare & Medicaid Services
- Completion status: not retrieved in this workspace.

## 5. Pull results
- Workflow run URL: unavailable; dispatch blocked by missing remote/CLI.
- Raw source count: unavailable.
- Source retrieval timestamp: unavailable.

## 6. Normalization
Not completed for v0.3.2.1 artifacts in this workspace.

## 7. Deduplication
Not completed for v0.3.2.1 artifacts in this workspace.

## 8. Geocoding inputs
Not regenerated from a successful v0.3.2.1 national source pull in this workspace.

## 9. Cache population
Not completed; no successful national geocoding run occurred here.

## 10. Chunk execution
Not completed; no GitHub Actions run was available to execute all chunks.

## 11. Geography joins
Not completed for v0.3.2.1 national artifacts.

## 12. QA/exclusions
Not completed for v0.3.2.1 national artifacts.

## 13. National partitions
Not completed for v0.3.2.1 national artifacts.

## 14. Application integration
Version was updated to `v0.3.2.1 prototype`. National map activation remains blocked until actual generated artifacts exist.

## 15. Evidence/export
No national evidence/export completion is claimed because national artifacts were not generated.

## 16. Refresh workflow
The hardened manual workflow remains the intended reusable refresh path: run quarterly or on demand, pull the official source, preserve cache hits, geocode new/changed/unresolved addresses, validate, commit to a review branch, and never auto-merge.

## 17. Files changed
- `.github/workflows/cms-hospital-national-build.yml`
- `statterrain/src/config/product.ts`
- `statterrain/tests/public-data-registry.spec.ts`
- `HANDOFF-v0.3.2.1-EXECUTE-COMPLETE-NATIONAL-CMS-HOSPITAL-BUILD.md`
- `statterrain/docs/handoffs/HANDOFF-v0.3.2.1-EXECUTE-COMPLETE-NATIONAL-CMS-HOSPITAL-BUILD.md`

## 18. Commands
Commands attempted from the app directory include:
- `npm ci`
- `npm run data:build-national-cms-hospitals`

Commands attempted from the repo root include:
- `git checkout -b v0.3.2.1-execute-complete-national-cms-hospital-build`
- `gh --version`
- `git remote get-url origin`

## 19. Tests
- `npm ci` passed with npm deprecation warnings.
- `npm run data:build-national-cms-hospitals` failed with `getaddrinfo EAI_AGAIN data.cms.gov`.
- Full release validation was not run because national data generation was blocked.

## 20. Known limitations
- No GitHub remote is configured in this workspace.
- `gh` is unavailable.
- Local DNS resolution to `data.cms.gov` failed.
- No actual national CMS counts are available from this patch.

## 21. Scope control
- v0.3.3 was not started.
- No synthetic records were promoted as real national data.
- No patient-level, claims, PHI, live operational, routing, ETA, diversion, or bed-status fields were added.

## 22. Rollback
Revert this patch to restore the prior v0.3.2 visible version and workflow behavior. Do not delete any future successful generated artifacts unless they fail validation.

## 23. Recommended next patch
Do not begin v0.3.3 while blocked. First run the hardened workflow on GitHub Actions against `v0.3.2.1-execute-complete-national-cms-hospital-build`, ingest the generated commit, validate actual artifacts, complete map/evidence integration, and update this handoff with real counts.
