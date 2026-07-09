import type { PopulationMetric } from "@/types/metric";
import { getPopulationMetricDefinition } from "@/config/populationMetricDefinitions";

export function MetricDefinitionPanel({
  metric,
  expanded,
  onToggle,
}: {
  metric: PopulationMetric;
  expanded: boolean;
  onToggle: () => void;
}) {
  const definition = getPopulationMetricDefinition(metric.metricId);

  const simpleRows = [
    ["What it is", definition.simpleWhatItIs],
    ["Higher means", definition.higherMeans],
    ["Lower means", definition.lowerMeans],
    ["Why it matters", definition.whyItMatters],
    ["Do not assume", definition.doNotAssume],
    ["Current data note", definition.currentDataNote],
  ];

  return (
    <div className="mt-2 text-[11px] leading-relaxed text-slate-600">
      <p className="rounded-md bg-terrain-50 px-2 py-1.5 font-medium text-terrain-900">
        <span className="font-semibold">Quick read:</span>{" "}
        {definition.higherMeans}
      </p>
      <button
        type="button"
        className="mt-2 min-h-11 w-full rounded-md border border-terrain-200 bg-white px-3 py-2 text-left text-xs font-semibold text-terrain-800 hover:bg-terrain-50 focus:outline-none focus:ring-2 focus:ring-terrain-500 focus:ring-offset-2"
        aria-expanded={expanded}
        aria-controls={`${metric.metricId}-meaning-panel`}
        onClick={onToggle}
      >
        {expanded
          ? "Hide plain-language meaning"
          : "Show plain-language meaning"}
      </button>
      {expanded && (
        <div
          id={`${metric.metricId}-meaning-panel`}
          className="mt-2 rounded-md border border-terrain-100 bg-terrain-50 p-2"
          aria-label={`${definition.shortLabel} plain-language meaning`}
        >
          <p className="mb-1 font-semibold text-terrain-900">
            Plain-language meaning
          </p>
          <dl className="space-y-1">
            {simpleRows.map(([label, text]) => (
              <div key={label}>
                <dt className="inline font-semibold text-slate-800">
                  {label}:{" "}
                </dt>
                <dd className="inline">{text}</dd>
              </div>
            ))}
          </dl>
        </div>
      )}
      <details className="mt-2 rounded-md border border-slate-200 bg-slate-50 p-2">
        <summary className="cursor-pointer font-semibold text-terrain-800">
          Source details and technical note
        </summary>
        <div className="mt-2 space-y-1.5">
          <p>
            <span className="font-semibold text-slate-700">
              Detailed measure:
            </span>{" "}
            {definition.whatThisMeasures}
          </p>
          <p>
            <span className="font-semibold text-slate-700">
              Current prototype definition:
            </span>{" "}
            {definition.currentPrototypeDefinition}
          </p>
          <p>
            <span className="font-semibold text-slate-700">
              Future real-data definition needed:
            </span>{" "}
            {definition.futureSourceDefinitionRequirement}
          </p>
          <p>
            <span className="font-semibold text-slate-700">
              Denominator / population basis:
            </span>{" "}
            {definition.denominatorOrBasis}
          </p>
          <p>
            <span className="font-semibold text-slate-700">
              Planning relevance:
            </span>{" "}
            {definition.planningRelevance}
          </p>
          <p>
            <span className="font-semibold text-slate-700">
              Known limitations:
            </span>{" "}
            {definition.knownLimitations}
          </p>
          <p>
            <span className="font-semibold text-slate-700">Do not infer:</span>{" "}
            {definition.doNotInfer}
          </p>
          <p className="font-medium text-amber-700">
            {definition.syntheticDataCaveat}
          </p>
        </div>
      </details>
    </div>
  );
}
