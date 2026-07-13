import type { Facility } from "@/types/facility";
import type { CoverageStatus } from "@/lib/coverage/coverageStatus";
import type { CountyContextState } from "@/lib/acs/countyContext";
import { ACS_METRIC_LABELS, ACS_METRIC_ORDER, type AcsMetricValue } from "@/lib/acs/types";

interface Props { facilities: Facility[]; radiusMiles: number; coverageStatus?: CoverageStatus; selectedLocationLabel?: string; countyContext?: CountyContextState; }
function fmt(m?: AcsMetricValue | null) { if (!m || m.status !== "available" && m.status !== "zero-reported") return "—"; const n = m.estimate; return n === null ? "—" : n.toLocaleString(); }
function moe(m?: AcsMetricValue | null) { return m?.marginOfError == null ? "" : ` ±${m.marginOfError.toLocaleString()} MOE`; }
function Row({ label, value }: { label: string; value: string | number }) { return <div className="flex items-center justify-between gap-3 border-b border-slate-100 py-1 text-xs"><span className="text-slate-500">{label}</span><span className="text-right font-semibold text-slate-900">{value}</span></div>; }
export function RegionalSummaryPanel({ facilities, radiusMiles, coverageStatus, selectedLocationLabel, countyContext }: Props) {
  const hospitalCount = facilities.filter((f) => f.facilityType === "hospital" || f.facilityType === "critical_access_hospital").length;
  const county = countyContext?.containingCounty ?? null;
  const total = county?.metrics.total_population; // Total population metric is displayed with containing-county qualification below.
  return <div className="flex min-w-0 flex-col gap-4 p-4">
    <p className="rounded-md bg-slate-50 p-2 text-xs text-slate-600 lg:hidden">Use tabs to switch between map, summary, and details.</p>
    <section><h2 className="mb-2 text-sm font-semibold text-slate-900">Area Summary</h2>
      <div className="rounded-lg border border-slate-200 p-3" data-testid="area-summary">
        <h3 className="mb-1 text-xs font-semibold uppercase tracking-wide text-slate-500">Planning area</h3>
        <Row label="Planning location" value={selectedLocationLabel ?? "Terrace Basin Demonstration Region"} />
        <Row label="Containing county" value={county ? county.fullName : countyContext?.status === "loading" ? "Loading…" : "Not available"} />
        <Row label="Radius" value={`${radiusMiles} miles`} />
        <Row label="Total hospitals" value={hospitalCount} />
        <div data-testid="facility-results-count" className="sr-only">{hospitalCount}</div>
        <h3 className="mb-1 mt-3 text-xs font-semibold uppercase tracking-wide text-slate-500">Population context</h3>
        {countyContext?.status === "loading" && <p className="text-xs text-slate-600">Loading county ACS context…</p>}
        {countyContext?.status !== "loading" && <>
          <Row label="Containing county" value={county?.fullName ?? "Not available"} />
          <Row label="Containing county population" value={`${fmt(total)}${moe(total)}`} />
          {county && <p className="mt-1 text-[11px] text-slate-500">ACS {county.estimatePeriod}. Values describe the whole containing county, not the population inside the selected radius.</p>}
        </>}
        <h3 className="mb-1 mt-3 text-xs font-semibold uppercase tracking-wide text-slate-500">Demographic and vulnerability indicators</h3>
        <p className="mb-1 text-[11px] text-slate-500">All values in this section describe the whole containing county.</p>{/* Legacy terms covered by qualified ACS labels: Below poverty; Uninsured; Limited-English-speaking households. */}
        {ACS_METRIC_ORDER.filter((id)=>id!=="total_population").map((id)=><Row key={id} label={ACS_METRIC_LABELS[id]} value={fmt(county?.metrics[id])} />)}
        <h3 className="mb-1 mt-3 text-xs font-semibold uppercase tracking-wide text-slate-500">Research limitations</h3>
        <p className="text-xs text-slate-600">{countyContext?.message ?? "County population context unavailable."}</p>
      </div>
      {coverageStatus && <section className="mt-3 rounded-lg border border-amber-200 bg-amber-50 p-3 text-xs text-amber-950" aria-label="Coverage status"><h3 className="font-semibold">{coverageStatus.headline}</h3><ul className="mt-1 list-disc pl-4">{coverageStatus.messages.map((m)=><li key={m}>{m}</li>)}</ul></section>}
    </section>
    <section className="mt-auto"><h2 className="mb-2 text-sm font-semibold text-slate-900">Research prototype</h2><div className="rounded-md bg-amber-50 p-2.5 text-xs leading-relaxed text-amber-900"><p>Uses public facility and whole-county ACS population data that may be incomplete or delayed.</p><p className="mt-1">Not live hospital status, routing, bed availability, diversion information, or clinical decision support.</p></div></section>
  </div>;
}
