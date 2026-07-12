export type ResearchLayerCategory =
  | "facilities"
  | "hospital-capabilities"
  | "population"
  | "rurality"
  | "vulnerability"
  | "community-health"
  | "accessibility"
  | "resilience";

export interface ResearchLayer {
  layerId: string;
  label: string;
  category: ResearchLayerCategory;
  sourceId: string;
  active: boolean;
  available: boolean;
  geographyType: "point" | "area" | "none";
  supportedVisualizations: string[];
  evidenceSections: string[];
  sourceRelease: string;
  limitationSummary: string;
}

export const researchLayerRegistry: ResearchLayer[] = [
  {
    layerId: "cms-hospitals",
    label: "CMS hospitals",
    category: "facilities",
    sourceId: "cms-hospital-general-information",
    active: true,
    available: true,
    geographyType: "point",
    supportedVisualizations: ["planning-marker", "radius-boundary", "facility-points", "facility-summary", "evidence-export"],
    evidenceSections: ["activeLayers", "facilityResults", "methods", "dataSources", "freshness", "limitations", "rawRecordAppendix"],
    sourceRelease: "CMS Hospital General Information public-data artifact currently bundled with StatTerrain",
    limitationSummary: "CMS hospital fields are facility listings and designations, not live operating status, routing, capability inference, bed availability, or diversion status.",
  },
];

export const activeResearchLayers = researchLayerRegistry.filter((layer) => layer.active && layer.available);
export const visibleResearchLayerCategories = Array.from(new Set(activeResearchLayers.map((layer) => layer.category)));
