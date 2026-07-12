# CMS Hospital Field Completeness (v0.3.4)

Generated: 2026-07-11T23:59:31.210Z

Totals: normalized 5432; map-ready 4669; deployed partitions 4669.

Website URL is not provided by the current CMS Hospital General Information source mapping.

| Field | CMS source column(s) | Normalized | Map-ready | Partition | Lost | Status |
| --- | --- | ---: | ---: | ---: | ---: | --- |
| Facility name | facility_name, Facility Name | 5432 (100%) | 4669 (100%) | 4669 (100%) | 0 | complete |
| CMS facility/provider ID | facility_id, Facility ID, Provider ID | 5432 (100%) | 4669 (100%) | 4669 (100%) | 0 | complete |
| Hospital type | hospital_type, Hospital Type | 5432 (100%) | 4669 (100%) | 4669 (100%) | 0 | complete |
| Critical-access designation | hospital_type, Hospital Type | 1378 (25.37%) | 1196 (25.62%) | 1196 (25.62%) | 0 | partially-complete |
| Ownership type | hospital_ownership, Hospital Ownership | 5432 (100%) | 4669 (100%) | 4669 (100%) | 0 | complete |
| Emergency services | emergency_services, Emergency Services | 5432 (100%) | 4669 (100%) | 4669 (100%) | 0 | complete |
| Address line 1 | address, Address | 5432 (100%) | 4669 (100%) | 4669 (100%) | 0 | complete |
| Address line 2 | pipeline metadata / unavailable | 0 (0%) | 0 (0%) | 0 (0%) | 0 | unavailable-in-current-cms-source |
| City | citytown, City | 5432 (100%) | 4669 (100%) | 4669 (100%) | 0 | complete |
| State | state, State | 5432 (100%) | 4669 (100%) | 4669 (100%) | 0 | complete |
| ZIP | zip_code, ZIP Code | 5432 (100%) | 4669 (100%) | 4669 (100%) | 0 | complete |
| County | countyparish, County/Parish | 5432 (100%) | 4669 (100%) | 4669 (100%) | 0 | complete |
| State FIPS | pipeline metadata / unavailable | 4669 (85.95%) | 4669 (100%) | 4669 (100%) | 0 | source-present-ui-missing |
| County FIPS | pipeline metadata / unavailable | 4669 (85.95%) | 4669 (100%) | 4669 (100%) | 0 | source-present-ui-missing |
| Latitude | pipeline metadata / unavailable | 4669 (85.95%) | 4669 (100%) | 4669 (100%) | 0 | source-present-ui-missing |
| Longitude | pipeline metadata / unavailable | 4669 (85.95%) | 4669 (100%) | 4669 (100%) | 0 | source-present-ui-missing |
| Phone number | telephone_number, Phone Number | 5432 (100%) | 4669 (100%) | 4669 (100%) | 0 | complete |
| Website URL | pipeline metadata / unavailable | 0 (0%) | 0 (0%) | 0 (0%) | 0 | unavailable-in-current-cms-source |
| Source name | pipeline metadata / unavailable | 5432 (100%) | 4669 (100%) | 4669 (100%) | 0 | complete |
| Source dataset ID | pipeline metadata / unavailable | 5432 (100%) | 4669 (100%) | 4669 (100%) | 0 | complete |
| Source URL | pipeline metadata / unavailable | 5432 (100%) | 4669 (100%) | 4669 (100%) | 0 | complete |
| Source retrieval date | pipeline metadata / unavailable | 5432 (100%) | 4669 (100%) | 4669 (100%) | 0 | complete |
| Source release date | pipeline metadata / unavailable | 0 (0%) | 0 (0%) | 0 (0%) | 0 | partially-complete |
| Validation status | pipeline metadata / unavailable | 5432 (100%) | 4669 (100%) | 4669 (100%) | 0 | complete |
| Geocoding status | pipeline metadata / unavailable | 5432 (100%) | 4669 (100%) | 0 (0%) | 4669 | source-present-partition-missing |
| Geocoding confidence | pipeline metadata / unavailable | 4669 (85.95%) | 4669 (100%) | 4669 (100%) | 0 | partially-complete |
| Geography-join status | pipeline metadata / unavailable | 5432 (100%) | 4669 (100%) | 4669 (100%) | 0 | complete |
| Limitations | pipeline metadata / unavailable | 5432 (100%) | 4669 (100%) | 4669 (100%) | 0 | complete |
| Prohibited uses | pipeline metadata / unavailable | 5432 (100%) | 4669 (100%) | 4669 (100%) | 0 | complete |

## v0.3.4.2 CMS identity-refresh cache and metric contract

Identity refresh is cache-first maintenance. It loads `data/generated/geocoding-cache/cms-hospitals-geocoding-cache.json`, keys reusable entries by `sourceFacilityId::addressHash`, and treats the normalized address hash as authoritative for legacy cache rows whose input checksum included a run timestamp. `build_mode=identity-refresh` takes precedence over geocoding mode and does not silently fall back to a full national geocode unless an explicit workflow fallback is enabled.

Metrics are split into source, eligibility, cache, current-run request, final record-state, and final artifact groups. Current-run request metrics count only records submitted in the current run. Final geocoding metrics are derived by one reducer that assigns each CMS `sourceFacilityId` exactly one state: matched, no-match, multiple-match, failed, or invalid-input. Historical chunk files and duplicate cache entries are not summed into final matched/unmatched totals.

Validation writes `data/reports/cms-hospital-metric-validation-v0.3.4.2.json` and enforces reconciliation rules for final-state totals, matched-vs-eligible, cache hits/misses, request workset bounds, identity-refresh full-regeocode refusal, chunks, and map-ready/excluded totals. The dry-run audit command is `npm run data:audit-cms-identity-refresh`; it does not call CMS or Census, does not rewrite partitions, and writes `data/reports/cms-identity-refresh-audit-v0.3.4.2.json`.

The previous workflow figures of 9,161 matched and 1,687 unmatched were invalid because they mixed cache-history/chunk-history entries with current final record state. The current deployed baseline remains 5,432 normalized records, 4,669 map-ready records, 763 excluded records, 52 partitions, and phone values in all 4,669 partition records; websites remain absent unless source-backed.
