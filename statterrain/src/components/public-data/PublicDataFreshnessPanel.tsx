import { useId, useState } from "react";
import type { PublicDataArtifactSummary } from "@/lib/public-data/readPublicDataArtifacts";
import { getSourceCoverageSummaries } from "@/lib/coverage/coverageStatus";

interface Props {
  summary: PublicDataArtifactSummary;
  cmsLoad?: { status: string; manifest: any; loadedPartitions: string[]; requestedPartitions: string[]; errors: string[] };
}

function formatDate(value: string | null): string {
  if (!value) return "Not reported";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric", timeZone: "UTC" });
}

export function PublicDataFreshnessPanel({
  summary,
  cmsLoad,
}: Props) {
  const sourceCoverage = getSourceCoverageSummaries();
  const [expanded, setExpanded] = useState(false);
  const detailsId = useId();


  return (
    <section
      className="max-w-[min(36rem,calc(100vw-1.5rem))] rounded-full border border-amber-200 bg-amber-50/95 px-3 py-2 text-xs text-slate-700 shadow-sm backdrop-blur"
      aria-label="Public data source and freshness"
      data-testid="public-data-freshness-panel"
    >
      <div className="flex flex-wrap items-center gap-2">
        <span className="font-semibold text-amber-950">
          CMS hospitals
        </span>
        <span aria-hidden>·</span>
        <span>{cmsLoad?.manifest ? `${cmsLoad.manifest.mapReadyRecords.toLocaleString()} map-ready nationally` : "Loading national public data"}</span>
        <span aria-hidden>·</span>
        <span>Updated {formatDate(cmsLoad?.manifest?.retrievedAt ?? summary.retrievedAt)}</span>
        <button
          type="button"
          className="rounded-md border border-amber-300 bg-white px-2 py-1 font-semibold text-amber-900 shadow-sm hover:bg-amber-100 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2"
          aria-expanded={expanded}
          aria-controls={detailsId}
          onClick={() => setExpanded((value) => !value)}
        >
          {expanded ? "Collapse details" : "Details"}
        </button>
      </div>



      <div id={detailsId} hidden={!expanded} className="mt-3 space-y-3">
        <dl className="grid grid-cols-2 gap-2 rounded-md border border-amber-200 bg-white/80 p-2 sm:grid-cols-4">
          <div>
            <dt className="font-semibold">Source</dt>
            <dd>{cmsLoad?.manifest?.sourceName ?? summary.sourceName}</dd>
          </div>
          <div>
            <dt className="font-semibold">Agency</dt>
            <dd>Centers for Medicare & Medicaid Services</dd>
          </div>
          <div>
            <dt className="font-semibold">Retrieved</dt>
            <dd>{formatDate(cmsLoad?.manifest?.retrievedAt ?? summary.retrievedAt)}</dd>
          </div>
          <div>
            <dt className="font-semibold">Map-ready count</dt>
            <dd>{(cmsLoad?.manifest?.mapReadyRecords ?? summary.recordCount).toLocaleString()}</dd>
          </div>
          <div>
            <dt className="font-semibold">Dataset ID</dt>
            <dd>{summary.datasetId}</dd>
          </div>
          <div>
            <dt className="font-semibold">Geocoding</dt>
            <dd>{summary.geocodingDisplayStatus}</dd>
          </div>
          <div className="sm:col-span-2">
            <dt className="font-semibold">States/territories represented</dt>
            <dd>{cmsLoad?.manifest?.statesPresent?.length ?? "Not reported"}</dd>
          </div>
        </dl>
        <div className="rounded-md border border-amber-200 bg-white/80 p-2">
          <p className="font-semibold text-slate-900">Coverage manifest summary</p>
          <p className="mt-1 font-medium text-amber-900">Public-data coverage: national CMS hospital coverage active</p>
          <ul className="mt-1 list-disc space-y-1 pl-4">
            {sourceCoverage.map((source) => (
              <li key={source.sourceId}>{source.label}</li>
            ))}
          </ul>
        </div>
        <div className="rounded-md border border-slate-200 bg-white/80 p-2">
          <p className="font-semibold text-slate-900">Limitations and prohibited uses</p>
          <p className="mt-1">
            Not allowed for: {summary.prohibitedUses.join(", ") ||
              "clinical, operational, routing, diversion, dispatch, triage, or transfer decisions"}.
          </p>
        </div>
        <button
          type="button"
          className="rounded-md border border-slate-300 bg-white px-2.5 py-1.5 font-semibold text-slate-700 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-terrain-500 focus:ring-offset-2"
          aria-expanded={expanded}
          aria-controls={detailsId}
          onClick={() => setExpanded(false)}
        >
          Collapse details
        </button>
      </div>
    </section>
  );
}
