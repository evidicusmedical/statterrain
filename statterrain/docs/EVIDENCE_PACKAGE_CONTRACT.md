# Evidence Package Contract

StatTerrain evidence exports use schema version `statterrain-evidence-v1`. The schema records product version, generated time, research area, canonical planning location, radius in miles, Haversine distance method, active layers, summaries, facilities, sources, methods, freshness, completeness notes, limitations, unavailable sections, raw-record appendix fields, and an export manifest.

Required modular sections are document metadata, research-area definition, planning location, analysis radius, active layers, executive summary, facility results, population context, accessibility, redundancy/resilience, methods, data sources, freshness, missing-data/completeness notes, limitations, raw-record appendix, and export manifest.

Population, accessibility, and resilience remain `null`/unavailable in v0.3.5. The normal human-readable brief omits fabricated demographic values. CMS hospital records retain facility IDs, name, address, city, state, ZIP, county when available, coordinates, distance, type, ownership, emergency-services and critical-access fields when present, phone when present, source metadata, field provenance, and missing-field status. No AI APIs, automated conclusions, routing, dispatch, live status, clinical guidance, or patient-level data are included.

## v0.3.5.2 search evidence metadata

Evidence JSON preserves the canonical PlanningLocation, including entered query, normalized label, input method, search strategy, resolved geography type, official geography identifier when available, coordinates, state, ZIP, source, and limitations. City/state evidence identifies the planning center as a representative point for the selected Census place. ZIP evidence identifies the planning center as an area-derived ZIP/ZCTA reference point and not a precise address. Population remains unavailable in this release.

## v0.3.6 national ACS county population baseline

StatTerrain v0.3.6 adds an inactive, validation-gated ACS 2024 5-Year county population baseline pipeline for the National Emergency-Care Capability, Access, and Resilience Research Platform. The source is the United States Census Bureau American Community Survey 5-Year Estimates, 2024 release, 2020-2024 estimate period. The eight registered county metrics are total population, under-18 population, age-65-and-older population, poverty population, uninsured population, no-vehicle households, civilian noninstitutionalized population with a disability, and limited-English-speaking households. Estimates and margins of error are retained; missing, suppressed, invalid, denominator-zero, and ACS sentinel values are not treated as zero.

The GitHub Actions workflow uses `CENSUS_API_KEY` only as a server-side repository secret. Browser code does not call the Census Data API, and ACS metrics remain `safeToDisplay: false`, unavailable to normal research-layer controls, and absent from Evidence Brief demographic values until v0.3.7. AHA capability work remains a separate future track; no AHA, OSM, RUCA, SVI, PLACES, patient-level, claims, PHI, live operational, routing, or clinical decision-support data is introduced.
