# StatTerrain v0.3.7.8 — Simplify Data Provenance and Summary Messaging Handoff

Completion declaration: PARTIAL — DATA PROVENANCE SUMMARY SIMPLIFIED, BROWSER VERIFICATION PENDING

Branch: `v0.3.7.8-simplify-data-provenance-summary`
Version: `v0.3.7.8 prototype`

## Summary

This patch simplifies public-facing provenance in the Area Summary while preserving technical provenance in Evidence exports. The Area Summary now keeps results first, adds concise hospital and county source disclosures, places Data sources before Research limitations, and removes obsolete engineering-style CMS status/scaffold messaging from the public summary.

## Implemented

- Added a centralized UI provenance helper for hospital, ACS, and boundary metadata resolved from generated manifests and the public-data source registry.
- Added explicit displayed hospital record classification: `cms-only`, `synthetic-only`, `mixed`, and `none`.
- Replaced the verbose summary coverage block with concise hospital source and Data sources disclosures.
- Ensured synthetic warnings appear only for displayed synthetic hospital records.
- Added no-record wording that avoids implying no hospitals exist.
- Added protected official CMS and Census ACS source links.
- Preserved and expanded Evidence/CSV export provenance metadata, including official URLs, release/estimate period, retrieval timestamps, coverage status, and provenance classification.
- Updated visible version guard tests to v0.3.7.8.

## Browser verification

Chromium verification is pending because `npx playwright install chromium` was blocked by the CDN returning HTTP 403. Fixture-based Playwright source-panel tests were added but cannot execute in this environment until the browser binary is available.

## Data rebuilds

No CMS, ACS, or county boundary datasets were rebuilt.
