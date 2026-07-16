import benchmarkArtifact from "../../../data/generated/acs-national-benchmarks/us.json";
import { type DemographicPercentageMetric, type DemographicMetricKey } from "./demographicPercentages";
import type { AcsMetricValue } from "./types";

export const NATIONAL_COMPARISON_THRESHOLD_PERCENTAGE_POINTS = 0.5;
export type NationalComparisonStatus = "available" | "county-unavailable" | "benchmark-unavailable" | "universe-mismatch" | "release-mismatch" | "estimate-period-mismatch" | "method-mismatch" | "not-comparable";
export type DisplayClassification = "higher-than-united-states" | "lower-than-united-states" | "similar-to-united-states" | null;
export interface NationalBenchmarkComparison { metricKey: DemographicMetricKey; county: { percentage: number | null; percentageMarginOfError: number | null; status: string; universe: string; method: string; numerator: number | null; denominator: number | null; variables: string[]; }; benchmark: { geography: "United States"; percentage: number | null; percentageMarginOfError: number | null; status: string; universe: string; method: string; numerator: number | null; denominator: number | null; variables: string[]; release: string; estimatePeriod: string; }; differencePercentagePoints: number | null; comparisonStatus: NationalComparisonStatus; displayClassification: DisplayClassification; comparisonThreshold: number; }
const artifact = benchmarkArtifact as any;
export const nationalBenchmarkMetadata = { release: artifact.release as string, estimatePeriod: artifact.estimatePeriod as string, validationStatus: artifact.validationStatus as string, geography: artifact.geography?.name as string, source: artifact.source };
function normalizedRelease(value: string | null | undefined) { if (!value) return ""; return value.includes("ACS") ? value : `${value} ACS 5-year`; }
function classify(diff: number): DisplayClassification { if (Math.abs(diff) < NATIONAL_COMPARISON_THRESHOLD_PERCENTAGE_POINTS) return "similar-to-united-states"; return diff >= NATIONAL_COMPARISON_THRESHOLD_PERCENTAGE_POINTS ? "higher-than-united-states" : "lower-than-united-states"; }
export function displayClassificationLabel(c: DisplayClassification): string { if (c === "higher-than-united-states") return "Higher than United States"; if (c === "lower-than-united-states") return "Lower than United States"; if (c === "similar-to-united-states") return "Similar to United States"; return "Comparison unavailable"; }
export function selectNationalBenchmarkComparison(countyMetric: DemographicPercentageMetric, countyRelease: string, countyEstimatePeriod: string): NationalBenchmarkComparison {
  const benchmark = artifact.metrics?.[countyMetric.metricKey] as AcsMetricValue | undefined;
  const benchmarkRelease = normalizedRelease(artifact.release); const countyReleaseLabel = normalizedRelease(countyRelease);
  let comparisonStatus: NationalComparisonStatus = "available";
  if (artifact.validationStatus !== "PASS" || artifact.geography?.geoid !== "US") comparisonStatus = "benchmark-unavailable";
  else if (!benchmark || (benchmark.status as string) !== "available" && (benchmark.status as string) !== "calculated" || benchmark.percentage == null) comparisonStatus = "benchmark-unavailable";
  else if (countyMetric.percentageStatus !== "calculated" || countyMetric.percentage == null) comparisonStatus = "county-unavailable";
  else if ((benchmark.universe ?? "") !== countyMetric.universe) comparisonStatus = "universe-mismatch";
  else if (benchmarkRelease !== countyReleaseLabel) comparisonStatus = "release-mismatch";
  else if (artifact.estimatePeriod !== countyEstimatePeriod) comparisonStatus = "estimate-period-mismatch";
  else if (countyMetric.metricKey === "age18To64" ? countyMetric.method !== benchmark?.calculationMethod : countyMetric.percentageMethod !== "numerator-denominator-ratio") comparisonStatus = "method-mismatch";
  const differencePercentagePoints = comparisonStatus === "available" && benchmark?.percentage != null && countyMetric.percentage != null ? countyMetric.percentage - benchmark.percentage : null;
  return { metricKey: countyMetric.metricKey, county: { percentage: countyMetric.percentage, percentageMarginOfError: countyMetric.percentageMarginOfError, status: countyMetric.percentageStatus, universe: countyMetric.universe, method: countyMetric.percentageMethod, numerator: countyMetric.numerator, denominator: countyMetric.denominator, variables: countyMetric.sourceVariables }, benchmark: { geography: "United States", percentage: benchmark?.percentage ?? null, percentageMarginOfError: benchmark?.percentageMarginOfError ?? null, status: benchmark?.status ?? "unavailable", universe: benchmark?.universe ?? "", method: benchmark?.calculationMethod ?? "unavailable", numerator: benchmark?.numerator ?? null, denominator: benchmark?.denominator ?? null, variables: benchmark?.sourceVariables ?? [], release: benchmarkRelease, estimatePeriod: artifact.estimatePeriod }, differencePercentagePoints, comparisonStatus, displayClassification: differencePercentagePoints == null ? null : classify(differencePercentagePoints), comparisonThreshold: NATIONAL_COMPARISON_THRESHOLD_PERCENTAGE_POINTS };
}
