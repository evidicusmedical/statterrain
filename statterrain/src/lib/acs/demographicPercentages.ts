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
export type DemographicMetricKey = AcsMetricId | "age18To64";
export type DemographicMetricStatus = AcsValueStatus | "calculated" | "not-calculable";

export interface DemographicPercentageMetric extends Omit<AcsMetricValue, "status"> {
  metricKey: DemographicMetricKey;
  metricLabel: string;
  unit: AcsMetricUnit;
  universe: string;
  percentage: number | null;
  percentageMarginOfError: number | null;
  percentageStatus: AcsPercentageStatus;
  percentageMethod: AcsPercentageMethod;
  percentageSourceVariable: string | null;
  rawEstimateStatus: AcsValueStatus;
  status: DemographicMetricStatus;
  method?: string;
  sourceComponents?: string[];
  marginOfErrorStatus?: string;
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
  "age18To64",
  "population_65_and_older",
  "poverty_population",
  "uninsured_population",
  "households_no_vehicle",
  "disability_population",
  "limited_english_households",
] as const;

export const DEMOGRAPHIC_PERCENTAGE_CONTRACT: Record<
  (typeof DEMOGRAPHIC_PERCENTAGE_METRIC_IDS)[number],
  { unit: AcsMetricUnit; universe: string; denominatorMetric?: AcsMetricId }
> = {
  population_under_18: {
    unit: "people",
    universe: TOTAL_POPULATION,
    denominatorMetric: "total_population",
  },
  age18To64: {
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
  if (metricKey === "age18To64") return deriveAge18To64Metric(county);
  const source = county.metrics[metricKey as AcsMetricId];
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
    status: source?.status ?? "unavailable",
    method: percentageMethod,
  };
}

export function deriveAge18To64Metric(county: AcsCountyRecord): DemographicPercentageMetric {
  const total = county.metrics.total_population;
  const under18 = county.metrics.population_under_18;
  const age65Plus = county.metrics.population_65_and_older;
  const components = ["totalPopulation", "under18", "age65Plus"];
  const inputs = [total, under18, age65Plus];
  const unavailable = inputs.find((value) => !value || value.status !== "available" && value.status !== "zero-reported");
  const base = { metricKey: "age18To64" as const, metricLabel: "Age 18 to 64", unit: "people" as const, universe: TOTAL_POPULATION, sourceComponents: components, sourceVariables: [...(total?.sourceVariables ?? []), ...(under18?.sourceVariables ?? []), ...(age65Plus?.sourceVariables ?? [])], marginOfError: null, marginOfErrorStatus: "not-available-for-derived-metric", numeratorMarginOfError: null, denominatorMarginOfError: null, percentageMarginOfError: null, percentageSourceVariable: null, calculationMethod: "derived-residual-age-group", method: "derived-residual-age-group" };
  if (unavailable) {
    const inherited = unavailable.status === "suppressed" ? "suppressed" : unavailable.status === "missing" ? "missing" : unavailable.status === "unavailable" ? "unavailable" : "not-calculable";
    return { ...base, estimate: null, numerator: null, denominator: total?.estimate ?? null, percentage: null, percentageStatus: inherited === "missing" || inherited === "suppressed" || inherited === "unavailable" ? inherited : "not-calculable", percentageMethod: "unavailable", rawEstimateStatus: unavailable.status, status: inherited };
  }
  const totalEstimate = total.estimate, under18Estimate = under18.estimate, age65PlusEstimate = age65Plus.estimate;
  if (![totalEstimate, under18Estimate, age65PlusEstimate].every(Number.isFinite) || totalEstimate == null || under18Estimate == null || age65PlusEstimate == null) return { ...base, estimate: null, numerator: null, denominator: totalEstimate ?? null, percentage: null, percentageStatus: "not-calculable", percentageMethod: "unavailable", rawEstimateStatus: "unavailable", status: "not-calculable" };
  const estimate = totalEstimate - under18Estimate - age65PlusEstimate;
  if (estimate < 0 || estimate > totalEstimate || estimate + under18Estimate + age65PlusEstimate !== totalEstimate) return { ...base, estimate: null, numerator: null, denominator: totalEstimate, percentage: null, percentageStatus: "not-calculable", percentageMethod: "unavailable", rawEstimateStatus: "invalid", status: "invalid" };
  return { ...base, estimate, numerator: estimate, denominator: totalEstimate, percentage: (estimate / totalEstimate) * 100, percentageStatus: "calculated", percentageMethod: "numerator-denominator-ratio", rawEstimateStatus: "available", status: "calculated" };
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
