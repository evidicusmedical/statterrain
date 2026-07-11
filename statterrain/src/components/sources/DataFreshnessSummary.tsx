import { sources } from "@/data/sources";
import { ConfidenceBadge, FreshnessBadge } from "@/components/ui/Badge";

export function DataFreshnessSummary() {
  return (
    <section aria-labelledby="data-freshness-heading" className="rounded-lg border border-slate-200 bg-white p-3">
      <h2 id="data-freshness-heading" className="text-sm font-semibold text-slate-900">Data freshness and source inventory</h2>
      <p className="mt-1 rounded-md bg-terrain-50 p-2 text-xs leading-relaxed text-terrain-900">
        Normal mode uses source-backed national CMS hospital records. Developer/demo fixtures are not shown unless explicitly enabled.
      </p>
      <div className="mt-3 space-y-2">
        {sources.map((source) => (
          <details key={source.id} className="rounded-md border border-slate-200 p-2 text-xs text-slate-600">
            <summary className="cursor-pointer font-semibold text-slate-800">{source.dataset}</summary>
            <dl className="mt-2 grid grid-cols-[auto_1fr] gap-x-2 gap-y-1 leading-relaxed">
              <dt className="font-medium text-slate-700">Source type</dt><dd>Source category</dd>
              <dt className="font-medium text-slate-700">Status</dt><dd>{source.isSynthetic ? "Synthetic demonstration data — not a real-world source." : "Real public source"}</dd>
              <dt className="font-medium text-slate-700">Agency / origin</dt><dd>{source.sourceAgency}</dd>
              <dt className="font-medium text-slate-700">Retrieved</dt><dd>{source.retrievalDate}</dd>
              <dt className="font-medium text-slate-700">Release</dt><dd>{source.releaseDate}</dd>
              <dt className="font-medium text-slate-700">Update cadence</dt><dd>{source.expectedRefreshCadence}</dd>
              <dt className="font-medium text-slate-700">Confidence</dt><dd><ConfidenceBadge level={source.confidence} /></dd>
              <dt className="font-medium text-slate-700">Freshness</dt><dd><FreshnessBadge status={source.freshness} /></dd>
              <dt className="font-medium text-slate-700">Known limitation</dt><dd>{source.limitations.join(" ")}</dd>
            </dl>
          </details>
        ))}
      </div>
    </section>
  );
}
