# Source-Backed UI and Data-Bearing Release Policy

## Data-Bearing Release Policy

A national source release is not complete until the official source data has been pulled, normalized, deduplicated, geocoded where necessary, geography-joined, validated, written to generated artifacts, and made available to the application under source-backed guardrails.

Scripts, schemas, empty caches, reports, chunk plans, and workflows alone do not constitute completion.

When local or Codex network restrictions prevent execution, the same release must execute through GitHub Actions. The release remains incomplete until the required generated-data pull request or pull requests are merged.

Completion requires the checklist in `docs/templates/NATIONAL-DATA-RELEASE-CHECKLIST.md`.

## Source-Backed UI Policy

No active map layer, filter, capability, legend item, summary, or evidence section may appear unless it is backed by a validated current source mapping or clearly isolated as synthetic demonstration content.

Future or unsupported items must be:

- hidden from primary controls;
- marked docs-only;
- marked future-source-needed; or
- removed.

They must not appear as normal active checkboxes or map layers.
