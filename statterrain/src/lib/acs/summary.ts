import { ACS_METRIC_ORDER, type AcsCountyRecord } from "./types";
export interface AcsSummaryState { status: "loading" | "available" | "unavailable" | "error"; containingCounty: AcsCountyRecord | null; intersectingCounties: AcsCountyRecord[]; error?: string; }
export function summarizeAcsCounties(records: AcsCountyRecord[], containingGeoid?: string | null): AcsSummaryState { const containingCounty = containingGeoid ? records.find(r=>r.geoid===containingGeoid) ?? null : records[0] ?? null; return { status: records.length ? "available" : "unavailable", containingCounty, intersectingCounties: records }; }
export function metricRows(county: AcsCountyRecord | null) { return ACS_METRIC_ORDER.map((id)=>({ id, value: county?.metrics[id] ?? null })); }
