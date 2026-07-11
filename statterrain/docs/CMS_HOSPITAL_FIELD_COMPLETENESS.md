# CMS Hospital Field Completeness (v0.3.4)

Generated: 2026-07-11T22:46:08.421Z

Totals: normalized 5432; map-ready 4505; deployed partitions 4505.

Website URL is not provided by the current CMS Hospital General Information source mapping.

| Field | CMS source column(s) | Normalized | Map-ready | Partition | Lost | Status |
| --- | --- | ---: | ---: | ---: | ---: | --- |
| Facility name | facility_name, Facility Name | 5432 (100%) | 4505 (100%) | 4505 (100%) | 0 | complete |
| CMS facility/provider ID | facility_id, Facility ID, Provider ID | 5432 (100%) | 4505 (100%) | 4505 (100%) | 0 | complete |
| Hospital type | hospital_type, Hospital Type | 5432 (100%) | 4505 (100%) | 4505 (100%) | 0 | complete |
| Critical-access designation | hospital_type, Hospital Type | 1378 (25.37%) | 1190 (26.42%) | 1190 (26.42%) | 0 | partially-complete |
| Ownership type | hospital_ownership, Hospital Ownership | 5432 (100%) | 4505 (100%) | 4505 (100%) | 0 | complete |
| Emergency services | emergency_services, Emergency Services | 5432 (100%) | 4505 (100%) | 4505 (100%) | 0 | complete |
| Address line 1 | address, Address | 5432 (100%) | 4505 (100%) | 4505 (100%) | 0 | complete |
| Address line 2 | pipeline metadata / unavailable | 0 (0%) | 0 (0%) | 0 (0%) | 0 | unavailable-in-current-cms-source |
| City | citytown, City | 0 (0%) | 0 (0%) | 0 (0%) | 0 | partially-complete |
| State | state, State | 5432 (100%) | 4505 (100%) | 4505 (100%) | 0 | complete |
| ZIP | zip_code, ZIP Code | 5432 (100%) | 4505 (100%) | 4505 (100%) | 0 | complete |
| County | countyparish, County/Parish | 4506 (82.95%) | 4505 (100%) | 0 (0%) | 4505 | source-present-partition-missing |
| State FIPS | pipeline metadata / unavailable | 4506 (82.95%) | 4505 (100%) | 0 (0%) | 4505 | source-present-partition-missing |
| County FIPS | pipeline metadata / unavailable | 4506 (82.95%) | 4505 (100%) | 0 (0%) | 4505 | source-present-partition-missing |
| Latitude | pipeline metadata / unavailable | 4506 (82.95%) | 4505 (100%) | 4505 (100%) | 0 | source-present-ui-missing |
| Longitude | pipeline metadata / unavailable | 4506 (82.95%) | 4505 (100%) | 4505 (100%) | 0 | source-present-ui-missing |
| Phone number | telephone_number, Phone Number | 0 (0%) | 0 (0%) | 0 (0%) | 0 | partially-complete |
| Website URL | pipeline metadata / unavailable | 0 (0%) | 0 (0%) | 0 (0%) | 0 | unavailable-in-current-cms-source |
| Source name | pipeline metadata / unavailable | 5432 (100%) | 4505 (100%) | 0 (0%) | 4505 | source-present-partition-missing |
| Source dataset ID | pipeline metadata / unavailable | 5432 (100%) | 4505 (100%) | 0 (0%) | 4505 | source-present-partition-missing |
| Source URL | pipeline metadata / unavailable | 5432 (100%) | 4505 (100%) | 0 (0%) | 4505 | source-present-partition-missing |
| Source retrieval date | pipeline metadata / unavailable | 5432 (100%) | 4505 (100%) | 4505 (100%) | 0 | complete |
| Source release date | pipeline metadata / unavailable | 0 (0%) | 0 (0%) | 0 (0%) | 0 | partially-complete |
| Validation status | pipeline metadata / unavailable | 5432 (100%) | 4505 (100%) | 4505 (100%) | 0 | complete |
| Geocoding status | pipeline metadata / unavailable | 5432 (100%) | 4505 (100%) | 0 (0%) | 4505 | source-present-partition-missing |
| Geocoding confidence | pipeline metadata / unavailable | 4506 (82.95%) | 4505 (100%) | 4505 (100%) | 0 | partially-complete |
| Geography-join status | pipeline metadata / unavailable | 5432 (100%) | 4505 (100%) | 4505 (100%) | 0 | complete |
| Limitations | pipeline metadata / unavailable | 5432 (100%) | 4505 (100%) | 4505 (100%) | 0 | complete |
| Prohibited uses | pipeline metadata / unavailable | 5432 (100%) | 4505 (100%) | 4505 (100%) | 0 | complete |
