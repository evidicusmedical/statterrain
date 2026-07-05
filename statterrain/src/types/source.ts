export type ConfidenceLevel = "high" | "medium" | "low";

export type FreshnessStatus = "current" | "watch" | "stale" | "broken" | "manual_review";

export interface SourceRecord {
  id: string;
  sourceAgency: string;
  dataset: string;
  releaseDate: string;
  retrievalDate: string;
  geographyLevel: string;
  dataMethod: string;
  expectedRefreshCadence: string;
  confidence: ConfidenceLevel;
  freshness: FreshnessStatus;
  limitations: string[];
  sourceUrl: string;
  isSynthetic: true;
}

export const FRESHNESS_LABELS: Record<FreshnessStatus, string> = {
  current: "Current",
  watch: "Watch",
  stale: "Stale",
  broken: "Broken",
  manual_review: "Manual review needed",
};

export const FRESHNESS_HELP: Record<FreshnessStatus, string> = {
  current: "Data was retrieved within the expected refresh window for this source.",
  watch: "Data is approaching the edge of its expected refresh window and should be checked soon.",
  stale: "Data is past its expected refresh window and may no longer reflect current conditions.",
  broken: "The upstream source could not be validated during the last check.",
  manual_review: "A person needs to review this record before it can be trusted for planning use.",
};

export const CONFIDENCE_LABELS: Record<ConfidenceLevel, string> = {
  high: "High confidence",
  medium: "Medium confidence",
  low: "Low confidence",
};

export const CONFIDENCE_HELP: Record<ConfidenceLevel, string> = {
  high: "Sourced from a primary public dataset with clear methodology and recent retrieval.",
  medium: "Sourced from a public dataset with some lag, indirect derivation, or coarser geography.",
  low: "Sourced from a secondary or older reference; treat as directional only.",
};
