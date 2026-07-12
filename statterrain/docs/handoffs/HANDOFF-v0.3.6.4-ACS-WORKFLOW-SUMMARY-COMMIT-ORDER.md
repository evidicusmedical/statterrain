# StatTerrain v0.3.6.4 ACS Workflow Summary and Commit Ordering Handoff

Implementation declaration: **PARTIAL — WORKFLOW REPORTING FIXED, NATIONAL GENERATED-DATA RERUN PENDING**

## Confirmed failed-run context

The prior national 2024 ACS county build passed the data-building gates before the presentation-only summary failure:

- metadata validation: PASS;
- E/M queryability: PASS;
- API probe: PASS;
- national build: PASS;
- artifact validation: PASS;
- commit gate eligible;
- completed partitions: 52;
- county/county-equivalent records: 3,222;
- unique GEOIDs: 3,222;
- duplicate GEOIDs: 0;
- failed states: none.

## Root cause fixed

The workflow embedded JavaScript template literals such as `${q.estimateVariablesVerified??'unknown'}` inside a double-quoted `node -e "..."` shell argument. Bash expanded `${...}` before Node received the script, causing `bad substitution` and then damaged JavaScript input.

## Implementation summary

- Added `scripts/public-data/write-acs-workflow-summary.mjs` as a dedicated summary writer.
- Removed complex inline `node -e` JavaScript from workflow YAML.
- Reordered the ACS workflow so commit and push happen before the final always-run summary.
- Marked final summary writing as non-destructive (`continue-on-error: true`).
- Added current-run status fields for promotion, commit gate, commit, push, commit SHA, pushed branch, and final workflow state.
- Corrected completion declaration timing so `COMPLETE — NATIONAL ACS COUNTY POPULATION BASELINE BUILT` is only used after push.
- Updated prototype version to `v0.3.6.4 prototype`.

## Rerun instructions

After merge, recreate or reset the generated-data branch from latest main using lowercase:

`v0.3.6-acs-county-population-generated-data`

Run GitHub Actions workflow **ACS County Population National Build** with:

- `target_branch`: `v0.3.6-acs-county-population-generated-data`
- `acs_release`: `2024`
- `build_mode`: `national`
- `selected_states`: blank
- `commit_generated_artifacts`: `true`
- `auto_merge`: `false`

Expected national results should reconcile closely with the confirmed successful run: 52 completed states/territories, 3,222 county records, 3,222 unique GEOIDs, zero duplicate GEOIDs, no failed states, artifact validation PASS, commit status PASS, and push status PASS. Any meaningful count difference must be explained and validated.

## Next patch

Next patch remains: **v0.3.7 — County Population Visualization, Evidence Integration, and Research Workspace Simplification**. Do not begin v0.3.7 in this patch.
