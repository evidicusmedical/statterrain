import type { SourceRecord } from "@/types/source";
import { ConfidenceBadge, FreshnessBadge } from "@/components/ui/Badge";
import { formatDate } from "@/lib/format";

export function SourceCard({ source }: { source: SourceRecord }) {
  return (
    <div className="rounded-md border border-slate-200 p-3 text-xs text-slate-600">
      <p className="text-sm font-semibold text-slate-800">{source.dataset}</p>
      <p className="text-slate-500">{source.sourceAgency}</p>
      <div className="mt-2 flex flex-wrap gap-1.5">
        <ConfidenceBadge level={source.confidence} />
        <FreshnessBadge status={source.freshness} />
      </div>
      <dl className="mt-2 grid grid-cols-2 gap-x-2 gap-y-1">
        <dt className="text-slate-400">Released</dt>
        <dd>{formatDate(source.releaseDate)}</dd>
        <dt className="text-slate-400">Retrieved</dt>
        <dd>{formatDate(source.retrievalDate)}</dd>
        <dt className="text-slate-400">Geography</dt>
        <dd>{source.geographyLevel}</dd>
        <dt className="text-slate-400">Refresh cadence</dt>
        <dd>{source.expectedRefreshCadence}</dd>
      </dl>
      <p className="mt-2 italic text-slate-400">{source.limitations.join(" ")}</p>
    </div>
  );
}
