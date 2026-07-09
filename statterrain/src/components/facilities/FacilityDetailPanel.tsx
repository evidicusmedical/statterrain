import type { Facility } from "@/types/facility";
import { FACILITY_TYPE_LABELS } from "@/types/facility";
import { ConfidenceBadge, FreshnessBadge } from "@/components/ui/Badge";
import { getSourceById } from "@/data/sources";
import { formatDate } from "@/lib/format";

export function FacilityDetailPanel({ facility }: { facility: Facility | null }) {
  if (!facility) {
    return (
      <div
        className="flex h-full items-center justify-center p-6 text-center text-sm text-slate-500"
        data-testid="facility-detail-empty"
      >
        Select a facility on the map or in the list to view its detail.
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col overflow-y-auto border-l-4 border-terrain-500 bg-terrain-50/30 p-4" data-testid="facility-detail-panel">
      <div className="mb-1 flex items-start justify-between gap-2">
        <h2 className="text-base font-semibold text-slate-900" data-testid="facility-detail-name">
          {facility.name}
        </h2>
      </div>
      <p className="text-sm text-slate-500">{FACILITY_TYPE_LABELS[facility.facilityType]}</p>
      <p className="mt-2 inline-flex w-fit rounded-full bg-terrain-100 px-2.5 py-1 text-xs font-semibold text-terrain-800">
        Selected facility
      </p>
      <p className="mt-1 text-sm text-slate-600">{facility.address}</p>
      <p className="mt-1 text-xs text-slate-500">
        {facility.distanceMiles} mi &middot; approx. {facility.approxDriveTimeMinutes} min demonstration drive time
      </p>

      <div className="mt-3 flex flex-wrap gap-1.5">
        <ConfidenceBadge level={facility.confidence} />
        <FreshnessBadge status={facility.freshness} />
        {facility.criticalAccess && (
          <span className="inline-flex items-center rounded border border-amber-300 bg-amber-50 px-2 py-0.5 text-xs font-medium text-amber-900">
            Critical access hospital
          </span>
        )}
      </div>

      <section className="mt-5">
        <h3 className="text-sm font-semibold text-slate-800">Documented capabilities</h3>
        {facility.capabilities.length === 0 ? (
          <p className="mt-1.5 text-sm text-slate-500">
            No publicly documented specialty capability records are available for this facility in this
            demonstration dataset.
          </p>
        ) : (
          <ul className="mt-2 flex flex-col gap-3">
            {facility.capabilities.map((c) => (
              <li key={c.capability} className="rounded-md border border-slate-200 p-2.5">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-sm font-medium text-slate-800">
                    {c.label}
                    {c.level ? ` — ${c.level}` : ""}
                  </p>
                </div>
                <div className="mt-1 flex flex-wrap gap-1.5">
                  <ConfidenceBadge level={c.confidence} />
                  <FreshnessBadge status={c.freshness} />
                </div>
                <p className="mt-1.5 text-xs text-slate-500">
                  Source: {c.sourceAgency} &middot; Reported {formatDate(c.sourceDate)} &middot; Retrieved{" "}
                  {formatDate(c.retrievalDate)}
                </p>
                {c.limitations.length > 0 && (
                  <p className="mt-1 text-xs italic text-slate-400">{c.limitations.join(" ")}</p>
                )}
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="mt-5">
        <h3 className="text-sm font-semibold text-slate-800">Sources for this facility</h3>
        <ul className="mt-2 flex flex-col gap-2">
          {facility.sourceIds.map((id) => {
            const source = getSourceById(id);
            if (!source) return null;
            return (
              <li key={id} className="rounded-md border border-slate-200 p-2.5 text-xs text-slate-600">
                <p className="font-medium text-slate-800">{source.dataset}</p>
                <p className="text-slate-500">{source.sourceAgency}</p>
                <p className="mt-1">
                  Released {formatDate(source.releaseDate)} &middot; Retrieved{" "}
                  {formatDate(source.retrievalDate)} &middot; Refresh: {source.expectedRefreshCadence}
                </p>
              </li>
            );
          })}
        </ul>
      </section>

      {facility.limitations.length > 0 && (
        <section className="mt-5 rounded-md bg-slate-50 p-3 text-xs text-slate-500">
          <h3 className="mb-1 text-xs font-semibold uppercase tracking-wide text-slate-500">
            Known limitations
          </h3>
          <ul className="list-disc space-y-1 pl-4">
            {facility.limitations.map((l) => (
              <li key={l}>{l}</li>
            ))}
          </ul>
        </section>
      )}

      <p className="mt-5 border-t border-slate-200 pt-3 text-[11px] text-slate-400">
        Synthetic demonstration data — not a real-world source. Not verified operational status. Confirm through official local
        channels before use in planning or clinical decisions.
      </p>
    </div>
  );
}
