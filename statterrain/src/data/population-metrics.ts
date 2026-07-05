import type { OverlayMetricId, PopulationMetric } from "@/types/metric";
import { OVERLAY_LABELS } from "@/types/metric";

interface MetricInput {
  metricId: OverlayMetricId;
  unit: string;
  value: { local: number; state: number; national: number };
  sourceId: string;
  releaseYear: number;
  method: string;
  confidence: PopulationMetric["confidence"];
  freshness: PopulationMetric["freshness"];
  marginOfError?: number | null;
  limitations?: string[];
}

function makeMetric(input: MetricInput): PopulationMetric {
  return {
    metricId: input.metricId,
    label: OVERLAY_LABELS[input.metricId],
    unit: input.unit,
    geography: "Terrace Basin Demonstration Region (25-mile radius)",
    geographyId: "region-terrace-basin",
    value: input.value,
    sourceId: input.sourceId,
    releaseYear: input.releaseYear,
    retrievalDate: "2025-11-15",
    method: input.method,
    confidence: input.confidence,
    freshness: input.freshness,
    marginOfError: input.marginOfError ?? null,
    limitations: input.limitations ?? ["Synthetic demonstration estimate."],
    isSynthetic: true,
  };
}

export const populationMetrics: PopulationMetric[] = [
  makeMetric({
    metricId: "pop_65_plus",
    unit: "% of population",
    value: { local: 21.4, state: 17.8, national: 17.7 },
    sourceId: "src-census-acs",
    releaseYear: 2024,
    method: "ACS 5-year estimate, synthesized",
    confidence: "high",
    freshness: "current",
    marginOfError: 1.2,
  }),
  makeMetric({
    metricId: "pediatric_population",
    unit: "% of population",
    value: { local: 19.6, state: 22.1, national: 22.0 },
    sourceId: "src-census-acs",
    releaseYear: 2024,
    method: "ACS 5-year estimate, synthesized",
    confidence: "high",
    freshness: "current",
    marginOfError: 1.0,
  }),
  makeMetric({
    metricId: "poverty",
    unit: "% of population below poverty line",
    value: { local: 15.2, state: 12.4, national: 11.5 },
    sourceId: "src-census-acs",
    releaseYear: 2024,
    method: "ACS 5-year estimate, synthesized",
    confidence: "high",
    freshness: "current",
    marginOfError: 2.1,
  }),
  makeMetric({
    metricId: "limited_english",
    unit: "% of households",
    value: { local: 4.8, state: 6.9, national: 8.2 },
    sourceId: "src-census-acs",
    releaseYear: 2024,
    method: "ACS 5-year estimate, synthesized",
    confidence: "medium",
    freshness: "watch",
    marginOfError: 1.4,
  }),
  makeMetric({
    metricId: "no_vehicle",
    unit: "% of households",
    value: { local: 6.1, state: 5.4, national: 8.6 },
    sourceId: "src-census-acs",
    releaseYear: 2024,
    method: "ACS 5-year estimate, synthesized",
    confidence: "high",
    freshness: "current",
    marginOfError: 1.1,
  }),
  makeMetric({
    metricId: "copd",
    unit: "% prevalence (adults)",
    value: { local: 8.9, state: 6.7, national: 6.1 },
    sourceId: "src-cdc-places",
    releaseYear: 2025,
    method: "PLACES modeled small-area estimate, synthesized",
    confidence: "medium",
    freshness: "watch",
  }),
  makeMetric({
    metricId: "coronary_heart_disease",
    unit: "% prevalence (adults)",
    value: { local: 7.3, state: 6.0, national: 5.8 },
    sourceId: "src-cdc-places",
    releaseYear: 2025,
    method: "PLACES modeled small-area estimate, synthesized",
    confidence: "medium",
    freshness: "watch",
  }),
  makeMetric({
    metricId: "stroke_prevalence",
    unit: "% prevalence (adults)",
    value: { local: 3.9, state: 3.1, national: 3.0 },
    sourceId: "src-cdc-places",
    releaseYear: 2025,
    method: "PLACES modeled small-area estimate, synthesized",
    confidence: "medium",
    freshness: "watch",
  }),
  makeMetric({
    metricId: "poor_mental_health",
    unit: "% reporting 14+ poor mental health days",
    value: { local: 16.8, state: 14.9, national: 14.2 },
    sourceId: "src-cdc-places",
    releaseYear: 2025,
    method: "PLACES modeled small-area estimate, synthesized",
    confidence: "medium",
    freshness: "watch",
  }),
  makeMetric({
    metricId: "social_vulnerability",
    unit: "SVI overall percentile",
    value: { local: 0.71, state: 0.55, national: 0.5 },
    sourceId: "src-cdc-svi",
    releaseYear: 2024,
    method: "CDC/ATSDR Social Vulnerability Index composite, synthesized",
    confidence: "medium",
    freshness: "watch",
  }),
  makeMetric({
    metricId: "rurality",
    unit: "RUCA-based classification score",
    value: { local: 6.2, state: 4.8, national: 4.0 },
    sourceId: "src-usda-ruca",
    releaseYear: 2023,
    method: "USDA RUCA commuting-area classification, synthesized",
    confidence: "high",
    freshness: "current",
  }),
];

export function getMetricById(id: OverlayMetricId): PopulationMetric | undefined {
  return populationMetrics.find((m) => m.metricId === id);
}
