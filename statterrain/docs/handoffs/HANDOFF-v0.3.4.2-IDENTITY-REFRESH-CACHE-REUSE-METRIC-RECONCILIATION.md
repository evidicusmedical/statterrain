# HANDOFF v0.3.4.2 — Identity Refresh Cache Reuse and Metric Reconciliation

## 1. Patch identification
StatTerrain v0.3.4.2 prototype; branch `v0.3.4.2-identity-refresh-cache-reuse-metric-reconciliation`.

## 2. Completion declaration
PARTIAL — PIPELINE FIX COMPLETE, WORKFLOW VERIFICATION PENDING.

## 3. Prior workflow results
The prior identity refresh reported 5,432 normalized and eligible records, 4,669 map-ready records, 763 excluded records, 52 partitions, 0 cache hits, 5,432 external geocoding requests, 55/55 chunks, 9,161 matched, 1,687 unmatched, and 4,669 geography joined.

## 4. Root cause
Zero cache hits were caused by cache lookup and cache validity using only `addressHash` plus an `inputChecksum` that included `sourceRetrievedAt`, a run-specific timestamp. Every refresh generated new checksums, making unchanged addresses look stale and forcing a full workset. Inflated matched/unmatched counts were caused by summing cache entries and chunk history instead of reducing to one final state per `sourceFacilityId` and current address hash; the cache currently contains historical duplicate entries.

## 5. Cache contract
The cache path is `data/generated/geocoding-cache/cms-hospitals-geocoding-cache.json`. The effective cache key is `sourceFacilityId::addressHash`. `addressHash` is the SHA-256 of the normalized uppercase street/city/state/ZIP address. Legacy input checksums may be present but no longer invalidate unchanged source/address pairs because older checksums included timestamps.

## 6. Identity-refresh behavior
`identity-refresh` is cache-first. It loads the target branch cache, reuses matched/no-match/multiple-match entries for unchanged addresses, does not retry unresolved records by default, and submits only new, changed, or explicitly retryable records. `build_mode=identity-refresh` takes precedence over geocoding mode and must not silently become a full geocoding run.

## 7. Metric contract
Source metrics count raw rows, unique source IDs, normalized records, and duplicate IDs. Eligibility metrics count eligible/ineligible geocoding inputs. Cache metrics count loaded entries, valid hits, stale entries, misses, changed addresses, unresolved entries, and retryable entries. Current-run request metrics count only this run's submitted records, requests, successes/failures, and chunks. Final-state metrics are mutually exclusive per sourceFacilityId: matched, no-match, multiple-match, failed, invalid-input. Artifact metrics count geography joined/failed, map-ready, excluded, and partitions.

## 8. Count invariants
Implemented rules include CMS-METRIC-001 duplicate/final-status reconciliation, CMS-METRIC-002 matched-exceeds-eligible, CMS-METRIC-003 cache reconciliation, CMS-METRIC-004 request-count-exceeds-workset, CMS-METRIC-005 artifact/chunk mismatch, and CMS-METRIC-006 identity-refresh full regeocode guard.

## 9. Dry-run audit
`npm run data:audit-cms-identity-refresh` writes `data/reports/cms-identity-refresh-audit-v0.3.4.2.json` and does not call CMS or Census, write partitions, modify cache, or update generated partition timestamps. Current audit: 5,432 eligible, 10,848 cache entries loaded, 5,424 valid cache hits, 0 projected external requests, 0 projected chunks, 4,669 projected map-ready, invariants PASS, safeToRunIdentityRefresh true.

## 10. Workflow summary changes
The workflow now reports current-run cache entries, valid cache hits, cache misses, new records, changed addresses, retryable unresolved, external requests, and chunks separately from final national state metrics. Historical cumulative chunk/cache counts are not labeled as final matched/unmatched.

## 11. Verification run
GitHub Actions verification was not executed from Codex. Run the CMS Hospital National Build after merge on `v0.3.4.2-identity-refresh-verification` with `build_mode=identity-refresh`, `allow_full_fallback=false`, and `auto_merge=false`.

## 12. Files changed
Code: build script, identity-refresh audit script, workflow, package scripts, tests, product version. Reports: dry-run audit and metric validation. Docs: README and CMS pipeline/testing/field completeness docs. Handoff files created in repository root and docs/handoffs.

## 13. Tests
Focused tests cover cache reuse, changed/new source misses, retry policy, identity-refresh precedence, final reducer de-duplication, invariant reconciliation, and request workset bounds.

## 14. Commands
Required local commands were run where practical; browser install/smoke may be limited by CDN/network availability.

## 15. Known limitations
Legacy cache still contains historical duplicate entries (10,848 entries for 5,432 eligible records). The reducer selects the latest entry per `sourceFacilityId::addressHash` and reports duplicate count instead of double-counting. Eight eligible records do not qualify as valid cache hits but are not projected for automatic identity-refresh external requests under the default no-retry policy.

## 16. Scope control
No OpenStreetMap, population, v0.3.5, patient-level, claims, PHI, live operational, routing, ETA, diversion, bed availability, backend, database, authentication, or AI API work was started.

## 17. Rollback
Revert this branch/PR. The prior generated national artifacts remain stable; no national partition rewrite is required for rollback.

## 18. Recommended next patch
v0.3.5 — OpenStreetMap Hospital Intake and CMS Deduplication Benchmark. Do not start it until this hotfix is merged and verified.
