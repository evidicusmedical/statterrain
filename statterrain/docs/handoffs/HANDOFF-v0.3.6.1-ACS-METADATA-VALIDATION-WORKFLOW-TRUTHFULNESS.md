# StatTerrain v0.3.6.1 — ACS Metadata Validation and Workflow Truthfulness

Completion declaration: PARTIAL — PIPELINE FIX COMPLETE, NATIONAL RERUN PENDING

## What changed
- Corrected ACS variable metadata validation so Census concept text is recorded but is not required to contain the ACS group ID.
- Added release-aware 2024 metadata URL handling and unsupported-release rejection.
- Added group metadata, E/M suffix pairing, semantic label, predicate type, group ID, and variable-existence checks.
- Added current-run workflow status with runId, gate statuses, manifest runId, commit eligibility, failure stage/message, and completion declaration.
- Separated fixture output from national output and added current-run staging promotion only after artifact validation passes.
- Replaced stale-manifest workflow summary inference with current-run status summary.
- Added commit gates and national-scale guardrails so fixture-sized outputs cannot be declared national or committed.

## Original failure captured
The prior validator failed live 2024 metadata because it required actual Census `concept` text to contain configured group IDs such as `B01001`. That was not an authoritative Census rule. The new regression report is written to `statterrain/data/reports/acs-variable-metadata-regression-v0.3.6.1.json` without API keys.

## Rerun instructions
Run the GitHub Actions workflow `ACS County Population National Build` with:
- target_branch: `v0.3.6-acs-county-population-generated-data`
- acs_release: `2024`
- build_mode: `national`
- selected_states: blank
- commit_generated_artifacts: `true`
- auto_merge: `false`

The workflow must fail truthfully if metadata, probe, build, artifact validation, or commit gates fail.

## Scope confirmation
No population UI activation, maps, choropleths, heat maps, tract data, RUCA, SVI, PLACES, AHA, OSM, routing, live operational data, patient data, or AI API work began. Next patch remains v0.3.7 — County Population Visualization, Evidence Integration, and Research Workspace Simplification.
