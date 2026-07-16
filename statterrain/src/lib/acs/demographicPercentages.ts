import {
  ACS_METRIC_LABELS,
  type AcsCountyRecord,
  type AcsMetricId,
  type AcsMetricValue,
  type AcsValueStatus,
} from "./types";

export type AcsPercentageStatus =
  | "reported"
  | "calculated"
  | "missing"
  | "suppressed"
  | "unavailable"
  | "invalid-denominator"
  | "not-calculable";
export type AcsPercentageMethod =
  | "published-percentage"
  | "numerator-denominator-ratio"
  | "unavailable";
export type AcsMetricUnit = "people" | "households";

export interface DemographicPercentageMetric extends AcsMetricValue {
  metricKey: AcsMetricId;
  metricLabel: string;
  unit: AcsMetricUnit;
  universe: string;
  percentage: number | null;
  percentageMarginOfError: number | null;
  percentageStatus: AcsPercentageStatus;
  percentageMethod: AcsPercentageMethod;
  percentageSourceVariable: string | null;
  rawEstimateStatus: AcsValueStatus;
}

const TOTAL_POPULATION = "Total population";
const POVERTY_UNIVERSE = "Population for whom poverty status is determined";
const CIVILIAN_NONINSTITUTIONALIZED =
  "Civilian noninstitutionalized population";
const OCCUPIED_HOUSEHOLDS = "Occupied households";
const LIMITED_ENGLISH_UNIVERSE =
  "Households included in ACS C16002 limited-English-speaking household universe";

export const DEMOGRAPHIC_PERCENTAGE_METRIC_IDS = [
  "population_under_18",
  "population_65_and_older",
  "poverty_population",
  "uninsured_population",
  "households_no_vehicle",
  "disability_population",
  "limited_english_households",
] as const satisfies readonly AcsMetricId[];

export const DEMOGRAPHIC_PERCENTAGE_CONTRACT: Record<
  (typeof DEMOGRAPHIC_PERCENTAGE_METRIC_IDS)[number],
  { unit: AcsMetricUnit; universe: string; denominatorMetric?: AcsMetricId }
> = {
  population_under_18: {
    unit: "people",
    universe: TOTAL_POPULATION,
    denominatorMetric: "total_population",
  },
  population_65_and_older: {
    unit: "people",
    universe: TOTAL_POPULATION,
    denominatorMetric: "total_population",
  },
  poverty_population: { unit: "people", universe: POVERTY_UNIVERSE },
  uninsured_population: {
    unit: "people",
    universe: CIVILIAN_NONINSTITUTIONALIZED,
  },
  households_no_vehicle: { unit: "households", universe: OCCUPIED_HOUSEHOLDS },
  disability_population: {
    unit: "people",
    universe: CIVILIAN_NONINSTITUTIONALIZED,
  },
  limited_english_households: {
    unit: "households",
    universe: LIMITED_ENGLISH_UNIVERSE,
  },
};

function statusFor(m?: AcsMetricValue | null): AcsPercentageStatus | null {
  if (!m) return "unavailable";
  if (m.status === "missing") return "missing";
  if (m.status === "suppressed") return "suppressed";
  if (m.status === "invalid" || m.status === "unavailable")
    return "unavailable";
  return null;
}

export function deriveDemographicPercentageMetric(
  county: AcsCountyRecord,
  metricKey: (typeof DEMOGRAPHIC_PERCENTAGE_METRIC_IDS)[number],
): DemographicPercentageMetric {
  const source = county.metrics[metricKey];
  const contract = DEMOGRAPHIC_PERCENTAGE_CONTRACT[metricKey];
  const limiting = statusFor(source);
  let percentage: number | null = null;
  let percentageStatus: AcsPercentageStatus = limiting ?? "not-calculable";
  let percentageMethod: AcsPercentageMethod = "unavailable";
  const numerator = source?.numerator ?? source?.estimate ?? null;
  const denominator =
    source?.denominator ??
    (contract.denominatorMetric
      ? (county.metrics[contract.denominatorMetric]?.estimate ?? null)
      : null);
  if (!limiting) {
    if (numerator == null || denominator == null) {
      percentageStatus = "not-calculable";
    } else if (!Number.isFinite(denominator) || denominator <= 0) {
      percentageStatus = "invalid-denominator";
    } else if (!Number.isFinite(numerator)) {
      percentageStatus = "not-calculable";
    } else {
      percentage = (numerator / denominator) * 100;
      percentageStatus = "calculated";
      percentageMethod = "numerator-denominator-ratio";
    }
  }
  return {
    ...(source ?? {
      estimate: null,
      marginOfError: null,
      numerator: null,
      numeratorMarginOfError: null,
      denominator: null,
      denominatorMarginOfError: null,
      percentage: null,
      percentageMarginOfError: null,
      status: "unavailable" as AcsValueStatus,
      calculationMethod: "unavailable",
      sourceVariables: [],
    }),
    metricKey,
    metricLabel: ACS_METRIC_LABELS[metricKey],
    unit: contract.unit,
    universe: source?.universe ?? contract.universe,
    numerator,
    denominator,
    percentage,
    percentageMarginOfError: null,
    percentageStatus,
    percentageMethod,
    percentageSourceVariable: null,
    rawEstimateStatus: source?.status ?? "unavailable",
  };
}

export function selectDemographicPercentageMetrics(
  county: AcsCountyRecord | null | undefined,
): DemographicPercentageMetric[] {
  if (!county) return [];
  return DEMOGRAPHIC_PERCENTAGE_METRIC_IDS.map((id) =>
    deriveDemographicPercentageMetric(county, id),
  );
}

export function formatDemographicPercentage(
  value: number | null | undefined,
): string {
  if (value == null || !Number.isFinite(value)) return "—";
  if (value > 0 && value < 0.1) return "<0.1%";
  // A genuine zero falls through locale formatting and displays as 0.0%.
  return `${value.toLocaleString(undefined, { minimumFractionDigits: 1, maximumFractionDigits: 1 })}%`;
}
