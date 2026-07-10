import { useId, useState } from "react";
import type { PublicDataArtifactSummary } from "@/lib/public-data/readPublicDataArtifacts";
import { getSourceCoverageSummaries } from "@/lib/coverage/coverageStatus";

interface Props {
  summary: PublicDataArtifactSummary;
  previewEnabled: boolean;
  onPreviewEnabledChange: (enabled: boolean) => void;
}

function formatDate(value: string | null): string {
  if (!value) return "Not reported";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toISOString().slice(0, 10);
}

export function PublicDataFreshnessPanel({
  summary,
  previewEnabled,
  onPreviewEnabledChange,
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
          {previewEnabled ? "Synthetic demo + CMS preview" : "Synthetic demo active"}
        </span>
        <span aria-hidden>·</span>
        <span>{summary.canPreviewOnMap ? (previewEnabled ? "CMS preview enabled" : "CMS preview available / Preview off") : "Preview blocked"}</span>
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

      <label
        className={`mt-2 flex items-start gap-2 rounded-md border border-amber-200 bg-white/90 p-2 ${expanded ? "" : "sr-only"} ${summary.canPreviewOnMap ? "cursor-pointer" : "cursor-not-allowed opacity-60"}`}
      >
        <input
          className="mt-0.5"
          type="checkbox"
          checked={previewEnabled}
          disabled={!summary.canPreviewOnMap}
          onChange={(event) => onPreviewEnabledChange(event.target.checked)}
        />
        <span>
          <span className="block font-semibold text-slate-900">
            Show explicitly labeled CMS hospital public-data preview layer
          </span>
          <span className="block text-slate-600">
            Optional bounded sample only; default synthetic map behavior is unchanged.
          </span>
        </span>
      </label>

      <div id={detailsId} hidden={!expanded} className="mt-3 space-y-3">
        <dl className="grid grid-cols-2 gap-2 rounded-md border border-amber-200 bg-white/80 p-2 sm:grid-cols-4">
          <div>
            <dt className="font-semibold">Source</dt>
            <dd>{summary.sourceName}</dd>
          </div>
          <div>
            <dt className="font-semibold">CMS hospital artifact</dt>
            <dd>{summary.artifactStatusLabel}</dd>
          </div>
          <div>
            <dt className="font-semibold">Retrieved</dt>
            <dd>{formatDate(summary.retrievedAt)}</dd>
          </div>
          <div>
            <dt className="font-semibold">Records</dt>
            <dd>{summary.recordCount}</dd>
          </div>
          <div>
            <dt className="font-semibold">Mode</dt>
            <dd>
              {summary.dataMode}
              {summary.fixtureMode ? " (fixture)" : ""}
            </dd>
          </div>
          <div>
            <dt className="font-semibold">Geocoding</dt>
            <dd>{summary.geocodingDisplayStatus}</dd>
          </div>
          <div className="sm:col-span-2">
            <dt className="font-semibold">Preview status</dt>
            <dd>
              {summary.canPreviewOnMap
                ? `Available for ${summary.recordCount} live-geocoded CMS hospital records.`
                : `Blocked — ${summary.previewBlockReason}`}
            </dd>
          </div>
        </dl>
        <div className="rounded-md border border-amber-200 bg-white/80 p-2">
          <p className="font-semibold text-slate-900">Coverage manifest summary</p>
          <p className="mt-1 font-medium text-amber-900">Public-data coverage: national coverage in progress</p>
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
