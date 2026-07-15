import type { AcsCountyRecord, AcsMetricId } from "@/lib/acs/types";
import type { OverlayMetricId } from "@/types/metric";

export type CountyVisualizationMode = "single-county-outline" | "multi-county-comparison" | "disabled";
export type CountyVisualizationRole = "containing" | "intersecting" | "loaded";
export type CountyDisplayStatus = "valid" | "missing" | "equal" | "outline-only" | "disabled";

export const COUNTY_SHADING_LIMITATION = "County colors compare whole-county ACS estimates. They do not represent within-county variation or population inside the radius.";
export const COUNTY_VALUE_LIMITATION = "This value describes the whole county. County-level data do not show variation within the county.";
export const COUNTY_RADIUS_LIMITATION = "County estimates do not represent population inside the selected radius.";

export const OVERLAY_TO_ACS_METRIC: Partial<Record<OverlayMetricId, AcsMetricId>> = {
  total_population: "total_population",
  pediatric_population: "population_under_18",
  pop_65_plus: "population_65_and_older",
  poverty: "poverty_population",
  uninsured_population: "uninsured_population",
  disability_population: "disability_population",
  limited_english: "limited_english_households",
  no_vehicle: "households_no_vehicle",
};

export const COUNTY_METRIC_LABELS: Record<AcsMetricId, string> = {
  total_population: "County total population",
  population_under_18: "County population under age 18",
  population_65_and_older: "County population age 65 and older",
  poverty_population: "County population below poverty level",
  uninsured_population: "County population without health insurance",
  households_no_vehicle: "County households with no vehicle available",
  disability_population: "County population with a disability",
  limited_english_households: "County limited-English-speaking households",
};

export interface CountyComparisonDisplay {
  geoid: string;
  role: CountyVisualizationRole;
  value: number | null;
  rank: number | null;
  displayClass: string;
  displayStatus: CountyDisplayStatus;
  fillColor: string;
  fillOpacity: number;
  outlineColor: string;
  outlineWeight: number;
}

export interface CountyComparisonState {
  mode: CountyVisualizationMode;
  selectedMetric: AcsMetricId | null;
  selectedMetricLabel: string;
  loadedCountyCount: number;
  validComparableCount: number;
  missingCountyGeoids: string[];
  containingCountyRank: number | null;
  visibleMin: number | null;
  visibleMax: number | null;
  equalValues: boolean;
  legend: null | { label: string; min: number; max: number; equalValues: boolean };
  counties: CountyComparisonDisplay[];
  limitations: string[];
}

function isValidMetricValue(county: AcsCountyRecord, metricId: AcsMetricId): number | null {
  const metric = county.metrics[metricId];
  if (!metric || metric.status !== "available" || typeof metric.estimate !== "number" || !Number.isFinite(metric.estimate)) return null;
  return metric.estimate;
}

export function buildCountyComparisonState(args: { overlay: OverlayMetricId | null; layerEnabled: boolean; containingCounty: AcsCountyRecord | null; counties: AcsCountyRecord[]; intersectingGeoids?: string[] }): CountyComparisonState {
  const selectedMetric = args.overlay ? OVERLAY_TO_ACS_METRIC[args.overlay] ?? null : null;
  const loaded = args.counties;
  const loadedCountyCount = loaded.length;
  const valid = selectedMetric ? loaded.map((county) => ({ county, value: isValidMetricValue(county, selectedMetric) })).filter((entry) => entry.value !== null) as { county: AcsCountyRecord; value: number }[] : [];
  const validComparableCount = valid.length;
  const values = valid.map((entry) => entry.value);
  const visibleMin = values.length ? Math.min(...values) : null;
  const visibleMax = values.length ? Math.max(...values) : null;
  const equalValues = values.length >= 2 && visibleMin === visibleMax;
  const mode: CountyVisualizationMode = !args.layerEnabled || !selectedMetric ? "disabled" : validComparableCount >= 2 ? "multi-county-comparison" : "single-county-outline";
  const ranks = new Map(valid.slice().sort((a, b) => b.value - a.value || a.county.geoid.localeCompare(b.county.geoid)).map((entry, index) => [entry.county.geoid, index + 1]));
  const containingCountyRank = mode === "multi-county-comparison" && args.containingCounty ? ranks.get(args.containingCounty.geoid) ?? null : null;
  const intersecting = new Set(args.intersectingGeoids ?? loaded.map((county) => county.geoid));
  const missingCountyGeoids = selectedMetric ? loaded.filter((county) => isValidMetricValue(county, selectedMetric) === null).map((county) => county.geoid) : loaded.map((county) => county.geoid);

  const counties = loaded.map((county) => {
    const value = selectedMetric ? isValidMetricValue(county, selectedMetric) : null;
    const role: CountyVisualizationRole = county.geoid === args.containingCounty?.geoid ? "containing" : intersecting.has(county.geoid) ? "intersecting" : "loaded";
    let fillColor = "#f8fafc", fillOpacity = role === "containing" ? 0.18 : 0.08, displayClass = "outline-only", displayStatus: CountyDisplayStatus = mode === "disabled" ? "disabled" : "outline-only";
    if (mode === "multi-county-comparison") {
      if (value === null) { fillColor = "#e5e7eb"; fillOpacity = 0.38; displayClass = "missing"; displayStatus = "missing"; }
      else if (equalValues) { fillColor = "#93c5fd"; fillOpacity = 0.42; displayClass = "equal-value"; displayStatus = "equal"; }
      else {
        const ratio = visibleMax !== null && visibleMin !== null && visibleMax > visibleMin ? (value - visibleMin) / (visibleMax - visibleMin) : 0.5;
        fillColor = ratio < 0.34 ? "#bfdbfe" : ratio < 0.67 ? "#60a5fa" : "#1d4ed8";
        fillOpacity = 0.48; displayClass = ratio < 0.34 ? "low" : ratio < 0.67 ? "middle" : "high"; displayStatus = "valid";
      }
    }
    return { geoid: county.geoid, role, value, rank: ranks.get(county.geoid) ?? null, displayClass, displayStatus, fillColor, fillOpacity, outlineColor: role === "containing" ? "#111827" : role === "intersecting" ? "#475569" : "#94a3b8", outlineWeight: role === "containing" ? 3 : 1.5 };
  });
  return { mode, selectedMetric, selectedMetricLabel: selectedMetric ? COUNTY_METRIC_LABELS[selectedMetric] : "County ACS layer off", loadedCountyCount, validComparableCount, missingCountyGeoids, containingCountyRank, visibleMin, visibleMax, equalValues, legend: mode === "multi-county-comparison" && visibleMin !== null && visibleMax !== null ? { label: COUNTY_SHADING_LIMITATION, min: visibleMin, max: visibleMax, equalValues } : null, counties, limitations: [COUNTY_SHADING_LIMITATION, COUNTY_VALUE_LIMITATION, COUNTY_RADIUS_LIMITATION] };
}
