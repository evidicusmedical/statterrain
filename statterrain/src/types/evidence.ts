import type { Facility } from "./facility";
import type { PopulationMetric } from "./metric";
import type { SourceRecord } from "./source";

export interface PlanningConsideration {
  id: string;
  label: "Planning consideration" | "Orientation prompt" | "Local verification question";
  text: string;
}

export interface EvidenceBrief {
  generatedAt: string;
  searchLocationLabel: string;
  radiusMiles: number;
  facilities: Facility[];
  metrics: PopulationMetric[];
  sources: SourceRecord[];
  planningConsiderations: PlanningConsideration[];
  activeFilters: {
    facilityTypes: string[];
    capabilities: string[];
    overlay: string | null;
    confidence: string;
  };
}
