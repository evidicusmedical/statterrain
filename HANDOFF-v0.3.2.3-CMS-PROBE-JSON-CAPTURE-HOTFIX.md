# StatTerrain v0.3.2.3 — CMS Probe JSON Capture Hotfix

Completion declaration: **COMPLETE — CMS PROBE JSON CAPTURE HOTFIX READY**

## Scope

This patch fixes the GitHub Actions CMS hospital national-build workflow's probe JSON capture. It does not begin v0.3.3 and does not claim completion of the national CMS hospital network build.

## Prior failure

The CMS API probe itself succeeded in GitHub Actions with HTTP status 200, top-level keys `count`, `query`, `results`, and `schema`, record array key `results`, CMS reported count 5432, and probe row count 10.

The workflow failed afterward because it captured normal `npm run data:probe-cms-hospital-api` stdout and parsed the full stream as JSON. `npm run` prepended banner lines beginning with `>` before the JSON document, causing `SyntaxError: Unexpected token '>'`.

## Fix

- The workflow now invokes `node scripts/public-data/build-national-cms-hospitals.mjs --probe` directly from the `statterrain` working directory.
- Probe output is written to `/tmp/cms-probe.json`.
- The workflow validates `/tmp/cms-probe.json` with `JSON.parse`, requires `status === 200`, prints formatted diagnostics, and uses the parsed file for GitHub step output and summary values.
- Probe mode continues to emit exactly one JSON document to stdout on success.
- The existing human-facing `npm run data:probe-cms-hospital-api` command remains available.
- A matching `data:probe-cms-hospital-api:json` script was added for clarity, but the workflow does not parse raw npm banner output.

## Preservation notes

No intentional changes were made to CMS page size 1000, pagination, retries, loop detection, total count checks, normalization, deduplication, geocoding, cache, geography joins, partitions, manifests, branch safety, no-auto-merge behavior, or Node 24.

No national artifacts were fabricated. No patient, claims, PHI, or live operational data was added.

## Tests added

- Mocked probe-output test verifies probe-mode stdout is parseable JSON, contains no npm banner text, has `recordArrayKey === "results"`, `rowCount === 10`, and `status === 200`.
- Workflow static test verifies the workflow uses direct Node probe output redirected to `/tmp/cms-probe.json` and does not parse raw `npm run data:probe-cms-hospital-api` output.

## Workflow rerun instructions

1. Open GitHub Actions.
2. Run **CMS Hospital National Build** manually with:
   - `target_branch`: `v0.3.2.3-cms-probe-json-capture-hotfix` after this hotfix is merged or copied to the build branch intended to receive artifacts.
   - `geocoding_mode`: `complete`
   - `commit_generated_artifacts`: `true`
   - `auto_merge`: `false`
3. Confirm the probe step parses `/tmp/cms-probe.json` before the national build step begins.
4. Review any generated artifact commit/PR manually. Do not auto-merge.

## Not done

- No v0.3.3 work began.
- No live national CMS hospital network build was claimed complete by this hotfix.
- No fabricated national CMS artifacts were added.
