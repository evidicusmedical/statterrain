import type { PopulationMetric } from "@/types/metric";
import { ConfidenceBadge, FreshnessBadge } from "@/components/ui/Badge";
import { getSourceById } from "@/data/sources";
import { MetricDefinitionPanel } from "@/components/population/MetricDefinitionPanel";

export function SummaryCard({ metric }: { metric: PopulationMetric }) {
  const source = getSourceById(metric.sourceId);
  const delta = metric.value.local - metric.value.national;
  const isPercentUnit = metric.unit.includes("%");

  return (
    <div className="rounded-lg border border-slate-200 p-3">
      <div className="flex items-start justify-between gap-2">
        <h3 className="text-sm font-semibold text-slate-800">{metric.label}</h3>
      </div>
      <p className="mt-1 text-2xl font-semibold text-slate-900">
        {metric.value.local}
        {isPercentUnit ? "%" : ""}
        <span className="ml-1 text-xs font-normal text-slate-400">local</span>
      </p>
      <p className="mt-0.5 text-xs text-slate-500">
        State: {metric.value.state}
        {isPercentUnit ? "%" : ""} &middot; National: {metric.value.national}
        {isPercentUnit ? "%" : ""}
      </p>
      <p className={`mt-1 text-xs font-medium ${delta >= 0 ? "text-alert-amber" : "text-terrain-700"}`}>
        {delta >= 0 ? "▲" : "▼"} {Math.abs(delta).toFixed(1)} vs. national
      </p>
      <div className="mt-2 flex flex-wrap gap-1.5">
        <ConfidenceBadge level={metric.confidence} />
        <FreshnessBadge status={metric.freshness} />
      </div>
      {source && <p className="mt-2 text-[11px] text-slate-400">{source.dataset}</p>}
      {metric.marginOfError !== null && (
        <p className="text-[11px] text-slate-400">Margin of error: ±{metric.marginOfError}</p>
      )}
      <MetricDefinitionPanel metric={metric} />
    </div>
  );
}
