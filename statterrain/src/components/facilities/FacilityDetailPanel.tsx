import type React from "react";
import type { Facility } from "@/types/facility";
import { CAPABILITY_LABELS, FACILITY_TYPE_LABELS, type CapabilityName } from "@/types/facility";
import { ConfidenceBadge, FreshnessBadge } from "@/components/ui/Badge";
import { capabilityDefinitions } from "@/config/capabilityDefinitions";
import { facilityCategoryDefinitions } from "@/config/facilityCategoryDefinitions";
import { getSourceById } from "@/data/sources";
import { formatDate } from "@/lib/format";

const unavailable = "Not available in current source";
const notVerified = "Not verified in current source";
const syntheticValue = "Synthetic demonstration value";
const verifiedYes = "Verified yes";

type DetailRowProps = { label: string; value?: React.ReactNode; status?: string };

function DetailRow({ label, value, status }: DetailRowProps) {
  const displayValue = value ?? unavailable;
  return (
    <div className="grid gap-0.5 border-b border-slate-100 py-2 last:border-b-0">
      <dt className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">{label}</dt>
      <dd className="text-sm text-slate-800">{displayValue}</dd>
      {status && <dd className="text-xs text-slate-500">{status}</dd>}
    </div>
  );
}

function DefinitionDetails({ summary, children }: { summary: string; children: React.ReactNode }) {
  return (
    <details className="mt-2 rounded-md border border-slate-200 bg-white p-2 text-xs text-slate-600">
      <summary className="cursor-pointer font-semibold text-terrain-700">{summary}</summary>
      <div className="mt-2 space-y-1.5">{children}</div>
    </details>
  );
}

function capabilityGlossaryTerms(capability: CapabilityName) {
  const map: Partial<Record<CapabilityName, string[]>> = {
    trauma_level_i: ["Trauma center"],
    trauma_level_ii: ["Trauma center"],
    trauma_level_iii: ["Trauma center"],
    pediatric_trauma: ["Trauma center", "Pediatric capability"],
    burn_center: ["Pediatric capability"],
    acute_stroke_ready: ["Stroke center", "Acute stroke ready hospital"],
    primary_stroke_center: ["Stroke center", "Primary stroke center"],
    thrombectomy_capable: ["Stroke center", "Thrombectomy-capable stroke center"],
    comprehensive_stroke_center: ["Stroke center", "Comprehensive stroke center"],
    stemi_pci: ["STEMI / PCI capability"],
    pediatric_emergency: ["Emergency department", "Pediatric capability"],
    behavioral_health_receiving: ["Behavioral health capability"],
    behavioral_health_capability: ["Behavioral health capability"],
    dialysis_related_capability: ["Dialysis-related capability"],
    emergency_department: ["Emergency department"],
    critical_access_hospital: ["Critical access hospital"],
  };
  return map[capability] ?? [];
}

export function FacilityDetailPanel({ facility }: { facility: Facility | null }) {
  if (!facility) {
    return (
      <div className="flex h-full items-center justify-center p-6 text-center text-sm text-slate-500" data-testid="facility-detail-empty">
        Select a facility on the map or in the list to view its detail.
      </div>
    );
  }

  const categoryDefinition = facilityCategoryDefinitions[facility.facilityType];
  const sourceRecords = facility.sourceIds.map(getSourceById).filter(Boolean);
  const sourceDates = sourceRecords.map((s) => s?.releaseDate).filter(Boolean) as string[];
  const retrievalDates = sourceRecords.map((s) => s?.retrievalDate).filter(Boolean) as string[];
  const sourceLinkCount = sourceRecords.filter((s) => s?.sourceUrl).length;

  return (
    <div className="flex h-full flex-col overflow-y-auto border-l-4 border-terrain-500 bg-terrain-50/30 p-4" data-testid="facility-detail-panel">
      <section aria-labelledby="facility-identity-heading">
        <h2 id="facility-identity-heading" className="text-sm font-semibold uppercase tracking-wide text-slate-500">Facility identity</h2>
        <h3 className="mt-1 text-base font-semibold text-slate-900" data-testid="facility-detail-name">{facility.name}</h3>
        <dl className="mt-2 rounded-md border border-slate-200 bg-white px-3">
          <DetailRow label="Name" value={facility.name} status={syntheticValue} />
          <DetailRow label="Facility type" value={FACILITY_TYPE_LABELS[facility.facilityType]} status={verifiedYes} />
          <DetailRow label="Address" value={facility.address} status={syntheticValue} />
          <DetailRow label="City/state/ZIP" value={[facility.city, facility.state, facility.zip].filter(Boolean).join(", ") || undefined} />
        </dl>
        <DefinitionDetails summary={`What this means: ${categoryDefinition.label}`}>
          <p><strong>Plain-language meaning:</strong> {categoryDefinition.plainLanguageMeaning}</p>
          <p><strong>Planning relevance:</strong> {categoryDefinition.planningRelevance}</p>
          <p><strong>Known limitation:</strong> {categoryDefinition.knownLimitation}</p>
        </DefinitionDetails>
      </section>

      <section className="mt-5" aria-labelledby="capability-summary-heading">
        <h2 id="capability-summary-heading" className="text-sm font-semibold uppercase tracking-wide text-slate-500">Capability summary</h2>
        <div className="mt-2 flex flex-wrap gap-1.5">
          <ConfidenceBadge level={facility.confidence} />
          <FreshnessBadge status={facility.freshness} />
          <span className="inline-flex items-center rounded border border-slate-200 bg-white px-2 py-0.5 text-xs font-medium text-slate-700">Missing public data is not absence of capability</span>
        </div>
        {facility.capabilities.length === 0 ? (
          <p className="mt-2 text-sm text-slate-500">Specialty capabilities: {unavailable}. Missing public data must not be treated as absence of capability.</p>
        ) : (
          <ul className="mt-2 flex flex-col gap-3">
            {facility.capabilities.map((c) => {
              const definitions = capabilityGlossaryTerms(c.capability)
                .map((term) => capabilityDefinitions.find((d) => d.term === term))
                .filter(Boolean);
              return (
                <li key={c.capability} className="rounded-md border border-slate-200 bg-white p-2.5">
                  <p className="text-sm font-medium text-slate-800">{c.label}{c.level ? ` — ${c.level}` : ""}</p>
                  <p className="mt-1 text-xs text-slate-600">Capability status: {verifiedYes}</p>
                  <p className="text-xs text-slate-600">Population served: {c.populationServed ?? notVerified}</p>
                  <div className="mt-1 flex flex-wrap gap-1.5"><ConfidenceBadge level={c.confidence} /><FreshnessBadge status={c.freshness} /></div>
                  <p className="mt-1.5 text-xs text-slate-500">Source: {c.sourceAgency} &middot; Reported {formatDate(c.sourceDate)} &middot; Retrieved {formatDate(c.retrievalDate)}</p>
                  {definitions.length > 0 && (
                    <DefinitionDetails summary={`Capability definition: ${definitions[0]?.term}`}>
                      {definitions.map((definition) => definition && (
                        <div key={definition.term} className="space-y-1">
                          <p><strong>{definition.term}:</strong> {definition.plainLanguageDefinition}</p>
                          <p><strong>Planning relevance:</strong> {definition.planningRelevance}</p>
                          <p><strong>Known limitation:</strong> {definition.knownLimitation}</p>
                          <p><strong>Operational caution:</strong> {definition.operationalCaution}</p>
                        </div>
                      ))}
                    </DefinitionDetails>
                  )}
                  {c.limitations.length > 0 && <p className="mt-1 text-xs italic text-slate-400">{c.limitations.join(" ")}</p>}
                </li>
              );
            })}
          </ul>
        )}
        <DefinitionDetails summary="Hospital capability glossary">
          {capabilityDefinitions.map((definition) => (
            <p key={definition.term}><strong>{definition.term}:</strong> {definition.plainLanguageDefinition} {definition.operationalCaution}</p>
          ))}
        </DefinitionDetails>
        <dl className="mt-3 rounded-md border border-slate-200 bg-white px-3">
          {Object.entries(CAPABILITY_LABELS).slice(0, 8).map(([key, label]) => (
            <DetailRow key={key} label={label} value={facility.capabilities.some((c) => c.capability === key) ? verifiedYes : unavailable} />
          ))}
        </dl>
      </section>

      <section className="mt-5" aria-labelledby="contact-access-heading">
        <h2 id="contact-access-heading" className="text-sm font-semibold uppercase tracking-wide text-slate-500">Contact and access information</h2>
        <dl className="mt-2 rounded-md border border-slate-200 bg-white px-3">
          <DetailRow label="Phone" value={facility.phone} />
          <DetailRow label="Website" value={facility.website ? <a className="text-terrain-700 underline" href={facility.website}>{facility.website}</a> : undefined} />
          <DetailRow label="Email" value={facility.email} />
          <DetailRow label="Fax" value={facility.fax} />
          <DetailRow label="Approximate drive time" value={`${facility.distanceMiles} mi · approx. ${facility.approxDriveTimeMinutes} min demonstration drive time`} status={syntheticValue} />
        </dl>
      </section>

      <section className="mt-5" aria-labelledby="source-quality-heading">
        <h2 id="source-quality-heading" className="text-sm font-semibold uppercase tracking-wide text-slate-500">Source and data quality</h2>
        <p className="mt-2 rounded-md border border-amber-200 bg-amber-50 p-2 text-sm font-semibold text-amber-900">Synthetic demonstration data — not a real-world source.</p>
        <dl className="mt-2 rounded-md border border-slate-200 bg-white px-3">
          <DetailRow label="Synthetic/real status" value="Synthetic demonstration data — not a real-world source." />
          <DetailRow label="Source dataset" value={sourceRecords.map((s) => s?.dataset).join("; ") || undefined} />
          <DetailRow label="Source confidence" value={facility.confidence} />
          <DetailRow label="Source date" value={sourceDates.length ? sourceDates.map(formatDate).join("; ") : undefined} />
          <DetailRow label="Retrieved date" value={retrievalDates.length ? retrievalDates.map(formatDate).join("; ") : undefined} />
          <DetailRow label="Source link" value={sourceLinkCount ? `${sourceLinkCount} source link(s) listed below` : undefined} />
        </dl>
        <ul className="mt-2 flex flex-col gap-2">
          {sourceRecords.map((source) => source && (
            <li key={source.id} className="rounded-md border border-slate-200 bg-white p-2.5 text-xs text-slate-600">
              <p className="font-medium text-slate-800">{source.dataset}</p>
              <p className="text-slate-500">{source.sourceAgency}</p>
              <p className="mt-1">Released {formatDate(source.releaseDate)} &middot; Retrieved {formatDate(source.retrievalDate)} &middot; Refresh: {source.expectedRefreshCadence}</p>
              <p className="mt-1">Source link: {source.sourceUrl ? <a className="text-terrain-700 underline" href={source.sourceUrl}>{source.sourceUrl}</a> : unavailable}</p>
            </li>
          ))}
        </ul>
      </section>

      <section className="mt-5 rounded-md bg-slate-50 p-3 text-xs text-slate-500" aria-labelledby="known-limitations-heading">
        <h2 id="known-limitations-heading" className="mb-1 text-sm font-semibold uppercase tracking-wide text-slate-500">Known limitations</h2>
        <ul className="list-disc space-y-1 pl-4">
          {(facility.limitations.length ? facility.limitations : ["No facility-specific limitations beyond synthetic demonstration status are available in the current source."]).map((l) => <li key={l}>{l}</li>)}
          <li>Missing public data must not be treated as absence of capability.</li>
          <li>Not live routing, diversion, transfer, bed-status, medical-control, destination, or clinical decision support.</li>
        </ul>
      </section>
    </div>
  );
}
