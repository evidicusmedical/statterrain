# ACS county population completeness — v0.3.6

The implementation pipeline generates `data/reports/acs-county-population-completeness-v0.3.6.json` during fixture, selected-state, probe, or national builds. The report records total county/county-equivalent records, states/geographies represented, completeness by metric, estimates and MOEs available, missing values, suppressed values, zero-reported values, invalid values, denominator-zero values, calculation failures, affected geographies, source, release, and known limitations.

Fixture results are not national completion. National completion requires the GitHub Actions national workflow, validated generated artifacts, actual record counts, and a generated-data PR. Missing values must not be interpreted as absence of a population characteristic.
