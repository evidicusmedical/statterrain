# Census API access and secret readiness

StatTerrain v0.3.5.2 confirms that the Census Data API credential is a workflow-only ingestion secret named `CENSUS_API_KEY` in GitHub Actions repository secrets.

- Future ACS national-build workflows should read the key as `${{ secrets.CENSUS_API_KEY }}`.
- Location geocoding and ACS data ingestion are separate services. The `/api/geocode` location route uses public U.S. Census Bureau geocoding and TIGERweb geography services and does not require `CENSUS_API_KEY`.
- Normal users load static, validated ACS artifacts after a reviewed national build. Browser sessions must not query the Census Data API directly.
- Local development secrets must remain in ignored `.env`, `.env.local`, or `.env.*.local` files, or in shell environment variables.
- Never prefix this secret with `NEXT_PUBLIC_`, log it, echo it, commit it, add it to fixtures, or expose it to Vercel/browser client code.

The next patch, v0.3.6 — National ACS County Population Baseline, may add the workflow that consumes the existing GitHub Actions secret. This patch does not ingest ACS population data.
