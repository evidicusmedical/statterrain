# StatTerrain v0.3.6.2 — Correct Live ACS Variable Metadata Validation

Completion declaration: PARTIAL — VALIDATOR CORRECTION COMPLETE, LIVE METADATA VERIFICATION PENDING

## Scope
This patch updates the ACS variable metadata validator, diagnostics, workflow artifact handling, and active prototype version. It does not begin ACS UI activation or v0.3.7 work.

## Root cause
The v0.3.6.1 validator treated official Census label/concept formatting too literally and did not emit enough rule-level diagnostics for live failures. Census labels use prefixes and punctuation such as `Estimate!!Total:` and `Margin of Error!!Total:`; MOE rows should validate through the paired estimate semantics plus E/M pairing rather than exact independent phrase matching.

## Registry and dataset-family audit
All eight configured ACS county metrics remain in the base Detailed Table `acs/acs5` family for release 2024. The validator now derives groups from variable IDs, verifies group metadata and group membership, validates estimate/MOE pairs, checks numeric-compatible predicate types, and records dataset family for each variable.

## Diagnostics
The validator writes:
- `data/reports/acs-county-variable-validation-v0.3.6.2.json`
- `data/reports/acs-variable-metadata-regression-v0.3.6.2.json`
- `data/reports/acs-county-current-run-status.json` when the workflow initializes status

Failed variables include metric ID, variable ID, configured and derived groups, pair status, labels, concepts, predicate type, exact failed rule IDs, and notes. Public metadata URLs are unkeyed.

## Live verification
Local live validation could not complete in this environment because network access to `api.census.gov` was blocked by the environment proxy. Run the focused GitHub Actions workflow **ACS Variable Metadata Verification** on this branch before any national ACS population build.

Expected command:

```bash
npm run data:validate-acs-variable-metadata -- --release 2024 --run-id "$ACS_RUN_ID"
```

## National rerun instructions
After live metadata verification passes in GitHub Actions, recreate or reset the generated-data branch from latest `main`, run the national ACS workflow with build mode `national`, keep selected states blank, set commit generated artifacts to true, and keep auto merge false.

## Next patch
v0.3.7 — County Population Visualization, Evidence Integration, and Research Workspace Simplification.
