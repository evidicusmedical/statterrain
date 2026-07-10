# StatTerrain v0.3.2.4 — National CMS Validator and Failed-Run Artifact Recovery

Completion declaration: **COMPLETE — NATIONAL VALIDATOR AND ARTIFACT RECOVERY HOTFIX READY**

Do **not** declare `COMPLETE — NATIONAL CMS HOSPITAL NETWORK BUILT` until the GitHub Actions workflow is rerun, the national validator passes, and the actual generated artifacts are committed.

## Confirmed build facts from the failed GitHub Actions run

These values came from the visible national build log and are included for handoff context only; they are not hard-coded permanent source-release expectations.

- Official CMS source rows: 5,432
- Normalized rows: 5,432
- Pagination pages: 6
- Pagination complete: true
- Geocoding chunks processed: 55 of 55
- Map-ready records: 4,505
- Excluded records: 927
- Failure point: `npm run data:validate-cms-hospitals`
- Observed insufficient output: `CMS hospital validation: FAIL` and `Records: 4505`

## What changed

- Visible version updated to `v0.3.2.4 prototype`.
- CMS hospital validation now supports deterministic `auto`, `preview`, and `national` modes.
- Auto mode validates the national contract when `data/generated/cms-hospitals-national/manifest.json` exists; otherwise it falls back to legacy preview validation.
- National validation writes `data/reports/cms-hospitals-national-validation-v0.3.2.4.json` on PASS and FAIL when artifacts are readable.
- Validation failures now print rule IDs, artifact paths, expected values, actual values, affected counts, and remediation guidance.
- Workflow uploads interim and final generated national artifacts with `if: always()` so late validation failures preserve build output for inspection/recovery.
- Commit/push of generated data remains guarded behind successful validation and never targets `main`.
- Builder geocoding run reporting now exposes cache hits, new addresses, resumed chunks, and repeated external request counts.

## National artifact contract documented from the builder

- National manifest: `data/generated/cms-hospitals-national/manifest.json`
- National summary: `data/generated/cms-hospitals-national/summary.json`
- State partitions: `data/generated/cms-hospitals-national/states/{STATE}.json`
- Excluded records: `data/generated/cms-hospitals-national/excluded-records.json`
- Unmatched records: `data/generated/cms-hospitals-national/unmatched-records.json`
- Normalized artifact: `data/normalized/cms-hospitals/cms-hospitals-normalized-v0.3.2.json`
- National generated normalized copy: `data/generated/cms-hospitals-national-v0.3.2.json`
- App map-ready artifact: `data/generated/cms-hospitals.generated.json`
- Geocoding input: `data/generated/geocoding-inputs/cms-hospitals-national-geocoding-input-v0.3.2.json`
- Geocoding cache: `data/generated/geocoding-cache/cms-hospitals-geocoding-cache.json`
- Geocoding chunks: `data/generated/geocoding-chunks/cms-hospitals-v0.3.2/chunk-###.json`
- Geocoding run report: `data/reports/cms-hospitals-geocoding-run-v0.3.2.json`
- Geography report: `data/generated/geocoding-results/cms-hospitals-geography-join-v0.3.2.json`
- National QA report: `data/reports/cms-hospitals-national-quality-v0.3.2.json`
- Pull/pagination report: `data/reports/cms-hospitals-national-pull-v0.3.2.json`
- Source coverage manifest: `data/generated/source-coverage-manifest.json`
- Artifact manifest: `data/generated/artifact-manifest.json`
- National validation report: `data/reports/cms-hospitals-national-validation-v0.3.2.4.json`

## Recovery procedure for a failed future run

1. Open the failed workflow run.
2. Download artifact `cms-hospital-national-build-${run_id}-${run_attempt}` or the interim artifact.
3. Copy recovered generated data into `v0.3.2.4-national-cms-hospital-generated-data`, especially:
   - `statterrain/data/generated/geocoding-cache/cms-hospitals-geocoding-cache.json`
   - `statterrain/data/generated/geocoding-chunks/cms-hospitals-v0.3.2/**`
   - relevant `statterrain/data/reports/**`
4. Commit only reviewable generated recovery artifacts to that feature branch if safe.
5. Re-run the workflow. The builder should reuse valid cache entries and only geocode missing/changed/retryable records.

The prior failed run did not upload these artifacts, so this hotfix does not claim prior cache recovery.

## Rerun instructions after merge

Keep branch `v0.3.2.4-national-cms-hospital-generated-data`. Update it from latest `main`, then run:

- Actions → CMS Hospital National Build → Run workflow
- Workflow source: `main`
- Target branch: `v0.3.2.4-national-cms-hospital-generated-data`
- Geocoding mode: `complete`
- Commit generated artifacts: `true`
- Auto merge: `false`

Expected behavior:

- Reuse any valid cache already present; otherwise rebuild.
- Preserve artifacts even on late validation failure.
- Print exact validator rule errors.
- Commit generated artifacts only after safe validation.

## Node warning status

Keep `FORCE_JAVASCRIPT_ACTIONS_TO_NODE24=true`. Do not set `ACTIONS_ALLOW_USE_UNSECURE_NODE_VERSION=true`. The Node-20-based `actions/checkout@v4` / `actions/setup-node@v4` warning is not the CMS validator failure.

## Safety confirmations

- No national data was fabricated in this hotfix.
- No patient-level, claims, PHI, routing, diversion, bed-status, or live operational data was added.
- CMS dialysis remains fixture-only/not map-ready.
- Unsupported hospital capabilities remain hidden.
- No v0.3.3 work began.
