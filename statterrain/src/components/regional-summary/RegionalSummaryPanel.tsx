import { populationMetrics } from "@/data/population-metrics";
import { PLANNING_CONSIDERATIONS } from "@/lib/planning-considerations";
import { SummaryCard } from "./SummaryCard";
import type { Facility } from "@/types/facility";
import type { CoverageStatus } from "@/lib/coverage/coverageStatus";
import { FACILITY_TYPE_LABELS } from "@/types/facility";
import { DataFreshnessSummary } from "@/components/sources/DataFreshnessSummary";
import { useState } from "react";
import type { OverlayMetricId } from "@/types/metric";

const FACILITY_COUNT_ORDER: Facility["facilityType"][] = [
  "hospital",
  "critical_access_hospital",
  "pharmacy",
  "dialysis",
  "nursing_home",
  "behavioral_health",
];

interface Props {
  facilities: Facility[];
  radiusMiles: number;
  coverageStatus?: CoverageStatus;
  selectedLocationLabel?: string;
}

export function RegionalSummaryPanel({
  facilities,
  radiusMiles,
  coverageStatus,
  selectedLocationLabel,
}: Props) {
  const [expandedMetricId, setExpandedMetricId] =
    useState<OverlayMetricId | null>(null);

  return (
    <div className="flex flex-col gap-6 p-4">
      <p className="rounded-md bg-slate-50 p-2 text-xs text-slate-600 lg:hidden">
        Use tabs to switch between map, summary, and details.
      </p>
      <section>
        <h2 className="mb-2 text-sm font-semibold text-slate-900">
          Facilities in selected planning radius
        </h2>
        <p className="mb-2 text-xs text-slate-500">
          Search location:{" "}
          {selectedLocationLabel ?? "Terrace Basin Demonstration Region"}.
          Selected planning radius: {radiusMiles} miles. {"Zero-facility results can occur with small radii."}
        </p>
        {coverageStatus && (
          <section
            className="mb-3 rounded-lg border border-amber-200 bg-amber-50 p-3 text-xs text-amber-950"
            aria-label="Coverage status"
          >
            <h3 className="font-semibold text-amber-950">
              {coverageStatus.headline}
            </h3>
            <ul className="mt-1 list-disc pl-4">
              {coverageStatus.messages.map((message) => (
                <li key={message}>{message}</li>
              ))}
            </ul>
          </section>
        )}
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          {FACILITY_COUNT_ORDER.map((type) => (
            <div
              key={type}
              className="rounded-md border border-slate-200 p-2.5 text-center"
              data-testid={type === "hospital" ? "facility-results-count" : `facility-count-${type}`}
            >
              <p className="text-xl font-semibold text-slate-900">
                {facilities.filter((f) => f.facilityType === type).length}
              </p>
              <p className="text-[11px] leading-tight text-slate-500">
                {FACILITY_TYPE_LABELS[type]}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section>
        <h2 className="mb-2 text-sm font-semibold text-slate-900">
          Population demographics &amp; health context
        </h2>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {populationMetrics.map((m) => (
            <SummaryCard
              key={m.metricId}
              metric={m}
              expanded={expandedMetricId === m.metricId}
              onToggleMeaning={() =>
                setExpandedMetricId((current) =>
                  current === m.metricId ? null : m.metricId,
                )
              }
            />
          ))}
        </div>
      </section>

      <DataFreshnessSummary />

      <section>
        <h2 className="mb-2 text-sm font-semibold text-slate-900">
          Beta prototype limitations
        </h2>
        <div className="rounded-md bg-amber-50 p-2.5 text-xs leading-relaxed text-amber-900">
          <p>
            StatTerrain is currently a prototype. Current data are synthetic
            demonstration data, and real public-data ingestion has not started
            yet.
          </p>
          <p className="mt-1">
            Use for planning and situational awareness only — not for live
            routing, diversion, bed status, triage, transfer decisions,
            dispatch, or medical-control advice. Future versions will connect
            official public datasets with source metadata and refresh
            validation.
          </p>
        </div>
      </section>

      <section>
        <h2 className="mb-2 text-sm font-semibold text-slate-900">
          Planning considerations
        </h2>
        <ul className="flex flex-col gap-2">
          {PLANNING_CONSIDERATIONS.map((p) => (
            <li
              key={p.id}
              className="rounded-md bg-slate-50 p-2.5 text-xs text-slate-600"
            >
              <span className="mr-1 font-semibold text-slate-700">
                {p.label}:
              </span>
              {p.text}
            </li>
          ))}
        </ul>
        <p className="mt-2 text-[11px] italic text-slate-400">
          These are orientation prompts drawn from illustrative demonstration
          data, not clinical or operational recommendations.
        </p>
      </section>
    </div>
  );
}
