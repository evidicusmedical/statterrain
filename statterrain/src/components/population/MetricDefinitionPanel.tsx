import type { PopulationMetric } from "@/types/metric";
import { getPopulationMetricDefinition } from "@/config/populationMetricDefinitions";

export function MetricDefinitionPanel({ metric }: { metric: PopulationMetric }) {
  const definition = getPopulationMetricDefinition(metric.metricId);

  return (
    <div className="mt-2 text-[11px] leading-relaxed text-slate-600">
      <p className="rounded-md bg-slate-50 p-2">
        <span className="font-semibold text-slate-700">Quick meaning:</span> {definition.whatThisMeasures}
      </p>
      <details className="mt-2 rounded-md border border-slate-200 bg-slate-50 p-2">
        <summary className="cursor-pointer font-semibold text-terrain-800">What this means</summary>
        <div className="mt-2 space-y-1.5">
          <p><span className="font-semibold text-slate-700">Measures:</span> {definition.whatThisMeasures}</p>
          <p><span className="font-semibold text-slate-700">Current prototype definition:</span> {definition.currentPrototypeDefinition}</p>
          <p><span className="font-semibold text-slate-700">Future real-data definition needed:</span> {definition.futureSourceDefinitionRequirement}</p>
          <p><span className="font-semibold text-slate-700">Denominator / population basis:</span> {definition.denominatorOrBasis}</p>
          <p><span className="font-semibold text-slate-700">Planning relevance:</span> {definition.planningRelevance}</p>
          <p><span className="font-semibold text-slate-700">Known limitations:</span> {definition.knownLimitations}</p>
          <p><span className="font-semibold text-slate-700">Do not infer:</span> {definition.doNotInfer}</p>
          <p className="font-medium text-amber-700">{definition.syntheticDataCaveat}</p>
        </div>
      </details>
    </div>
  );
}
