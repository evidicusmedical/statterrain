import type { ConfidenceLevel, FreshnessStatus } from "./source";

export type OverlayMetricId =
  | "total_population"
  | "pop_65_plus"
  | "pediatric_population"
  | "poverty"
  | "uninsured_population"
  | "disability_population"
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
  total_population: "County total population",
  pop_65_plus: "County population age 65 and older",
  pediatric_population: "County population under age 18",
  poverty: "County population below poverty level",
  uninsured_population: "County population without health insurance",
  disability_population: "County population with a disability",
  limited_english: "County limited-English-speaking households",
  no_vehicle: "County households with no vehicle available",
  copd: "COPD prevalence",
  coronary_heart_disease: "Coronary heart disease prevalence",
  stroke_prevalence: "Stroke prevalence",
  poor_mental_health: "Poor mental health",
  social_vulnerability: "Social vulnerability",
  rurality: "Rurality",
};
