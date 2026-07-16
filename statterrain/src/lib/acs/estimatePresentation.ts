import type { AcsMetricUnit, DemographicPercentageMetric } from "./demographicPercentages";
import type { NationalComparisonStatus } from "./nationalBenchmarks";

/** Public-facing ACS estimate language. Technical fields remain in exports. */
export const estimatePresentation = {
  groupMeasuredLabel: "Group measured",
  groupKind(unit: AcsMetricUnit) {
    return unit === "households" ? "household" : "population";
  },
  formatCountMarginOfError(value: number | null | undefined, unit: AcsMetricUnit) {
    if (value == null || !Number.isFinite(value)) return "Not available";
    return `±${Math.round(value).toLocaleString()} ${unit}`;
  },
  formatPercentageMarginOfError(value: number | null | undefined) {
    return value == null || !Number.isFinite(value)
      ? null
      : `±${value.toLocaleString(undefined, { maximumFractionDigits: 1 })} percentage points`;
  },
  percentageMarginOfErrorUnavailableNote: "A separate margin of error for the percentage is not available.",
  comparison(status: NationalComparisonStatus, unit: AcsMetricUnit) {
    const kind = unit === "households" ? "household" : "population";
    const messages: Record<NationalComparisonStatus, { label: string; detail?: string }> = {
      available: { label: "Available", detail: `The county and United States values use the same ${kind} definition.` },
      "county-unavailable": { label: "Unavailable because the county value is not available." },
      "benchmark-unavailable": { label: "Temporarily unavailable." },
      "universe-mismatch": { label: `Unavailable because the county and national values use different ${kind} definitions.` },
      "release-mismatch": { label: "Unavailable because the values use different ACS releases." },
      "estimate-period-mismatch": { label: "Unavailable because the values describe different estimate periods." },
      "method-mismatch": { label: "Unavailable because the county and national values were calculated differently." },
      "not-comparable": { label: "Is not available for this measure." },
    };
    return messages[status];
  },
  visual: {
    countyLabel: "font-semibold text-slate-900",
    countyValue: "font-semibold text-slate-950",
    secondaryLabel: "font-normal text-slate-600",
    secondaryValue: "font-normal text-slate-700",
    supporting: "font-normal text-slate-600",
  },
};

export function isDerivedAgeMetric(metric: DemographicPercentageMetric) {
  return metric.metricKey === "age18To64";
}
