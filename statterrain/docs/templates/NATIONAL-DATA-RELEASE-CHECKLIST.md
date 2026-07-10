# National Data Release Checklist

A national source release is not complete until the official source data has been pulled, normalized, deduplicated, geocoded where necessary, geography-joined, validated, written to generated artifacts, and made available to the application under source-backed guardrails.

Scripts, schemas, empty caches, reports, chunk plans, and workflows alone do not constitute completion.

When local or Codex network restrictions prevent execution, the same release must execute through GitHub Actions. The release remains incomplete until the required generated-data pull request or pull requests are merged.

No active map layer, filter, capability, legend item, summary, or evidence section may appear unless it is backed by a validated current source mapping or clearly isolated as synthetic demonstration content.

Future or unsupported items must be hidden from primary controls, marked docs-only, marked future-source-needed, or removed. They must not appear as normal active checkboxes or map layers.

A patch cannot say “complete” for a national build when the required sections below remain unexecuted.

## Source verification
## Pull result
## Record count
## Normalization
## Deduplication
## Source-backed field mapping
## Geocoding inputs
## Geocoding chunks
## Cache population
## Geography joins
## Validation
## Excluded records
## Generated artifacts
## Manifest updates
## UI/map integration
## Evidence/export integration
## GitHub Actions runs
## Generated-data PRs
## Deployment/version confirmation
## Completion declaration

## Required completion checklist

- [ ] official source pull completed
- [ ] raw source metadata recorded
- [ ] normalization completed
- [ ] duplicate handling completed
- [ ] source-backed field mapping documented
- [ ] geocoding inputs generated
- [ ] all required chunks executed
- [ ] cache populated
- [ ] geography joins completed
- [ ] validation passed or safe exclusions documented
- [ ] generated artifacts committed
- [ ] source coverage manifest updated
- [ ] artifact manifest updated
- [ ] map integration completed
- [ ] evidence/export integration completed
- [ ] generated-data PRs merged
- [ ] version visible in deployed UI
