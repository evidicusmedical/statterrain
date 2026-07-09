import type { PublicDataArtifactSummary } from "@/lib/public-data/readPublicDataArtifacts";

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
  return (
    <section
      className="border-b border-slate-200 bg-amber-50 px-4 py-3 text-xs text-slate-700"
      aria-label="Public data source and freshness"
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="text-sm font-semibold text-slate-900">
            Public-data source & freshness preview
          </h2>
          <p className="mt-1 font-medium text-amber-900">
            Current map data: {summary.currentMapDataLabel}
          </p>
          <p className="mt-1 text-amber-950">Main map remains synthetic.</p>
        </div>
        <span
          className={`rounded-full px-2 py-1 font-semibold ${summary.canPreviewOnMap ? "bg-emerald-100 text-emerald-800" : "bg-slate-200 text-slate-700"}`}
        >
          {summary.canPreviewOnMap ? "Preview available" : "Preview blocked"}
        </span>
      </div>
      <dl className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
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
          <dd>Blocked — {summary.previewBlockReason}</dd>
        </div>
      </dl>
      <label
        className={`mt-3 flex items-center gap-2 ${summary.canPreviewOnMap ? "cursor-pointer" : "cursor-not-allowed opacity-60"}`}
      >
        <input
          type="checkbox"
          checked={previewEnabled}
          disabled={!summary.canPreviewOnMap}
          onChange={(event) => onPreviewEnabledChange(event.target.checked)}
        />
        <span className="font-semibold">
          Show explicitly labeled CMS hospital public-data preview layer
        </span>
      </label>
      <p className="mt-2">
        Not allowed for:{" "}
        {summary.prohibitedUses.join(", ") ||
          "clinical, operational, routing, diversion, dispatch, triage, or transfer decisions"}
        .
      </p>
    </section>
  );
}
