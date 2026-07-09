# Public Data Source Benchmark and Intake Plan (v0.2.1)

StatTerrain v0.2.1 benchmarks public data sources only. It does not ingest app-visible real records, does not replace synthetic demo data, and does not create scheduled public-data automation.

## Machine-readable catalog

The canonical benchmark is `data/sources/source-benchmark.json`. It records source authority, access pattern, endpoint verification status, supported fields, limitations, prohibited uses, redundancy role, recommended patch, and a priority score for each candidate.

## Scoring model

Scores are 0-100 and favor sources that are official, machine-readable, stable, useful for first facility identity/address/phone/type ingestion, and low risk. Lower scores are assigned to sources that need state-by-state research, lack supported bulk/API access, require brittle scraping, or are better treated as supplemental redundancy.

## v0.2.2 intake recommendation

1. **Primary facility source:** CMS Hospital General Information.
   - Use only as planning and situational-awareness facility identity data.
   - Pull by supported CMS CSV/API mechanism during the next ingestion patch.
   - Normalize only source-supported fields such as facility name, address, phone, CMS identifier, hospital type, ownership, and source-supported emergency-services indicators.
2. **Geography support:** Census Geocoder.
   - Use for address geocoding and census geography assignment only.
   - Store match quality and reject or quarantine low-confidence matches.
3. **Do not use as primary in v0.2.2:** HIFLD, state designation lists, SAMHSA locator content, NPPES, CDC PLACES, SVI, ACS, and USDA RUCA.
   - These sources remain valuable, but they should not block the first official hospital ingestion.

## Endpoint probe plan

Before real ingestion, run a dry-run probe that records endpoint reachability, content type, schema headers/metadata, release/update date if present, byte size, row count estimate if available, and validation risks. The probe must not write records into `src/data`, `data/generated`, or any app-visible bundle.

Minimum dry-run checks for v0.2.2:

- CMS Hospital General Information page/API/CSV is reachable.
- CSV header contains expected identity and address fields.
- Download metadata contains a release or update date, or the probe explicitly reports that no date was found.
- Census Geocoder endpoint is reachable and can process a tiny synthetic/non-real test address or documented health check without storing real facility output.
- No generated public records become active unless a later ingestion patch explicitly changes the generated-data contract.

## Redundancy strategy

- Treat CMS Hospital General Information as the primary hospital identity source.
- Treat Census Geocoder as a transformation/geography service, not a facility authority.
- Treat HIFLD as supplemental geometry/cross-check only after its layer metadata and upstream authority are verified.
- Treat state trauma/stroke/STEMI/perinatal lists as future capability overlays; they must be state-authoritative and explicitly labeled by designation date/source.
- Treat NPPES as an identifier/taxonomy crosswalk candidate, not as a hospital facility authority.
- Treat SAMHSA FindTreatment as future research until supported API or bulk access is confirmed; do not scrape locator pages.

## Safety boundaries retained

All benchmarked sources are prohibited for live routing, diversion status, bed availability, dispatch, triage, transfer decisions, medical-control guidance, and clinical decision support.
