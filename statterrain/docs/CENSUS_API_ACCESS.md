# Census API access and secret readiness

StatTerrain v0.3.5.2 confirms that the Census Data API credential is a workflow-only ingestion secret named `CENSUS_API_KEY` in GitHub Actions repository secrets.

- Future ACS national-build workflows should read the key as `${{ secrets.CENSUS_API_KEY }}`.
- Location geocoding and ACS data ingestion are separate services. The `/api/geocode` location route uses public U.S. Census Bureau geocoding and TIGERweb geography services and does not require `CENSUS_API_KEY`.
- Normal users load static, validated ACS artifacts after a reviewed national build. Browser sessions must not query the Census Data API directly.
- Local development secrets must remain in ignored `.env`, `.env.local`, or `.env.*.local` files, or in shell environment variables.
- Never prefix this secret with `NEXT_PUBLIC_`, log it, echo it, commit it, add it to fixtures, or expose it to Vercel/browser client code.

The next patch, v0.3.6 — National ACS County Population Baseline, may add the workflow that consumes the existing GitHub Actions secret. This patch does not ingest ACS population data.

## v0.3.6 national ACS county population baseline

StatTerrain v0.3.6 adds an inactive, validation-gated ACS 2024 5-Year county population baseline pipeline for the National Emergency-Care Capability, Access, and Resilience Research Platform. The source is the United States Census Bureau American Community Survey 5-Year Estimates, 2024 release, 2020-2024 estimate period. The eight registered county metrics are total population, under-18 population, age-65-and-older population, poverty population, uninsured population, no-vehicle households, civilian noninstitutionalized population with a disability, and limited-English-speaking households. Estimates and margins of error are retained; missing, suppressed, invalid, denominator-zero, and ACS sentinel values are not treated as zero.

The GitHub Actions workflow uses `CENSUS_API_KEY` only as a server-side repository secret. Browser code does not call the Census Data API, and ACS metrics remain `safeToDisplay: false`, unavailable to normal research-layer controls, and absent from Evidence Brief demographic values until v0.3.7. AHA capability work remains a separate future track; no AHA, OSM, RUCA, SVI, PLACES, patient-level, claims, PHI, live operational, routing, or clinical decision-support data is introduced.
