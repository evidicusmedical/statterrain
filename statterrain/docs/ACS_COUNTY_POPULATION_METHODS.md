# ACS county population methods — v0.3.6

StatTerrain v0.3.6 prepares county ACS population context for Availability, Accessibility, and Resilience research. The source is the United States Census Bureau American Community Survey 5-Year Estimates, 2024 release, representing the 2020-2024 estimate period and county/county-equivalent geography, including Puerto Rico where supported by the selected ACS tables.

Metrics are intentionally compact: total population; population under age 18; population age 65 and older; population below poverty; population without health insurance; households with no vehicle available; civilian noninstitutionalized population with a disability; and limited-English-speaking households. Direct ACS estimates are preferred when the table universe matches. When components are summed, estimates are added and MOEs use the ACS-compatible square-root-of-sum-of-squares method. Derived percentages are calculated only from compatible numerators and denominators.

Missing, suppressed, not-applicable, invalid strings, denominator-zero cases, and negative ACS sentinel values are classified centrally and are never encoded as zero. ACS estimates are survey estimates, not exact counts; county values are aggregate area-level facts, not patient-level facts. Cross-vintage comparisons require attention to ACS methodology and boundary changes.

The data remains inactive in v0.3.6. Visualization and Evidence Brief integration are pending v0.3.7.
