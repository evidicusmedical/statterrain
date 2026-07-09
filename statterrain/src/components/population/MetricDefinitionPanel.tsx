import type { PopulationMetric } from "@/types/metric";
import { getPopulationMetricDefinition } from "@/config/populationMetricDefinitions";

export function MetricDefinitionPanel({ metric }: { metric: PopulationMetric }) {
  const definition = getPopulationMetricDefinition(metric.metricId);

  return (
    <details className="mt-2 rounded-md border border-slate-200 bg-slate-50 p-2 text-[11px] text-slate-600">
      <summary className="cursor-pointer font-semibold text-terrain-800">What this means</summary>
      <div className="mt-2 space-y-1.5 leading-relaxed">
        <p><span className="font-semibold text-slate-700">Measures:</span> {definition.plainLanguageDefinition}</p>
        <p><span className="font-semibold text-slate-700">Why it matters:</span> {definition.planningRelevance}</p>
        <p><span className="font-semibold text-slate-700">Source / denominator:</span> {definition.denominatorOrBasis} {definition.sourceStatus}</p>
        <p><span className="font-semibold text-slate-700">Known limitation:</span> {definition.knownLimitation}</p>
        <p className="font-medium text-amber-700">{definition.syntheticDataCaveat}</p>
      </div>
    </details>
  );
}
