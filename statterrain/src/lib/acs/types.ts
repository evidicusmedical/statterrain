export type AcsMetricId =
  | "total_population"
  | "population_under_18"
  | "population_65_and_older"
  | "poverty_population"
  | "uninsured_population"
  | "households_no_vehicle"
  | "disability_population"
  | "limited_english_households";

export type AcsValueStatus =
  | "available"
  | "missing"
  | "suppressed"
  | "invalid"
  | "zero-reported"
  | "unavailable";

export interface AcsMetricValue {
  estimate: number | null;
  marginOfError: number | null;
  numerator: number | null;
  numeratorMarginOfError: number | null;
  denominator: number | null;
  denominatorMarginOfError: number | null;
  percentage: number | null;
  percentageMarginOfError?: number | null;
  status: AcsValueStatus;
  universe?: string;
  calculationMethod: string;
  sourceVariables: string[];
}

export interface AcsCountyRecord {
  schemaVersion: string;
  geographyId: string;
  geographyType: "county";
  geoid: string;
  stateFips: string;
  countyFips: string;
  stateCode: string;
  countyName: string;
  fullName: string;
  acsRelease: string;
  estimatePeriod: string;
  metrics: Record<AcsMetricId, AcsMetricValue>;
}

export interface AcsCountyManifest {
  schemaVersion: string;
  buildMode: string;
  release: string;
  estimatePeriod: string;
  stateCount: number;
  countyRecordCount: number;
  metricList: AcsMetricId[];
  partitions?: Record<string, unknown>;
  source: {
    sourceId: string;
    agency: string;
    dataset: string;
    release: string;
    attribution: string;
    sourceUrl: string;
    limitations: string[];
  };
}

export const ACS_METRIC_LABELS: Record<AcsMetricId, string> = {
  total_population: "Total population",
  population_under_18: "Under age 18",
  // Age 18 to 64 is derived at runtime; it is not a raw ACS record metric.
  population_65_and_older: "Age 65 and older",
  poverty_population: "Below poverty level",
  uninsured_population: "Without health insurance",
  households_no_vehicle: "No vehicle available",
  disability_population: "Disability",
  limited_english_households: "Limited-English-speaking households",
};

export const ACS_METRIC_ORDER = Object.keys(ACS_METRIC_LABELS) as AcsMetricId[];
