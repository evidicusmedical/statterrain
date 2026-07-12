# Evidence Package Contract

StatTerrain evidence exports use schema version `statterrain-evidence-v1`. The schema records product version, generated time, research area, canonical planning location, radius in miles, Haversine distance method, active layers, summaries, facilities, sources, methods, freshness, completeness notes, limitations, unavailable sections, raw-record appendix fields, and an export manifest.

Required modular sections are document metadata, research-area definition, planning location, analysis radius, active layers, executive summary, facility results, population context, accessibility, redundancy/resilience, methods, data sources, freshness, missing-data/completeness notes, limitations, raw-record appendix, and export manifest.

Population, accessibility, and resilience remain `null`/unavailable in v0.3.5. The normal human-readable brief omits fabricated demographic values. CMS hospital records retain facility IDs, name, address, city, state, ZIP, county when available, coordinates, distance, type, ownership, emergency-services and critical-access fields when present, phone when present, source metadata, field provenance, and missing-field status. No AI APIs, automated conclusions, routing, dispatch, live status, clinical guidance, or patient-level data are included.
