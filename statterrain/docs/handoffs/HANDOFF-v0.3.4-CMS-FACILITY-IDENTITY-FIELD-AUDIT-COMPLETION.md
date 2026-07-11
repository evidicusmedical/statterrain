# HANDOFF v0.3.4 — CMS Facility Identity Field Audit Completion

## 1. Patch identification
StatTerrain v0.3.4 prototype: CMS source-field audit, data-completion, and facility-detail patch.

## 2. Completion declaration
PARTIAL — CMS FIELD AUDIT COMPLETE, GENERATED DATA PENDING.

## 3. Objective
Audit CMS Hospital General Information identity/contact fields; restore source-backed field mappings; update UI/export paths; document generated-data requirements.

## 4. National baseline
Source rows: 5,432. Normalized records: 5,432. Map-ready records: 4,505. Excluded records: 927. States/territories: 52. Active source: CMS Hospital General Information.

## 5. CMS source schema audit
Observed source columns include `facility_id`, `facility_name`, `address`, `citytown`, `state`, `zip_code`, `countyparish`, `telephone_number`, `hospital_type`, `hospital_ownership`, and `emergency_services`. Website-like columns were not present in the active source mapping.

## 6. Field completeness matrix
See `statterrain/data/reports/cms-hospital-field-completeness-v0.3.4.json` and `statterrain/docs/CMS_HOSPITAL_FIELD_COMPLETENESS.md`.

## 7. Phone findings
CMS source column `telephone_number` is present in 5,432/5,432 raw rows. Current normalized count is 0; map-ready count is 0; deployed partition count is 0. Builder mapping was corrected from `phone_number` to `telephone_number`. Generated identity-refresh is required.

## 8. Website findings
Website URL is not provided by the current CMS Hospital General Information source mapping. Normalized and partition website counts are 0. UI/export support remains for future source-backed enrichment only.

## 9. Hospital type findings
`hospital_type` is present in 5,432 normalized records and 4,505 deployed partition records.

## 10. Ownership findings
`hospital_ownership` is present in 5,432 normalized records and 4,505 deployed partition records.

## 11. Emergency-services findings
`emergency_services` has values Yes: 4,498 and No: 934 in normalized records. Blank is not interpreted as No. CMS emergency-services designation is not live operational status.

## 12. Critical-access findings
Critical access is mapped only when CMS `hospital_type` equals `Critical Access Hospitals`. Normalized national count is 1,378; current partition count is 1,190.

## 13. Address/geography findings
Address, state, ZIP, latitude, longitude, validation, and geocoding confidence are partitioned. Current normalized artifacts missed `citytown`; current partitions omit county/FIPS. Builder now maps `citytown`, `countyparish`, county/FIPS, and provenance for identity-refresh regeneration.

## 14. Partition schema changes
Builder schema version changed to `cms-hospitals-national-v0.3.4`. Regenerated compact records should include phone, countyName, stateFips, countyFips, sourceName, sourceDatasetId, sourceUrl, and sourceReleaseDate where available.

## 15. Facility-detail changes
Facility details now use concise identity, location, contact, CMS services, and source/data-quality sections. Phone links use safe `tel:` construction; website links require valid http/https source-backed URLs.

## 16. Evidence/export changes
Markdown/JSON exports include CMS facility ID, hospital type, ownership, county, phone, website when valid, emergency-services indicator, source, retrieved date, and limitations.

## 17. Identity-refresh workflow
Workflow input `build_mode` supports `full`, `incremental`, and `identity-refresh`. Identity-refresh is documented to reuse geocoding cache and avoid unnecessary national regeocoding.

## 18. Generated-data PR status
Generated-data PR is required and pending because source-backed phone exists in raw CMS but current normalized/partition artifacts have zero phone values.

## 19. Files changed
Version/config, field catalog, field audit script/report/docs, builder, loader, facility detail panel, exports, workflow, tests, documentation, and handoff files.

## 20. Tests
Focused field-completeness and facility-contact tests were added and passed locally.

## 21. Commands
See final response testing list for exact commands and results.

## 22. Verification results
Audit totals reconcile: normalized 5,432; map-ready 4,505; deployed partitions 4,505. Phone source 5,432; normalized/partition 0 pending generated refresh. Website unavailable.

## 23. Known limitations
Generated-data identity-refresh has not been run/merged in this implementation branch. Current deployed partitions still lack phone. No external enrichment was performed.

## 24. Scope control
No patient-level data, claims, PHI, live operational status, routing, OSM ingestion, population ingestion, or v0.3.5 implementation was added.

## 25. Rollback
Revert this implementation commit and rerun existing v0.3.3.3 artifacts. Do not merge generated identity partitions if validation or audit fails.

## 26. Recommended next patch
v0.3.5 — OpenStreetMap Hospital Intake and CMS Deduplication Benchmark. Do not implement v0.3.5 in this patch.
