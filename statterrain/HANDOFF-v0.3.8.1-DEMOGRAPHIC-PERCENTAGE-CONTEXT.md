# StatTerrain v0.3.8.1 — Demographic Percentage Context Handoff

Completion declaration: COMPLETE — DEMOGRAPHIC PERCENTAGE CONTEXT ACTIVATED

## Summary

This implementation adds centralized ACS demographic percentage context for the Area Summary, Evidence v2 records, and county ACS CSV exports without regenerating ACS data.

## Denominators and universes

- Under age 18: numerator population under age 18; denominator total population; universe Total population; unit people.
- Age 65 and older: numerator population age 65 and older; denominator total population; universe Total population; unit people.
- Below poverty level: numerator population below poverty level; denominator population for whom poverty status is determined; unit people.
- Without health insurance: numerator civilian noninstitutionalized population without health insurance; denominator civilian noninstitutionalized population; unit people.
- No vehicle available: numerator occupied households with no vehicle available; denominator occupied households; unit households.
- Disability: numerator civilian noninstitutionalized population with a disability; denominator civilian noninstitutionalized population; unit people.
- Limited-English-speaking households: numerator limited-English-speaking households; denominator ACS C16002 limited-English-speaking household universe; unit households.

## Percentage method and MOE

Percentages are calculated from stored numeric numerator and denominator estimates at runtime using numerator / denominator * 100. No published ACS percentage variables are currently used. Percentage MOE is not calculated because this patch does not add a documented ACS subset-proportion MOE implementation and does not invent statistical precision. Raw count MOEs remain visible where available.

## Missing and suppressed handling

Missing and suppressed source statuses are preserved. Missing numerator or denominator produces not-calculable percentage status. Zero or invalid denominators produce invalid-denominator status. Missing values are not coerced to zero.

## Existing generated data inspection

The current generated ACS county records already contain numerator, denominator, variable identifiers, and source status fields for supported demographic indicators. No ACS data regeneration was performed. The generated records do not consistently include universe labels, so runtime contract metadata supplies the validated universe labels for display and export.

## Area Summary, Evidence, and exports

The Area Summary now shows raw estimates, units, and percentage together for demographic indicators, while retaining the whole-county limitation and population context count. Evidence v2 includes demographicPercentageMetrics with percentage, percentage status, method, numerator, denominator, universe, unit, ACS release, and estimate period. County ACS CSV includes the added percentage and denominator fields with blank cells for unavailable values.

## Regression notes

Facility details remain a single right-side panel replacing the Area Summary. Closing details restores the summary when the summary preference is shown. County boundaries remain geography-only; no choropleth control or legend was restored.

## Verification

Required lint, typecheck, build, ACS, CMS, facility-panel, county-overlay, public-data-registry Playwright, and demographic percentage tests were run. Browser verification completed in Chromium for the fixture-driven demographic percentage contract.
