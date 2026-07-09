# StatTerrain v0.2.8 — CMS Dialysis Facility Pilot handoff

## Completed

- Updated centralized visible product version to `v0.2.8 prototype`.
- Added official CMS dialysis facility source metadata to the public-data registry and benchmark.
- Added deterministic fixture records for schema-only testing.
- Added `data:pull-cms-dialysis` and `data:validate-cms-dialysis` scripts.
- Generated fixture-mode raw, normalized, generated, report, and future-geocoding-input artifacts.
- Kept dialysis records out of the default app dataset and out of map preview.

## Safety posture

The dialysis artifact remains `usedInCurrentApp: false`, `previewLabelRequired: true`, and `safeToDisplay: false`. Records are not geocoded or geography-joined. Fixture data is synthetic-test-fixture only and must never update last-known-good.

## Next possible patch

A future patch may perform a tiny, bounded geocoding/geography-join probe for real CMS dialysis records, but only with explicit validation and preview guardrails. Do not use dialysis data for patient referral, routing, treatment, appointment availability, capacity, staffing, or clinical decision support.
