# StatTerrain — Data Source Plan

All data shipped in this prototype (`src/data/*.ts`) is **synthetic** and was authored
to resemble the shape, structure, and trust metadata of real public datasets. Every
record includes `isSynthetic: true`. Nothing in this repository queries a live API.

## Modeled source families (for future real integration)

| Domain | Modeled after | Notes |
| --- | --- | --- |
| Facility enrollment & identity | CMS Provider Data Catalog, NPPES/NPI Registry | Facility name, address, type |
| Trauma designation | State Department of Health trauma registries | Level I–III designation |
| Stroke / STEMI systems | State EMS Office cardiac & stroke registries | Primary/comprehensive stroke, PCI |
| Behavioral health directory | SAMHSA FindTreatment.gov | Receiving-facility status |
| Demographics | U.S. Census Bureau ACS 5-Year Estimates | Age, poverty, language, vehicle access |
| Chronic disease & mental health | CDC PLACES | Modeled small-area prevalence |
| Vulnerability index | CDC/ATSDR Social Vulnerability Index | Composite score |
| Rurality | USDA RUCA codes | Commuting-area classification |

## Why synthetic data for v0.1.0

- Keeps the prototype fully portable with zero required API keys or network calls.
- Avoids any risk of stale, incorrect, or unlicensed real-world facility data shipping
  in a demo.
- Lets the trust-layer UX (confidence/freshness badges, source cards, limitations) be
  fully exercised without depending on the reliability of third-party services.

## Path to real data (future work)

1. Introduce a data-fetching layer (e.g., server actions or a lightweight API route)
   that calls the real source APIs/bulk downloads listed above, on a schedule matching
   each source's `expectedRefreshCadence`.
2. Persist normalized records to a database, preserving the same shape as
   `src/types/*.ts` so UI components require no changes.
3. Compute `freshness` dynamically by comparing `retrievalDate` to each source's
   expected refresh cadence, rather than hard-coding it as in this prototype.
4. Replace `isSynthetic: true` with a real provenance flag once backed by a live
   pipeline, and keep the disclaimer and confidence/freshness UX unchanged.
5. See `FUTURE_REFRESH_ARCHITECTURE.md` for the proposed refresh/orchestration design.
