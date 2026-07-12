import type { Facility } from "@/types/facility";
import type { CoverageStatus } from "@/lib/coverage/coverageStatus";

interface Props { facilities: Facility[]; radiusMiles: number; coverageStatus?: CoverageStatus; selectedLocationLabel?: string; containingCountyName?: string | null; }
function Row({ label, value }: { label: string; value: string | number }) { return <div className="flex items-center justify-between gap-3 border-b border-slate-100 py-1 text-xs"><span className="text-slate-500">{label}</span><span className="text-right font-semibold text-slate-900">{value}</span></div>; }
export function RegionalSummaryPanel({ facilities, radiusMiles, coverageStatus, selectedLocationLabel, containingCountyName }: Props) {
  const hospitalCount = facilities.filter((f) => f.facilityType === "hospital" || f.facilityType === "critical_access_hospital").length;
  return <div className="flex flex-col gap-4 p-4">
    <p className="rounded-md bg-slate-50 p-2 text-xs text-slate-600 lg:hidden">Use tabs to switch between map, summary, and details.</p>
    <section><h2 className="mb-2 text-sm font-semibold text-slate-900">Area Summary</h2>
      <div className="rounded-lg border border-slate-200 p-3" data-testid="area-summary">
        <h3 className="mb-1 text-xs font-semibold uppercase tracking-wide text-slate-500">Planning area</h3>
        <Row label="Selected location" value={selectedLocationLabel ?? "Terrace Basin Demonstration Region"} />
        {containingCountyName && <Row label="Containing county" value={containingCountyName} />}
        <Row label="Radius" value={`${radiusMiles} miles`} />
        <h3 className="mb-1 mt-3 text-xs font-semibold uppercase tracking-wide text-slate-500">Facilities</h3>
        <Row label="Total hospitals" value={hospitalCount} />
        <div data-testid="facility-results-count" className="sr-only">{hospitalCount}</div>
        <h3 className="mb-1 mt-3 text-xs font-semibold uppercase tracking-wide text-slate-500">Population demographics</h3>
        <Row label="Total population" value="County context pending" />
        <Row label="Under age 18" value="County context pending" />
        <Row label="Age 65 and older" value="County context pending" />
        <h3 className="mb-1 mt-3 text-xs font-semibold uppercase tracking-wide text-slate-500">Community access and vulnerability indicators</h3>
        <Row label="Below poverty" value="County context pending" />
        <Row label="Uninsured" value="County context pending" />
        <Row label="No vehicle available" value="County context pending" />
        <Row label="Disability" value="County context pending" />
        <Row label="Limited-English-speaking households" value="County context pending" />
      </div>
      {coverageStatus && <section className="mt-3 rounded-lg border border-amber-200 bg-amber-50 p-3 text-xs text-amber-950" aria-label="Coverage status"><h3 className="font-semibold">{coverageStatus.headline}</h3><ul className="mt-1 list-disc pl-4">{coverageStatus.messages.map((m)=><li key={m}>{m}</li>)}</ul></section>}
    </section>
    <section className="mt-auto"><h2 className="mb-2 text-sm font-semibold text-slate-900">Research prototype</h2><div className="rounded-md bg-amber-50 p-2.5 text-xs leading-relaxed text-amber-900"><p>Uses public facility and population data that may be incomplete or delayed.</p><p className="mt-1">Not live hospital status, routing, bed availability, diversion information, or clinical decision support.</p></div></section>
  </div>;
}
