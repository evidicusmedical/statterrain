import type { ConfidenceLevel, FreshnessStatus } from "./source";

export type OverlayMetricId =
  | "pop_65_plus"
  | "pediatric_population"
  | "poverty"
  | "limited_english"
  | "no_vehicle"
  | "copd"
  | "coronary_heart_disease"
  | "stroke_prevalence"
  | "poor_mental_health"
  | "social_vulnerability"
  | "rurality";

export interface Comparison {
  local: number;
  state: number;
  national: number;
}

export interface PopulationMetric {
  metricId: OverlayMetricId;
  label: string;
  unit: string;
  geography: string;
  geographyId: string;
  value: Comparison;
  sourceId: string;
  releaseYear: number;
  retrievalDate: string;
  method: string;
  confidence: ConfidenceLevel;
  freshness: FreshnessStatus;
  marginOfError: number | null;
  limitations: string[];
  isSynthetic: true;
}

export const OVERLAY_LABELS: Record<OverlayMetricId, string> = {
  pop_65_plus: "Population age 65 and older",
  pediatric_population: "Pediatric population",
  poverty: "Poverty",
  limited_english: "Limited English proficiency",
  no_vehicle: "No vehicle access",
  copd: "COPD prevalence",
  coronary_heart_disease: "Coronary heart disease prevalence",
  stroke_prevalence: "Stroke prevalence",
  poor_mental_health: "Poor mental health",
  social_vulnerability: "Social vulnerability",
  rurality: "Rurality",
};
