import { CONFIDENCE_HELP, CONFIDENCE_LABELS, FRESHNESS_HELP, FRESHNESS_LABELS } from "@/types/source";
import type { ConfidenceLevel, FreshnessStatus } from "@/types/source";

const confidenceStyles: Record<ConfidenceLevel, string> = {
  high: "border-terrain-300 bg-terrain-50 text-terrain-800",
  medium: "border-clinical-300 bg-clinical-50 text-clinical-800",
  low: "border-alert-amber/40 bg-amber-50 text-amber-900",
};

const freshnessStyles: Record<FreshnessStatus, string> = {
  current: "border-terrain-300 bg-terrain-50 text-terrain-800",
  watch: "border-amber-300 bg-amber-50 text-amber-900",
  stale: "border-orange-300 bg-orange-50 text-orange-900",
  broken: "border-red-300 bg-red-50 text-red-900",
  manual_review: "border-slate-300 bg-slate-100 text-slate-800",
};

export function ConfidenceBadge({ level }: { level: ConfidenceLevel }) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded border px-2 py-0.5 text-xs font-medium ${confidenceStyles[level]}`}
      title={CONFIDENCE_HELP[level]}
    >
      <span aria-hidden className="text-[10px] uppercase tracking-wide">
        Confidence
      </span>
      {CONFIDENCE_LABELS[level]}
    </span>
  );
}

export function FreshnessBadge({ status }: { status: FreshnessStatus }) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded border px-2 py-0.5 text-xs font-medium ${freshnessStyles[status]}`}
      title={FRESHNESS_HELP[status]}
    >
      <span aria-hidden className="text-[10px] uppercase tracking-wide">
        Freshness
      </span>
      {FRESHNESS_LABELS[status]}
    </span>
  );
}

export function SyntheticBadge() {
  return (
    <span className="inline-flex items-center rounded border border-slate-300 bg-slate-50 px-2 py-0.5 text-xs font-medium text-slate-700">
      Synthetic demonstration data
    </span>
  );
}
