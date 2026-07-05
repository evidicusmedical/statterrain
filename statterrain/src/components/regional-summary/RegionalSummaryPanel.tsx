import { populationMetrics } from "@/data/population-metrics";
import { PLANNING_CONSIDERATIONS } from "@/lib/planning-considerations";
import { SummaryCard } from "./SummaryCard";
import type { Facility } from "@/types/facility";
import { FACILITY_TYPE_LABELS } from "@/types/facility";

const FACILITY_COUNT_ORDER: Facility["facilityType"][] = [
  "hospital",
  "critical_access_hospital",
  "pharmacy",
  "dialysis",
  "nursing_home",
  "behavioral_health",
];

export function RegionalSummaryPanel({ facilities }: { facilities: Facility[] }) {
  return (
    <div className="flex flex-col gap-6 p-4">
      <section>
        <h2 className="mb-2 text-sm font-semibold text-slate-900">Facilities in view</h2>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          {FACILITY_COUNT_ORDER.map((type) => (
            <div key={type} className="rounded-md border border-slate-200 p-2.5 text-center">
              <p className="text-xl font-semibold text-slate-900">
                {facilities.filter((f) => f.facilityType === type).length}
              </p>
              <p className="text-[11px] leading-tight text-slate-500">{FACILITY_TYPE_LABELS[type]}</p>
            </div>
          ))}
        </div>
      </section>

      <section>
        <h2 className="mb-2 text-sm font-semibold text-slate-900">Population demographics &amp; health context</h2>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {populationMetrics.map((m) => (
            <SummaryCard key={m.metricId} metric={m} />
          ))}
        </div>
      </section>

      <section>
        <h2 className="mb-2 text-sm font-semibold text-slate-900">Planning considerations</h2>
        <ul className="flex flex-col gap-2">
          {PLANNING_CONSIDERATIONS.map((p) => (
            <li key={p.id} className="rounded-md bg-slate-50 p-2.5 text-xs text-slate-600">
              <span className="mr-1 font-semibold text-slate-700">{p.label}:</span>
              {p.text}
            </li>
          ))}
        </ul>
        <p className="mt-2 text-[11px] italic text-slate-400">
          These are orientation prompts drawn from illustrative demonstration data, not clinical or
          operational recommendations.
        </p>
      </section>
    </div>
  );
}
