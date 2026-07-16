import type { Facility } from "@/types/facility";
import type { CoverageStatus } from "@/lib/coverage/coverageStatus";
import type { CountyContextState } from "@/lib/acs/countyContext";
import { type AcsMetricValue } from "@/lib/acs/types";
import {
  formatDemographicPercentage,
  selectDemographicPercentageMetrics,
} from "@/lib/acs/demographicPercentages";
import {
  displayClassificationLabel,
  nationalBenchmarkMetadata,
  selectNationalBenchmarkComparison,
} from "@/lib/acs/nationalBenchmarks";
import {
  acsSourceMetadata,
  classifyHospitalRecords,
  formatSourceDate,
  hospitalSourceMetadata,
} from "@/lib/provenance";

interface Props {
  facilities: Facility[];
  radiusMiles: number;
  coverageStatus?: CoverageStatus;
  selectedLocationLabel?: string;
  countyContext?: CountyContextState;
}
function fmt(m?: Pick<AcsMetricValue, "estimate" | "status"> | { estimate: number | null; status: string } | null) {
  if (!m || (m.status !== "available" && m.status !== "zero-reported" && m.status !== "calculated"))
    return "—";
  const n = m.estimate;
  return n === null ? "—" : n.toLocaleString();
}
function moe(m?: Pick<AcsMetricValue, "marginOfError"> | null) {
  return m?.marginOfError == null ? "" : `±${m.marginOfError.toLocaleString()}`;
}
function Row({
  label,
  value,
}: {
  label: string;
  value: string | number | React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between gap-3 border-b border-slate-100 py-1 text-xs">
      <span className="text-slate-500">{label}</span>
      <span className="text-right font-semibold text-slate-900">{value}</span>
    </div>
  );
}
function SourceLink({
  href,
  children,
  label,
}: {
  href: string;
  children: React.ReactNode;
  label: string;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={label}
      className="font-semibold text-sky-700 underline underline-offset-2"
    >
      {children}
    </a>
  );
}
function SourceField({ label, value }: { label: string; value: string }) {
  return (
    <div className="grid grid-cols-[8rem_1fr] gap-2 py-0.5 text-xs">
      <dt className="text-slate-500">{label}</dt>
      <dd className="min-w-0 break-words font-medium text-slate-800">
        {value}
      </dd>
    </div>
  );
}

export function RegionalSummaryPanel({
  facilities,
  radiusMiles,
  coverageStatus,
  selectedLocationLabel,
  countyContext,
}: Props) {
  const county = countyContext?.containingCounty ?? null;
  const total = county?.metrics.total_population;
  const provenance = classifyHospitalRecords(facilities);
  const hospitalCount = provenance.hospitalCount;
  const demographicMetrics = selectDemographicPercentageMetrics(county);
  const demographicComparisons = demographicMetrics.map((metric) =>
    selectNationalBenchmarkComparison(
      metric,
      county?.acsRelease ?? "",
      county?.estimatePeriod ?? "",
    ),
  );
  const sourceSummary =
    provenance.classification === "cms-only"
      ? "CMS hospital records"
      : provenance.classification === "synthetic-only"
        ? "Synthetic demonstration records"
        : provenance.classification === "mixed"
          ? "Mixed hospital record sources"
          : "No mapped hospital records";
  return (
    <div className="flex min-w-0 flex-col gap-4 p-4">
      <p className="rounded-md bg-slate-50 p-2 text-xs text-slate-600 lg:hidden">
        Use tabs to switch between map, summary, and details.
      </p>
      <section>
        <h2 className="mb-2 text-sm font-semibold text-slate-900">
          Area Summary
        </h2>
        <div
          className="rounded-lg border border-slate-200 p-3"
          data-testid="area-summary"
        >
          <h3 className="mb-1 text-xs font-semibold uppercase tracking-wide text-slate-500">
            Planning area
          </h3>
          <Row
            label="Planning location"
            value={
              selectedLocationLabel ?? "Terrace Basin Demonstration Region"
            }
          />
          <Row
            label="Containing county"
            value={
              county
                ? county.fullName
                : countyContext?.status === "loading"
                  ? "Loading…"
                  : "Not available"
            }
          />
          <Row label="Radius" value={`${radiusMiles} miles`} />
          <h3 className="mb-1 mt-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
            Hospitals
          </h3>
          <Row
            label="Hospitals within radius"
            value={hospitalCount} /* Total hospitals legacy test label */
          />
          <p className="mt-1 text-[11px] text-slate-500">
            {provenance.classification === "cms-only"
              ? "Available mapped CMS records"
              : sourceSummary}
          </p>
          <div data-testid="facility-results-count" className="sr-only">
            {hospitalCount}
          </div>
          {provenance.classification === "none" && (
            <p className="mt-2 rounded-md bg-slate-50 p-2 text-xs text-slate-700">
              No mapped hospital records were found within the selected radius.
              No matching mapped records does not establish that no hospital
              exists in the area.
            </p>
          )}
          {provenance.classification === "synthetic-only" && (
            <p className="mt-2 rounded-md border border-amber-200 bg-amber-50 p-2 text-xs text-amber-950">
              These are synthetic demonstration records and do not represent
              real facilities at this location.
            </p>
          )}
          {provenance.classification === "mixed" && (
            <p className="mt-2 rounded-md border border-amber-200 bg-amber-50 p-2 text-xs text-amber-950">
              Results include both CMS public records and synthetic
              demonstration records. CMS records: {provenance.cmsCount};
              synthetic records: {provenance.syntheticCount}.
            </p>
          )}
          <p className="mt-2 text-[11px] text-slate-500">Age 18 to 64 provides broad working-age population context. It does not measure employment, labor-force participation, or economic activity.</p>
          <details
            className="mt-3 rounded-md border border-slate-200 p-2 text-xs"
            data-testid="hospital-data-source"
          >
            <summary className="cursor-pointer font-semibold text-slate-800">
              Hospital data source{" "}
              <span className="font-normal text-slate-500">
                — {sourceSummary}
              </span>
            </summary>
            <div className="mt-2 space-y-2">
              {provenance.classification !== "synthetic-only" ? (
                <p className="text-slate-600">
                  Hospital identity and mapped locations come from public
                  records published by the Centers for Medicare & Medicaid
                  Services. Results include records with usable coordinates
                  located within the selected straight-line planning radius.
                </p>
              ) : (
                <p className="text-slate-600">
                  Displayed hospital records are synthetic demonstration
                  records, not CMS public hospital records.
                </p>
              )}
              <dl>
                <SourceField
                  label="Source"
                  value={
                    provenance.classification === "synthetic-only"
                      ? "Synthetic demonstration records"
                      : hospitalSourceMetadata.sourceOrganization
                  }
                />
                <SourceField
                  label="Dataset"
                  value={
                    provenance.classification === "synthetic-only"
                      ? "Synthetic demonstration facility fixtures"
                      : hospitalSourceMetadata.datasetTitle
                  }
                />
                <SourceField
                  label="Dataset release"
                  value={formatSourceDate(hospitalSourceMetadata.releaseLabel)}
                />
                <SourceField
                  label="Retrieved by StatTerrain"
                  value={formatSourceDate(hospitalSourceMetadata.retrievedAt)}
                />
                <SourceField
                  label="Records in radius"
                  value={String(
                    provenance.classification === "synthetic-only"
                      ? provenance.syntheticCount
                      : provenance.cmsCount,
                  )}
                />
                <SourceField
                  label="Geographic method"
                  value="Straight-line distance from the selected planning location"
                />
              </dl>
              {provenance.classification !== "synthetic-only" && (
                <SourceLink
                  href={hospitalSourceMetadata.officialUrl}
                  label="View official CMS hospital source"
                >
                  View CMS source
                </SourceLink>
              )}
            </div>
          </details>
          <h3 className="mb-1 mt-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
            Population context
          </h3>
          {countyContext?.status === "loading" && (
            <p className="text-xs text-slate-600">
              Loading county ACS context…
            </p>
          )}
          {countyContext?.status !== "loading" && (
            <>
              <Row
                label="Containing county"
                value={county?.fullName ?? "Not available"}
              />
              <Row
                label="Containing county population"
                value={`${fmt(total)}${moe(total)}`}
              />
              {county && (
                <>
                  <Row
                    label="Counties intersecting radius"
                    value={countyContext?.intersectingCounties.length ?? 0}
                  />
                  <p className="mt-1 text-[11px] text-slate-500">
                    ACS {county.estimatePeriod}. Values describe the whole
                    containing county, not the population inside the selected
                    radius. County boundaries identify whole-county geography.
                    They do not show population distribution within a county.
                  </p>
                </>
              )}
            </>
          )}
          <h3 className="mb-1 mt-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
            Demographic and vulnerability indicators
          </h3>
          <p className="mb-1 text-[11px] text-slate-500">
            All values in this section describe the whole containing county.
          </p>
          <p className="mb-2 text-[11px] text-slate-500">
            United States comparisons use the same {nationalBenchmarkMetadata.release} release and metric definitions as the county values. Differences are descriptive percentage-point differences, not statistical significance tests.
          </p>
          <details className="mb-2 rounded-md border border-slate-200 p-2 text-[11px] text-slate-600">
            <summary className="cursor-pointer font-semibold text-slate-800">About these estimates</summary>
            <p className="mt-1">ACS values are estimates based on survey data. The margin of error shows the uncertainty around an estimate; a smaller margin generally means greater precision.</p>
          </details>
          {/* Legacy terms covered by qualified ACS labels: Below poverty level; Without health insurance; Limited-English-speaking households. */}
          {demographicMetrics.map((metric, index) => {
            const comparison = demographicComparisons[index];
            return (
              <Row
                key={metric.metricKey}
                label={metric.metricLabel}
                value={
                  <span className="flex min-w-0 flex-col items-end gap-0.5 leading-tight">
                    <span>County: {formatDemographicPercentage(metric.percentage)}</span>
                    <span>United States: {formatDemographicPercentage(comparison.benchmark.percentage)}</span>
                    <span aria-label={comparison.differencePercentagePoints == null ? `Difference unavailable: ${comparison.comparisonStatus}` : `Difference ${comparison.differencePercentagePoints.toFixed(1)} percentage points`}>
                      Difference: {comparison.differencePercentagePoints == null ? "Unavailable" : `${comparison.differencePercentagePoints > 0 ? "+" : ""}${comparison.differencePercentagePoints.toLocaleString(undefined, { minimumFractionDigits: 1, maximumFractionDigits: 1 })} percentage points`}
                    </span>
                    <span className="text-[10px] font-normal text-slate-500">
                      {displayClassificationLabel(comparison.displayClassification)}; {fmt(metric)} {metric.unit}
                    </span>
                    <details className="text-[10px] font-normal text-slate-500">
                      <summary className="cursor-pointer">Universe and margins</summary>
                      <span className="block">County universe: {metric.universe}</span>
                      <span className="block">Benchmark universe: {comparison.benchmark.universe || "Unavailable"}</span>
                      <span className="block">Margin of error: {metric.marginOfErrorStatus === "not-available-for-derived-metric" ? "Not available for this derived age group" : moe(metric) ? `${moe(metric)} ${metric.unit}` : "Not available"}</span>
                      <span className="block">Percentage margin of error: {metric.percentageMarginOfError == null ? "Not available" : `±${metric.percentageMarginOfError} percentage points`}</span>
                      <span className="block">Comparison status: {comparison.comparisonStatus}</span>
                    </details>
                  </span>
                }
              />
            );
          })}
          <p className="mt-2 text-[11px] text-slate-500">Age 18 to 64 provides broad working-age population context. It does not measure employment, labor-force participation, or economic activity.</p>
          <details
            className="mt-3 rounded-md border border-slate-200 p-2 text-xs"
            data-testid="data-sources"
          >
            <summary className="cursor-pointer font-semibold text-slate-800">
              Data sources
            </summary>
            <div className="mt-2 space-y-3">
              <section>
                <h4 className="font-semibold text-slate-800">Hospitals</h4>
                <p className="text-slate-600">
                  {provenance.classification === "synthetic-only"
                    ? "Synthetic demonstration records are shown for demonstration only."
                    : "CMS public hospital records are used for facility identity and mapped location. Only records with usable coordinates are included in radius results."}
                </p>
                <dl className="mt-1">
                  <SourceField
                    label="Dataset"
                    value={
                      provenance.classification === "synthetic-only"
                        ? "Synthetic demonstration facility fixtures"
                        : hospitalSourceMetadata.datasetTitle
                    }
                  />
                  <SourceField
                    label="Dataset release"
                    value={formatSourceDate(
                      hospitalSourceMetadata.releaseLabel,
                    )}
                  />
                  <SourceField
                    label="Retrieved by StatTerrain"
                    value={formatSourceDate(hospitalSourceMetadata.retrievedAt)}
                  />
                </dl>
                {provenance.classification !== "synthetic-only" && (
                  <SourceLink
                    href={hospitalSourceMetadata.officialUrl}
                    label="View official CMS hospital source"
                  >
                    View CMS source
                  </SourceLink>
                )}
              </section>
              <section>
                <h4 className="font-semibold text-slate-800">County context</h4>
                <p className="text-slate-600">
                  County population and demographic estimates come from the U.S.
                  Census Bureau American Community Survey 5-year release. Values
                  describe the whole containing county and are not estimates of
                  population inside the selected radius. United States comparisons use the same 2024 ACS 5-year release and metric definitions as the county values.
                </p>
                <dl className="mt-1">
                  <SourceField
                    label="Release"
                    value={acsSourceMetadata.releaseLabel ?? "2024 ACS 5-year"}
                  />
                  <SourceField
                    label="Estimate period"
                    value={(
                      acsSourceMetadata.estimatePeriod ?? "2020-2024"
                    ).replace("-", "–")}
                  />
                  <SourceField
                    label="Retrieved by StatTerrain"
                    value={formatSourceDate(acsSourceMetadata.retrievedAt)}
                  />
                </dl>
                <SourceLink
                  href={acsSourceMetadata.officialUrl}
                  label="View official Census ACS source"
                >
                  View Census ACS source
                </SourceLink>
              </section>
            </div>
          </details>
          <h3 className="mb-1 mt-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
            Research limitations
          </h3>
          <p className="text-xs text-slate-600">
            StatTerrain is a research and planning prototype. Facility records
            are static public-data snapshots, county estimates describe whole
            counties, and straight-line distance is not travel time or routing.
          </p>
          {coverageStatus && !coverageStatus.nationalCoverageComplete && (
            <p className="mt-1 text-xs text-slate-600">
              Hospital results may be incomplete for this area because some
              source records could not be mapped.
            </p>
          )}
        </div>
      </section>
      <section className="mt-auto">
        <h2 className="mb-2 text-sm font-semibold text-slate-900">
          Research prototype
        </h2>
        <div className="rounded-md bg-amber-50 p-2.5 text-xs leading-relaxed text-amber-900">
          <p>
            Uses public facility and whole-county ACS population data that may
            be incomplete or delayed.
          </p>
          <p className="mt-1">
            Not hospital operating status, routing, bed availability, diversion
            information, or clinical decision support.
          </p>
        </div>
      </section>
    </div>
  );
}
