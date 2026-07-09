# StatTerrain Public Data Pipeline Data Area

v0.2.0 creates the public-data automation framework only. No real public data has been ingested, no generated public records are active, and the app remains in `synthetic-demo` mode.

Folders:

- `sources/` — planned source registry placeholders.
- `raw/` — future raw snapshots or raw snapshot metadata.
- `normalized/` — future normalized intermediate files.
- `generated/` — future app-ready generated JSON files, only after validation passes or last-known-good fallback is explicitly active.
- `reports/` — validation and refresh-readiness reports.
- `last-known-good/` — future fallback datasets retained when validation fails.

Safety rules: use official public sources where possible, preserve snapshot metadata, validate before display, never publish unvalidated data directly, surface retrieval/release dates and limitations, prohibit live routing/diversion/dispatch/bed/triage/transfer/medical-control/clinical decision support uses, and never accept PHI.
