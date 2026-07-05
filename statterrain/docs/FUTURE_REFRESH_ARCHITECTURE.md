# StatTerrain — Future Refresh Architecture (proposal, not implemented)

This document sketches how a future, real-data version of StatTerrain could keep
facility and population-health data fresh. None of this is implemented in v0.1.0 —
the prototype is intentionally static/synthetic.

## Proposed components

1. **Ingestion jobs** — one scheduled job per source family (CMS, Census ACS, CDC
   PLACES, CDC/ATSDR SVI, USDA RUCA, state trauma/stroke registries, SAMHSA), each
   run on a cadence matching that source's real-world refresh cycle.
2. **Normalization layer** — maps each source's raw schema into the `Facility`,
   `CapabilityRecord`, `PopulationMetric`, and `SourceRecord` shapes already defined
   in `src/types/`, so the existing UI requires no changes.
3. **Freshness computation** — instead of hard-coded `freshness` values, compute
   status dynamically: `current` while inside the expected refresh window, `watch`
   as the window closes, `stale` once passed, and `manual_review` when an ingestion
   job fails validation.
4. **Storage** — a managed database (e.g., Postgres) holding normalized facility and
   metric records plus a `source_runs` audit table (source id, run timestamp, row
   counts, validation status).
5. **API layer** — a small set of read-only endpoints (or server actions) that the
   existing client components call instead of importing static arrays from
   `src/data/`.
6. **Change auditing** — diff each ingestion run against the prior run and flag
   capability changes (e.g., a trauma designation lapsing) for human review before
   they affect the confidence badge shown to users.

## What should NOT change

- The trust-layer UX contract: every fact shown to a user must carry a source,
  confidence, and freshness value.
- The mandatory disclaimer and synthetic/real-data notice pattern in the footer,
  facility detail panel, and evidence-brief exports.
- The client-side evidence-brief export mechanism, which can continue to operate on
  whatever data is currently loaded into the app regardless of its origin.
