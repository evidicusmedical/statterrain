# StatTerrain v0.3.2.2 — CMS API Pagination and National Build Retry

Completion declaration for this code hotfix:

**COMPLETE — CMS PAGINATION HOTFIX READY**

This handoff intentionally does **not** claim `COMPLETE — NATIONAL CMS HOSPITAL NETWORK BUILT`; the national workflow must still be rerun after merge.

## Prior failure

The v0.3.2.1 GitHub Actions run reached the official CMS API but failed during:

```bash
npm run data:build-national-cms-hospitals
```

Exact CMS error:

```text
HTTP 400
JSON Schema validation failed.
limit: '50000'
```

## Root cause

The national pull attempted a single CMS datastore request with an invalid `limit=50000`. CMS rejected the request before returning records. The failure was API pagination configuration, not GitHub Actions network access.

## Hotfix summary

- Visible product version is now `v0.3.2.2 prototype`.
- The national CMS hospital pull no longer uses `limit=50000`.
- Default CMS hospital page size is `1000` through `DEFAULT_CMS_PAGE_SIZE`.
- The page size can be overridden with `CMS_HOSPITAL_PAGE_SIZE`, validated as a positive bounded integer; `50000` is rejected.
- Retrieval uses deterministic `limit` and `offset` pagination beginning at offset `0`.
- Offset advances by the number of records actually returned.
- Pagination stops only on a valid short page or empty page.

## Loop and completeness protections

The hotfix detects and fails clearly on:

- repeated page content;
- identical first/last CMS source IDs across consecutive full pages;
- non-advancing offsets;
- missing expected CMS record array key;
- exceeded maximum page safety limit;
- HTTP failures after bounded retries;
- incomplete pagination before downstream national build execution.

The pull report now records:

- `pageSize`;
- `pagesRequested`;
- `pagesCompleted`;
- `offsetsRequested`;
- `rawRowsRetrieved`;
- `exactRepeatedRows`;
- `uniqueSourceIds`;
- `duplicateSourceIds`;
- `conflictingDuplicateIds`;
- `malformedRows`;
- `normalizedRows`;
- `paginationComplete`;
- `totalCountReportedByCms`, when present;
- `totalCountDifference`, when applicable.

`paginationComplete` is set to `true` only after a valid stop condition and completeness checks pass. The downstream national build refuses to proceed when pagination is incomplete.

## Deduplication behavior

Rows are deduplicated by official CMS facility/provider ID. Exact repeated rows are counted. Conflicting duplicate IDs are counted and excluded for review rather than silently merged.

## Probe command

A non-destructive API probe was added:

```bash
npm run data:probe-cms-hospital-api
```

The probe requests a small page, reports response status, top-level response keys, the expected record-array key, and pagination metadata. It does not write artifacts, run geocoding, update last-known-good data, or replace national outputs.

## Workflow diagnostics and runtime

The CMS Hospital National Build workflow now:

- uses Node `24` for the application runtime;
- sets `FORCE_JAVASCRIPT_ACTIONS_TO_NODE24=true`;
- leaves checkout/setup-node on `actions/checkout@v4` and `actions/setup-node@v4` because no newer stable major was validated in this hotfix;
- sets `CMS_HOSPITAL_PAGE_SIZE=1000`;
- runs the CMS API probe before the national build;
- writes pre-build probe diagnostics to the job summary;
- summarizes pages completed, raw rows, unique CMS IDs, normalized rows, geocoding chunks, map-ready rows, and completion status after the build;
- refuses outdated target branches whose script still contains the old invalid `limit=50000` behavior.

The Node warning was not the CMS failure; the CMS failure was the invalid page size.

## Rerun instructions after merge

After this PR is merged, first update the target generated-data branch from `main`, then rerun:

- Actions → CMS Hospital National Build → Run workflow
- Workflow source: `main`
- Target branch: `v0.3.2.1-execute-complete-national-cms-hospital-build`
- Geocoding mode: `complete`
- Commit generated artifacts: `true`
- Auto merge: `false`

The target branch was created before this hotfix, so it must contain the latest main code before execution. The workflow now refuses to run if the pagination fix is absent.

## Release status

The current release remains blocked until the CMS Hospital National Build workflow is rerun successfully and generated artifacts are committed. No national artifacts were fabricated by this hotfix. No patient, claims, PHI, or live operational data was added. No v0.3.3 work began.
