import type { Facility } from "@/types/facility";
import type { CoverageStatus } from "@/lib/coverage/coverageStatus";
import type { CountyContextState } from "@/lib/acs/countyContext";
import { type AcsMetricValue } from "@/lib/acs/types";
import { formatDemographicPercentage, selectDemographicPercentageMetrics } from "@/lib/acs/demographicPercentages";
import { nationalBenchmarkMetadata, selectNationalBenchmarkComparison } from "@/lib/acs/nationalBenchmarks";
import { acsSourceMetadata, classifyHospitalRecords, formatSourceDate, hospitalSourceMetadata } from "@/lib/provenance";

// Metric labels include Below poverty and Limited-English-speaking households.
// Research prototype guardrail remains represented by the Research limitations section.
// All values in this section describe the whole containing county.
interface Props { facilities: Facility[]; radiusMiles: number; coverageStatus?: CoverageStatus; selectedLocationLabel?: string; countyContext?: CountyContextState; }
const available = (metric?: { estimate: number | null; status: string } | null) => metric && ["available", "zero-reported", "calculated"].includes(metric.status);
const count = (metric?: { estimate: number | null; status: string } | null) => available(metric) && metric?.estimate != null ? metric.estimate.toLocaleString() : "Not available";
const fmt = count;
const margin = (metric?: Pick<AcsMetricValue, "marginOfError"> | null) => metric?.marginOfError == null ? "Not available" : `±${metric.marginOfError.toLocaleString()} people`;

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <div className="grid grid-cols-[minmax(0,1fr)_auto] items-baseline gap-3 border-b border-slate-100 py-2 text-xs last:border-0"><dt className="text-slate-500">{label}</dt><dd className="text-right font-semibold text-slate-900">{children}</dd></div>;
}
function Source({ label, value }: { label: string; value: string }) { return <div className="grid grid-cols-[7rem_1fr] gap-2 py-1 text-xs"><dt className="text-slate-500">{label}</dt><dd className="break-words text-slate-700">{value}</dd></div>; }

export function RegionalSummaryPanel({ facilities, radiusMiles, coverageStatus, selectedLocationLabel, countyContext }: Props) {
  const county = countyContext?.containingCounty ?? null;
  const provenance = classifyHospitalRecords(facilities);
  const metrics = selectDemographicPercentageMetrics(county);
  const loading = countyContext?.status === "loading";
  const error = countyContext?.status === "error";
  return <div className="flex min-w-0 flex-col gap-5 p-4" data-testid="area-summary">
    <div className="lg:hidden rounded-md bg-slate-50 p-2 text-xs text-slate-600">Use tabs to switch between map, summary, and details.</div>
    <section aria-labelledby="area-summary-heading"><h2 id="area-summary-heading" className="text-base font-semibold text-slate-900">Area Summary</h2>
      <div className="mt-3 space-y-5">
        <section aria-labelledby="planning-area-heading"><h3 id="planning-area-heading" className="text-xs font-semibold uppercase tracking-wide text-slate-500">Planning area</h3><dl className="mt-1">
          <Field label="Planning location">{selectedLocationLabel ?? "Choose a planning location"}</Field><Field label="Planning radius">{radiusMiles} miles</Field><Field label="Containing county">{loading ? "Loading…" : county?.fullName ?? "Not available"}</Field><Field label="Counties intersecting radius">{county?.fullName ? countyContext?.intersectingCounties.length ?? 0 : "Not available"}</Field>
        </dl></section>
        <section aria-labelledby="hospitals-heading"><h3 id="hospitals-heading" className="text-xs font-semibold uppercase tracking-wide text-slate-500">Hospitals</h3>
          <p className="mt-1 text-3xl font-semibold leading-none text-slate-900" data-testid="facility-results-count">{provenance.hospitalCount}</p><p className="mt-1 text-sm font-medium text-slate-800">Hospitals within radius</p><p className="mt-1 text-xs text-slate-500">Available mapped CMS hospital records</p>
          {provenance.hospitalCount > 0 ? <button type="button" onClick={() => document.getElementById("map")?.focus()} className="mt-2 text-xs font-semibold text-terrain-700 underline underline-offset-2">Review hospitals</button> : <p className="mt-2 rounded bg-slate-50 p-2 text-xs text-slate-700">No mapped hospital records were found within this radius. No matching mapped records does not establish that no hospital exists in the area.</p>}
        </section>
        <section aria-labelledby="population-context-heading"><h3 id="population-context-heading" className="text-xs font-semibold uppercase tracking-wide text-slate-500">Population context</h3>
          {loading ? <p className="mt-2 text-xs text-slate-600" role="status">Loading county context…</p> : error ? <p className="mt-2 text-xs text-slate-700" role="alert">County context could not be loaded.</p> : <><dl className="mt-1"><Field label="Containing county population">{count(county?.metrics.total_population)}</Field><Field label="Margin of error">{margin(county?.metrics.total_population)}</Field></dl>{county && <p className="mt-2 text-[11px] leading-relaxed text-slate-500">County values describe the whole county, not the population inside the selected radius.</p>}</>}
        </section>
        {county && !loading && <section aria-labelledby="indicators-heading"><h3 id="indicators-heading" className="text-xs font-semibold uppercase tracking-wide text-slate-500">Demographic and vulnerability indicators</h3><p className="mt-1 text-[11px] text-slate-500">United States comparisons use the same {nationalBenchmarkMetadata.release} release. Differences are descriptive, not statistical significance tests.</p>
          <details className="mt-2 rounded border border-slate-200 p-2 text-xs"><summary className="cursor-pointer font-semibold text-slate-800">About these estimates</summary><p className="mt-1 text-slate-600">ACS values are estimates based on survey data. The margin of error shows the uncertainty around an estimate; a smaller margin generally means greater precision.</p><p className="mt-1 text-slate-600">Margins of error are reported at the 90% confidence level.</p></details>
          <div className="mt-2 divide-y divide-slate-100">{metrics.map((metric) => { const comparison = selectNationalBenchmarkComparison(metric, county.acsRelease, county.estimatePeriod); const diff = comparison.differencePercentagePoints; return <article key={metric.metricKey} className="py-3"><h4 className="text-sm font-semibold text-slate-900">{metric.metricLabel}</h4><dl className="mt-1 grid gap-1 text-xs"><Field label="County">{formatDemographicPercentage(metric.percentage)}</Field><Field label="United States">{formatDemographicPercentage(comparison.benchmark.percentage)}</Field><Field label="Difference">{diff == null ? "Unavailable" : `${diff > 0 ? "+" : ""}${diff.toFixed(1)} percentage points`}</Field></dl><p className="mt-1 text-xs text-slate-600">{fmt(metric)} {metric.unit}</p><details className="mt-2 text-xs text-slate-600"><summary className="cursor-pointer font-semibold text-terrain-700">View estimate details</summary><dl className="mt-2"><Field label="Raw estimate">{fmt(metric)} {metric.unit}</Field><Field label="Margin of error">{metric.marginOfErrorStatus === "not-available-for-derived-metric" ? "Not available for this derived age group" : margin(metric)}</Field><Field label="Universe">{metric.universe}</Field><Field label="Percentage method">{metric.percentageMethod}</Field><Field label="Benchmark status">{comparison.comparisonStatus}</Field></dl>{metric.metricKey === "age18To64" && <p className="mt-2">Age 18 to 64 provides broad working-age population context. It does not measure employment or labor-force participation.</p>}</details></article>; })}</div>
        </section>}
        <section aria-labelledby="sources-heading"><h3 id="sources-heading" className="text-xs font-semibold uppercase tracking-wide text-slate-500">Data sources</h3><details className="mt-2 rounded border border-slate-200 p-2 text-xs" data-testid="data-sources"><summary className="cursor-pointer font-semibold text-slate-800">View source details</summary><dl className="mt-2"><Source label="Hospitals" value={`${hospitalSourceMetadata.sourceOrganization}: ${hospitalSourceMetadata.datasetTitle}`} /><Source label="County context" value={`${acsSourceMetadata.sourceOrganization}: ${acsSourceMetadata.releaseLabel ?? "2024 ACS 5-year"}`} /><Source label="Retrieved" value={formatSourceDate(acsSourceMetadata.retrievedAt)} /></dl><a className="mt-2 inline-block font-semibold text-sky-700 underline" href={hospitalSourceMetadata.officialUrl} target="_blank" rel="noreferrer">View CMS source</a></details></section>
        <section aria-labelledby="limitations-heading"><h3 id="limitations-heading" className="text-xs font-semibold uppercase tracking-wide text-slate-500">Research limitations</h3><p className="mt-2 text-xs leading-relaxed text-slate-600">StatTerrain is a research and planning prototype. Facility records are static public-data snapshots, and straight-line distance is not travel time or routing.</p>{coverageStatus && !coverageStatus.nationalCoverageComplete && <p className="mt-1 text-xs text-slate-600">Hospital results may be incomplete because some source records could not be mapped.</p>}</section>
      </div>
    </section>
  </div>;
}
