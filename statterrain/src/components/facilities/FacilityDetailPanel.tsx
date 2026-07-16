import type React from "react";
import type { Facility } from "@/types/facility";
import {
  CAPABILITY_LABELS,
  FACILITY_TYPE_LABELS,
  type CapabilityName,
} from "@/types/facility";
import { ConfidenceBadge, FreshnessBadge } from "@/components/ui/Badge";
import { capabilityDefinitions } from "@/config/capabilityDefinitions";
import { facilityCategoryDefinitions } from "@/config/facilityCategoryDefinitions";
import { getSourceById } from "@/data/sources";
import { formatDate } from "@/lib/format";
import {
  buildSafeTelephoneHref,
  formatFacilityAddress,
  normalizeCmsPhoneDisplay,
  normalizeFacilityWebsite,
} from "@/lib/facilityIdentity";

const unavailable = "Not available in current source";
const notVerified = "Not verified in current source";
const syntheticValue = "Synthetic demonstration value";
const verifiedYes = "Verified yes";

type DetailRowProps = {
  label: string;
  value?: React.ReactNode;
  status?: string;
};

function DetailRow({ label, value, status }: DetailRowProps) {
  if (value === undefined || value === null || value === "") return null;
  return (
    <div className="grid gap-1 border-b border-slate-100 py-3 last:border-b-0">
      <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">
        {label}
      </dt>
      <dd className="text-base leading-6 text-slate-800">{value}</dd>
      {status && <dd className="text-sm text-slate-500">{status}</dd>}
    </div>
  );
}

function DefinitionDetails({
  summary,
  children,
}: {
  summary: string;
  children: React.ReactNode;
}) {
  return (
    <details className="mt-3 rounded-lg border border-slate-200 bg-white p-3 text-sm text-slate-600">
      <summary className="cursor-pointer font-semibold text-terrain-700">
        {summary}
      </summary>
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
    thrombectomy_capable: [
      "Stroke center",
      "Thrombectomy-capable stroke center",
    ],
    comprehensive_stroke_center: [
      "Stroke center",
      "Comprehensive stroke center",
    ],
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

export function FacilityDetailPanel({
  facility,
  onClose,
  headingRef,
  scenarioIncluded = false,
  onAddToScenario,
  onRemoveFromScenario,
}: {
  facility: Facility | null;
  onClose?: () => void;
  headingRef?: React.RefObject<HTMLHeadingElement>;
  scenarioIncluded?: boolean;
  onAddToScenario?: (facility: Facility) => void;
  onRemoveFromScenario?: (facility: Facility) => void;
}) {
  if (!facility) {
    return (
      <div
        className="flex h-full min-h-[18rem] items-center justify-center bg-white p-6 text-center text-base text-slate-600"
        data-testid="facility-detail-empty"
      >
        Select a facility on the map to view details.
      </div>
    );
  }

  const categoryDefinition = facilityCategoryDefinitions[facility.facilityType];
  const sourceRecords = facility.sourceIds.map(getSourceById).filter(Boolean);
  const sourceDates = sourceRecords
    .map((s) => s?.releaseDate)
    .filter(Boolean) as string[];
  const retrievalDates = sourceRecords
    .map((s) => s?.retrievalDate)
    .filter(Boolean) as string[];
  const sourceLinkCount = sourceRecords.filter((s) => s?.sourceUrl).length;
  const isCmsRecord = !facility.isSynthetic && facility.id.startsWith("cms-");
  const phoneDisplay = normalizeCmsPhoneDisplay(facility.phone);
  const phoneLink = buildSafeTelephoneHref(facility.phone);
  const websiteLink = normalizeFacilityWebsite(facility.website);
  const formattedAddress = formatFacilityAddress(facility);
  const emergencyValue =
    facility.emergencyServicesIndicator === "Yes" ||
    facility.emergencyServicesIndicator === "No"
      ? facility.emergencyServicesIndicator
      : "Not reported in this source";

  return (
    <div
      className="flex h-full w-full max-w-none flex-col overflow-y-auto border-l-0 border-t-4 border-terrain-500 bg-terrain-50/30 p-4 sm:p-5 lg:border-l-4 lg:border-t-0"
      data-testid="facility-detail-panel"
      onKeyDown={(event) => {
        if (event.key === "Escape") onClose?.();
      }}
    >
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-slate-500">
            Facility Details
          </p>
          <h2
            ref={headingRef}
            tabIndex={-1}
            id="facility-detail-heading"
            className="mt-2 break-words text-2xl font-semibold leading-tight text-slate-900 lg:text-xl"
            data-testid="facility-detail-name"
          >
            {facility.name}
          </h2>
        </div>
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="min-h-10 shrink-0 rounded-md border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-terrain-500 focus:ring-offset-2"
          >
            Close details
          </button>
        )}
      </div>
      {(onAddToScenario || onRemoveFromScenario) && <button type="button" onClick={() => scenarioIncluded ? onRemoveFromScenario?.(facility) : onAddToScenario?.(facility)} className="mb-3 w-fit rounded border border-terrain-700 bg-white px-3 py-2 text-sm font-semibold text-terrain-800">{scenarioIncluded ? "Remove from scenario" : "Add to scenario"}</button>}
      <section aria-labelledby="facility-detail-heading">
        <dl className="mt-3 rounded-lg border border-slate-200 bg-white px-4">
          <DetailRow
            label="Facility type"
            value={FACILITY_TYPE_LABELS[facility.facilityType]}
          />
          <DetailRow
            label="Distance"
            value={`${facility.distanceMiles} miles straight-line`}
          />
          <DetailRow
            label="Address"
            value={formattedAddress?.split("\n").map((line) => (
              <span key={line} className="block">{line}</span>
            ))}
          />
          <DetailRow
            label="Phone"
            value={phoneDisplay && phoneLink ? <a className="text-terrain-700 underline" href={phoneLink}>{phoneDisplay}</a> : phoneDisplay}
          />
          <DetailRow
            label="CMS facility ID"
            value={facility.sourceFacilityId ?? facility.sourceIds[0]}
            status={isCmsRecord ? "CMS public-data record" : syntheticValue}
          />
          <DetailRow
            label="Hospital type"
            value={facility.hospitalType}
            status="CMS hospital_type"
          />
          <DetailRow
            label="Critical access"
            value={facility.criticalAccess ? "Yes" : undefined}
            status="Mapped only from CMS hospital_type = Critical Access Hospitals"
          />
          <DetailRow
            label="Ownership"
            value={facility.ownershipType}
            status="CMS hospital_ownership"
          />
        </dl>
        <DefinitionDetails
          summary={`What this means: ${categoryDefinition.label}`}
        >
          <p>
            <strong>Plain-language meaning:</strong>{" "}
            {categoryDefinition.plainLanguageMeaning}
          </p>
          <p>
            <strong>Planning relevance:</strong>{" "}
            {categoryDefinition.planningRelevance}
          </p>
          <p>
            <strong>Known limitation:</strong>{" "}
            {categoryDefinition.knownLimitation}
          </p>
        </DefinitionDetails>
      </section>

      <section className="mt-5" aria-labelledby="facility-location-heading">
        <h2
          id="facility-location-heading"
          className="text-sm font-semibold uppercase tracking-wide text-slate-500"
        >
          Location
        </h2>
        <dl className="mt-3 rounded-lg border border-slate-200 bg-white px-4">
          <DetailRow
            label="Address"
            value={formattedAddress?.split("\n").map((line) => (
              <span key={line} className="block">
                {line}
              </span>
            ))}
            status={
              isCmsRecord
                ? "CMS address fields with geocoded coordinates"
                : syntheticValue
            }
          />
          <DetailRow label="County" value={facility.countyName} />
        </dl>
      </section>

      <section className="mt-5" aria-labelledby="capability-summary-heading">
        <h2
          id="capability-summary-heading"
          className="text-sm font-semibold uppercase tracking-wide text-slate-500"
        >
          Capability summary
        </h2>
        <div className="mt-3 flex flex-wrap gap-2">
          <ConfidenceBadge level={facility.confidence} />
          <FreshnessBadge status={facility.freshness} />
          <span className="inline-flex min-h-8 items-center rounded border border-slate-200 bg-white px-2.5 py-1 text-xs font-medium text-slate-700">
            Missing public data is not absence of capability
          </span>
        </div>
        {facility.capabilities.length === 0 ? (
          <p className="mt-3 text-base text-slate-600">
            Specialty capabilities: {unavailable}. Missing public data must not
            be treated as absence of capability.
          </p>
        ) : (
          <ul className="mt-3 flex flex-col gap-3">
            {facility.capabilities.map((c) => {
              const definitions = capabilityGlossaryTerms(c.capability)
                .map((term) =>
                  capabilityDefinitions.find((d) => d.term === term),
                )
                .filter(Boolean);
              return (
                <li
                  key={c.capability}
                  className="rounded-lg border border-slate-200 bg-white p-3"
                >
                  <p className="text-base font-medium text-slate-800">
                    {c.label}
                    {c.level ? ` — ${c.level}` : ""}
                  </p>
                  <p className="mt-1 text-sm text-slate-600">
                    Capability status:{" "}
                    {c.isSynthetic
                      ? "Synthetic demonstration value — not a public-data fact"
                      : verifiedYes}
                  </p>
                  <p className="text-sm text-slate-600">
                    Population served: {c.populationServed ?? notVerified}
                  </p>
                  <div className="mt-1 flex flex-wrap gap-1.5">
                    <ConfidenceBadge level={c.confidence} />
                    <FreshnessBadge status={c.freshness} />
                  </div>
                  <p className="mt-2 text-sm text-slate-500">
                    Source: {c.sourceAgency} &middot; Reported{" "}
                    {formatDate(c.sourceDate)} &middot; Retrieved{" "}
                    {formatDate(c.retrievalDate)}
                  </p>
                  {definitions.length > 0 && (
                    <DefinitionDetails
                      summary={`Capability definition: ${definitions[0]?.term}`}
                    >
                      {definitions.map(
                        (definition) =>
                          definition && (
                            <div key={definition.term} className="space-y-1">
                              <p>
                                <strong>{definition.term}:</strong>{" "}
                                {definition.plainLanguageDefinition}
                              </p>
                              <p>
                                <strong>Planning relevance:</strong>{" "}
                                {definition.planningRelevance}
                              </p>
                              <p>
                                <strong>Known limitation:</strong>{" "}
                                {definition.knownLimitation}
                              </p>
                              <p>
                                <strong>Operational caution:</strong>{" "}
                                {definition.operationalCaution}
                              </p>
                            </div>
                          ),
                      )}
                    </DefinitionDetails>
                  )}
                  {c.limitations.length > 0 && (
                    <p className="mt-2 text-sm italic text-slate-500">
                      {c.limitations.join(" ")}
                    </p>
                  )}
                </li>
              );
            })}
          </ul>
        )}
        <DefinitionDetails summary="Hospital capability glossary">
          {capabilityDefinitions.map((definition) => (
            <p key={definition.term}>
              <strong>{definition.term}:</strong>{" "}
              {definition.plainLanguageDefinition}{" "}
              {definition.operationalCaution}
            </p>
          ))}
        </DefinitionDetails>
        <dl className="mt-3 rounded-lg border border-slate-200 bg-white px-4">
          {Object.entries(CAPABILITY_LABELS)
            .slice(0, 8)
            .map(([key, label]) => (
              <DetailRow
                key={key}
                label={label}
                value={
                  facility.capabilities.some((c) => c.capability === key)
                    ? facility.isSynthetic
                      ? syntheticValue
                      : verifiedYes
                    : unavailable
                }
                status={
                  facility.isSynthetic
                    ? "Synthetic demo capability, not public-data evidence"
                    : undefined
                }
              />
            ))}
        </dl>
      </section>

      <section className="mt-5" aria-labelledby="contact-access-heading">
        <h2
          id="contact-access-heading"
          className="text-sm font-semibold uppercase tracking-wide text-slate-500"
        >
          Contact and access information
        </h2>
        <dl className="mt-3 rounded-lg border border-slate-200 bg-white px-4">
          <DetailRow
            label="Phone"
            value={
              phoneDisplay && phoneLink ? (
                <a className="text-terrain-700 underline" href={phoneLink}>
                  {phoneDisplay}
                </a>
              ) : (
                phoneDisplay
              )
            }
            status={phoneDisplay ? "CMS telephone_number" : undefined}
          />
          <DetailRow
            label="Website"
            value={
              websiteLink ? (
                <a
                  className="text-terrain-700 underline"
                  href={websiteLink}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Visit facility website
                </a>
              ) : undefined
            }
            status={websiteLink ? "Source-backed facility website" : undefined}
          />
          <DetailRow
            label="Email"
            value={
              facility.email ? (
                <a
                  className="text-terrain-700 underline"
                  href={`mailto:${facility.email}`}
                >
                  {facility.email}
                </a>
              ) : undefined
            }
          />
          <DetailRow label="Fax" value={facility.fax} />
          <DetailRow
            label="Straight-line planning distance"
            value={`${facility.distanceMiles} mi from selected planning center`}
          />
        </dl>
      </section>

      <section className="mt-5" aria-labelledby="cms-services-heading">
        <h2
          id="cms-services-heading"
          className="text-sm font-semibold uppercase tracking-wide text-slate-500"
        >
          Services reported by CMS
        </h2>
        <dl className="mt-3 rounded-lg border border-slate-200 bg-white px-4">
          <DetailRow
            label="Emergency services"
            value={emergencyValue}
            status="CMS emergency-services designation is not live operational status."
          />
        </dl>
      </section>

      <section className="mt-5" aria-labelledby="source-quality-heading">
        <h2
          id="source-quality-heading"
          className="text-sm font-semibold uppercase tracking-wide text-slate-500"
        >
          Source and data quality
        </h2>
        <p className="mt-3 rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm font-semibold text-amber-900">
          {isCmsRecord
            ? "CMS hospital public-data record."
            : "Synthetic demonstration data — developer/demo fixture only."}
        </p>
        <dl className="mt-3 rounded-lg border border-slate-200 bg-white px-4">
          <DetailRow
            label="Synthetic/real status"
            value={
              isCmsRecord
                ? "Real CMS hospital public-data record."
                : "Synthetic demonstration data — developer/demo fixture only."
            }
          />
          <DetailRow
            label="Source dataset"
            value={
              facility.sourceName ??
              (sourceRecords.map((s) => s?.dataset).join("; ") || undefined)
            }
          />
          <DetailRow
            label="Source dataset ID"
            value={facility.sourceDatasetId}
          />
          <DetailRow
            label="Geocoding validation"
            value={
              isCmsRecord
                ? "Validated CMS map-ready record"
                : facility.confidence
            }
          />
          <DetailRow
            label="Source date"
            value={
              sourceDates.length
                ? sourceDates.map(formatDate).join("; ")
                : undefined
            }
          />
          <DetailRow
            label="Retrieved date"
            value={
              facility.retrievedAt
                ? formatDate(facility.retrievedAt)
                : retrievalDates.length
                  ? retrievalDates.map(formatDate).join("; ")
                  : undefined
            }
          />
          <DetailRow
            label="Validation status"
            value={facility.validationStatus}
          />
          <DetailRow
            label="Geocoding confidence"
            value={facility.geocodingConfidence}
          />
          <DetailRow
            label="Source link"
            value={
              facility.sourceUrl ??
              (sourceLinkCount
                ? `${sourceLinkCount} source link(s) listed below`
                : undefined)
            }
          />
        </dl>
        <ul className="mt-2 flex flex-col gap-2">
          {sourceRecords.map(
            (source) =>
              source && (
                <li
                  key={source.id}
                  className="rounded-lg border border-slate-200 bg-white p-3 text-sm text-slate-600"
                >
                  <p className="font-medium text-slate-800">{source.dataset}</p>
                  <p className="text-slate-500">{source.sourceAgency}</p>
                  <p className="mt-1">
                    Released {formatDate(source.releaseDate)} &middot; Retrieved{" "}
                    {formatDate(source.retrievalDate)} &middot; Refresh:{" "}
                    {source.expectedRefreshCadence}
                  </p>
                  <p className="mt-1">
                    Source link:{" "}
                    {source.sourceUrl ? (
                      <a
                        className="text-terrain-700 underline"
                        href={source.sourceUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        View CMS source
                      </a>
                    ) : (
                      unavailable
                    )}
                  </p>
                </li>
              ),
          )}
        </ul>
      </section>

      <section
        className="mt-5 rounded-lg bg-slate-50 p-4 text-sm text-slate-600"
        aria-labelledby="known-limitations-heading"
      >
        <h2
          id="known-limitations-heading"
          className="mb-1 text-sm font-semibold uppercase tracking-wide text-slate-500"
        >
          Known limitations
        </h2>
        <ul className="list-disc space-y-1 pl-4">
          {(facility.limitations.length
            ? facility.limitations
            : [
                "No facility-specific limitations beyond current source limitations are available.",
              ]
          ).map((l) => (
            <li key={l}>{l}</li>
          ))}
          <li>
            Missing public data must not be treated as absence of capability.
          </li>
          <li>
            CMS emergency-services designation is not live operational status.
          </li>
          <li>
            Not live routing, diversion, transfer, bed-status, medical-control,
            destination, or clinical decision support.
          </li>
        </ul>
      </section>
      {onClose && (
        <button
          type="button"
          onClick={onClose}
          className="mt-5 min-h-11 rounded-md bg-terrain-700 px-4 py-2 text-sm font-semibold text-white hover:bg-terrain-800 focus:outline-none focus:ring-2 focus:ring-terrain-500 focus:ring-offset-2"
        >
          Close details
        </button>
      )}
    </div>
  );
}
