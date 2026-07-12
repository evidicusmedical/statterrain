# Research Layer Registry

StatTerrain v0.3.5 introduces a source-backed research layer registry. Layer controls appear only when a layer is active and available. Empty categories and unavailable fields do not appear in normal UI.

The initial active layer is `cms-hospitals` in the facilities category. Future categories are hospital capabilities, population, rurality, vulnerability, community health, accessibility, and resilience. Future data patches must register layers with source metadata, supported visualizations, evidence sections, releases, and limitations rather than hard-code controls.

AHA capability controls, ACS/RUCA/SVI/PLACES population controls, and OSM/accessibility controls remain unavailable until licensed or public source-backed data are activated and tested. Every activated layer must update both the visual interface and Evidence Brief schema.
