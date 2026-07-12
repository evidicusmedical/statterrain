export const populationMetricRegistry = {
  schemaVersion: "population-metric-registry-v0.3.6",
  sourceId: "census-acs5-county-population-2024",
  release: "2024",
  estimatePeriod: "2020-2024",
  usedInCurrentApp: false,
  safeToDisplay: false,
  nextActivationPatch: "v0.3.7",
  metrics: [
    "total_population",
    "population_under_18",
    "population_65_and_older",
    "poverty_population",
    "uninsured_population",
    "households_no_vehicle",
    "disability_population",
    "limited_english_households",
  ],
} as const;
