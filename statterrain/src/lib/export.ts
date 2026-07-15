import { product } from "@/config/product";
import { facilityTaxonomy, syntheticDemoFacilityTypes, futureFacilityTypes } from "@/config/facilityTaxonomy";
import { populationMetrics } from "@/data/population-metrics";
import {
  POPULATION_METRIC_EXPORT_CAVEAT,
  populationMetricDefinitions,
} from "@/config/populationMetricDefinitions";
import { getSourceById, sources } from "@/data/sources";
import type { Facility } from "@/types/facility";
import { CAPABILITY_LABELS, FACILITY_TYPE_LABELS } from "@/types/facility";
import { FRESHNESS_LABELS } from "@/types/source";
import { OVERLAY_LABELS } from "@/types/metric";
import { buildCountyComparisonState } from "@/lib/acs/countyComparison";
import { formatDate, todayIso } from "./format";
import type { AppFilters } from "@/hooks/useAppState";
import { PLANNING_CONSIDERATIONS } from "./planning-considerations";
import type { PublicDataArtifactSummary } from "@/lib/public-data/readPublicDataArtifacts";
import type { CoverageStatus } from "@/lib/coverage/coverageStatus";
import { getSourceCoverageSummaries } from "@/lib/coverage/coverageStatus";
import { normalizeCmsPhoneDisplay, normalizeFacilityWebsite } from "@/lib/facilityIdentity";
import type { PlanningLocation } from "@/types/planningLocation";
import { activeResearchLayers } from "@/config/researchLayerRegistry";
import type { AcsCountyRecord } from "@/lib/acs/types";
import { ACS_METRIC_LABELS, ACS_METRIC_ORDER } from "@/lib/acs/types";
import { acsSourceMetadata, boundarySourceMetadata, classifyHospitalRecords, hospitalSourceMetadata } from "@/lib/provenance";

export interface BriefContext {
  locationLabel: string;
  radiusMiles: number;
  filters: AppFilters;
  visibleFacilities: Facility[];
  briefFacilities: Facility[];
  publicDataSummary?: PublicDataArtifactSummary;
  coverageStatus?: CoverageStatus;
  selectedLocationSource?: string;
  planningLocation?: PlanningLocation | null;
  containingCounty?: AcsCountyRecord | null;
  intersectingCounties?: AcsCountyRecord[];
}

function activeFilterSummary(filters: AppFilters) {
  return {
    facilityTypes: Array.from(filters.facilityTypes).map(
      (t) => FACILITY_TYPE_LABELS[t],
    ),
    capabilities: Array.from(filters.capabilities).map(
      (c) => CAPABILITY_LABELS[c],
    ),
    overlay: filters.overlay ? OVERLAY_LABELS[filters.overlay] : "None active",
  };
}

function buildFilename(ext: string): string {
  return `statterrain-demo-regional-brief-${todayIso()}.${ext}`;
}
function buildCountyFilename(ext: string): string {
  return `statterrain-county-acs-${todayIso()}.${ext}`;
}

function download(filename: string, content: string, mimeType: string) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export const BRIEF_SCOPE_STATEMENT =
  "Brief scope: This evidence brief includes all available facility categories within the selected planning radius. Current map display filters are not used to exclude records from this brief.";

export function buildMarkdownBrief(ctx: BriefContext): string {
  const {
    locationLabel,
    radiusMiles,
    filters,
    visibleFacilities,
    briefFacilities,
    publicDataSummary,
  } = ctx;
  const filterSummary = activeFilterSummary(filters);
  const relevantSourceIds = new Set<string>();
  briefFacilities.forEach((f) =>
    f.sourceIds.forEach((id) => relevantSourceIds.add(id)),
  );


  const lines: string[] = [];
  lines.push(`# ${product.name} Regional Emergency Care Evidence Brief`);
  lines.push("");
  lines.push(`**${product.tagline}**`);
  lines.push("");
  lines.push(`- Search location: ${locationLabel}`);
  if (ctx.planningLocation) {
    lines.push(`- Entered query: ${ctx.planningLocation.searchQuery ?? "not reported"}`);
    lines.push(`- Search strategy: ${ctx.planningLocation.searchStrategy ?? "not reported"}`);
    lines.push(`- Resolved geography type: ${ctx.planningLocation.resolvedGeographyType ?? "not reported"}`);
    if (ctx.planningLocation.resolvedGeographyId) lines.push(`- Geography identifier: ${ctx.planningLocation.resolvedGeographyId}`);
    if (ctx.planningLocation.state) lines.push(`- State: ${ctx.planningLocation.state}`);
    if (ctx.planningLocation.zip) lines.push(`- ZIP: ${ctx.planningLocation.zip}`);
    lines.push(`- Coordinates: ${ctx.planningLocation.latitude}, ${ctx.planningLocation.longitude}`);
    if (ctx.planningLocation.source) lines.push(`- Location source: ${ctx.planningLocation.source}`);
    (ctx.planningLocation.limitations ?? []).forEach((limitation) => lines.push(`- Location limitation: ${limitation}`));
  }
  lines.push(
    `- Search location source: ${ctx.selectedLocationSource ?? "StatTerrain demo"}`,
  );
  lines.push(`- Selected planning radius: ${radiusMiles} miles`);
  lines.push(`- Date generated: ${formatDate(todayIso())}`);
  lines.push(`- ${product.prototypeVersion}`);
  lines.push(`- ${BRIEF_SCOPE_STATEMENT}`);
  lines.push("");

  lines.push("## Coverage status");
  lines.push("");
  if (ctx.coverageStatus) {
    lines.push(`- Coverage state: ${ctx.coverageStatus.headline}`);
    lines.push(
      `- Synthetic demo data included in local facility counts: ${ctx.coverageStatus.syntheticSuppressed ? "No — suppressed for searched location outside demo region" : "Yes — synthetic demo region active"}`,
    );
    ctx.coverageStatus.messages.forEach((message) =>
      lines.push(`- ${message}`),
    );
  } else {
    lines.push("- Coverage status was not attached to this brief.");
  }
  lines.push("");

  lines.push("## Coverage manifest summary");
  lines.push("");
  const coverageSources = ctx.coverageStatus?.sourceSummaries ?? getSourceCoverageSummaries();
  const hospitalProvenance = classifyHospitalRecords(ctx.briefFacilities);
  lines.push("- CMS public hospital records are active from generated map-ready partitions.");
  lines.push(`- Selected location: ${locationLabel}`);
  lines.push(`- Selected radius: ${radiusMiles} miles`);
  lines.push(`- Hospital provenance classification: ${hospitalProvenance.classification}; CMS records: ${hospitalProvenance.cmsCount}; synthetic records: ${hospitalProvenance.syntheticCount}.`);
  coverageSources.filter((source) => source.usedInCurrentApp || source.sourceId === "synthetic-demo").forEach((source) => {
    lines.push(`- ${source.label}; map-ready records: ${source.mapReadyRecordCount ?? "not applicable"}; used in current app: ${source.usedInCurrentApp ? "yes" : "no"}`);
  });
  lines.push("");

  lines.push("## Sources");
  lines.push("");
  lines.push(`- Hospitals: ${hospitalSourceMetadata.sourceOrganization}, ${hospitalSourceMetadata.datasetTitle}; dataset identifier ${hospitalSourceMetadata.datasetIdentifier}; dataset release ${hospitalSourceMetadata.releaseLabel ?? "not reported"}; retrieved by StatTerrain ${hospitalSourceMetadata.retrievedAt ?? "not reported"}; source ${hospitalSourceMetadata.officialUrl}.`);
  lines.push(`- County context: ${acsSourceMetadata.sourceOrganization}, ${acsSourceMetadata.datasetTitle}; release ${acsSourceMetadata.releaseLabel ?? "not reported"}; estimate period ${acsSourceMetadata.estimatePeriod ?? "not reported"}; retrieved by StatTerrain ${acsSourceMetadata.retrievedAt ?? "not reported"}; source ${acsSourceMetadata.officialUrl}.`);
  lines.push("");

  lines.push("## CMS public-data provenance");
  lines.push("");
  if (publicDataSummary) {
    lines.push(
      `- Dataset: ${publicDataSummary.sourceName} (${publicDataSummary.datasetId})`,
    );
    lines.push(
      `- Data mode: ${publicDataSummary.dataMode}${publicDataSummary.fixtureMode ? " (fixture; not used in the active CMS hospital map)" : ""}`,
    );
    lines.push(
      `- Validation: ${publicDataSummary.validationStatus}; geocoding: ${publicDataSummary.geocodingStatus}`,
    );
    lines.push(
      `- Retrieved: ${publicDataSummary.retrievedAt ? formatDate(publicDataSummary.retrievedAt) : "Not reported"}`,
    );
  } else {
    lines.push(
      "- No generated public-data artifact summary was attached to this brief.",
    );
  }
  lines.push("");

  lines.push("## Data freshness summary");
  lines.push("");
  lines.push("| Source | Freshness |");
  lines.push("| --- | --- |");
  Array.from(relevantSourceIds).forEach((id) => {
    const s = getSourceById(id);
    if (!s) return;
    lines.push(
      `| ${s.dataset} | ${FRESHNESS_LABELS[s.freshness]} |`,
    );
  });
  lines.push("");

  lines.push("## Source scope");
  lines.push("");
  lines.push(`- Active source-backed categories: ${facilityTaxonomy.filter((e) => e.currentUiVisibility === "active").map((e) => e.label).join("; ")}`);
  lines.push(`- Synthetic categories, if included: ${syntheticDemoFacilityTypes.map((type) => FACILITY_TYPE_LABELS[type]).join("; ") || "None"}`);
  lines.push(`- Unavailable / future-source-needed categories: ${futureFacilityTypes.map((type) => FACILITY_TYPE_LABELS[type]).join("; ") || "None"}`);
  lines.push("- Trauma, stroke, STEMI/PCI, bed availability, diversion status, and other clinical capability fields are not included unless backed by a validated public source mapping.");
  lines.push("");

  lines.push("## Emergency-care facility overview");
  lines.push("");
  const hospitals = briefFacilities.filter(
    (f) =>
      f.facilityType === "hospital" ||
      f.facilityType === "critical_access_hospital",
  );
  lines.push(`Hospitals / EDs in range: ${hospitals.length}`);
  lines.push("");
  lines.push("## Hospital capability source limits");
  lines.push("");
  lines.push("Hospital capability filters and findings are hidden unless source-backed. Synthetic demo records may contain capability-like fields for demonstration only, but they are not exported as public-data facts.");
  lines.push("");
  hospitals.forEach((f) => {
    lines.push(`### ${f.name}`);
    lines.push(`- CMS facility ID: ${f.sourceFacilityId ?? f.sourceIds[0]}`);
    if (f.hospitalType) lines.push(`- Hospital type: ${f.hospitalType}`);
    if (f.ownershipType) lines.push(`- Ownership: ${f.ownershipType}`);
    lines.push(`- Address: ${f.address}`);
    if (f.countyName) lines.push(`- County: ${f.countyName}`);
    const phone = normalizeCmsPhoneDisplay(f.phone);
    if (phone) lines.push(`- Phone: ${phone}`);
    const website = normalizeFacilityWebsite(f.website);
    if (website) lines.push(`- Website: [Visit facility website](${website})`);
    if (f.emergencyServicesIndicator) lines.push(`- Emergency services: ${f.emergencyServicesIndicator === "Yes" || f.emergencyServicesIndicator === "No" ? f.emergencyServicesIndicator : "Not reported in this source"} (CMS designation; not live operational status.)`);
    lines.push(`- Source: ${f.sourceName ?? "CMS Hospital General Information"}${f.retrievedAt ? `; retrieved ${formatDate(f.retrievedAt)}` : ""}`);
    lines.push(`- Straight-line planning distance: ${f.distanceMiles} mi`);
    if (f.criticalAccess) lines.push("- Critical access: Yes, mapped from CMS hospital_type = Critical Access Hospitals.");
    lines.push("- Specialty capabilities: unavailable/not included unless source-mapped; do not infer capability from name, type, or geography.");
    lines.push("");
  });


  lines.push("## Population context");
  lines.push("");
  const countyViz = buildCountyComparisonState({ overlay: filters.overlay, layerEnabled: Boolean(filters.overlay), containingCounty: ctx.containingCounty ?? null, counties: ctx.intersectingCounties ?? [] });
  lines.push("Whole-county ACS totals are shown as county context only. Whole-county ACS totals are not estimates of population located inside the selected radius.");
  lines.push("County-level data do not show variation within a county. County shading, when shown, compares whole-county ACS estimates only.");
  lines.push(`- Visualization mode: ${countyViz.mode}`);
  lines.push(`- Selected metric: ${countyViz.selectedMetricLabel}`);
  lines.push(`- Loaded counties: ${countyViz.loadedCountyCount}; valid comparable counties: ${countyViz.validComparableCount}`);
  if (countyViz.containingCountyRank) lines.push(`- Visible comparison rank: ${countyViz.containingCountyRank} of ${countyViz.validComparableCount}`);
  if (countyViz.visibleMin !== null && countyViz.visibleMax !== null) lines.push(`- Visible range: ${countyViz.visibleMin}–${countyViz.visibleMax}`);
  if (countyViz.missingCountyGeoids.length) lines.push(`- Missing county GEOIDs: ${countyViz.missingCountyGeoids.join(", ")}`);
  (ctx.intersectingCounties ?? []).forEach((county) => {
    lines.push(`- ${county.fullName} (${county.geoid})`);
    ACS_METRIC_ORDER.forEach((metricId) => { const metric = county.metrics[metricId]; lines.push(`  - ${ACS_METRIC_LABELS[metricId]}: ${metric?.estimate ?? "unavailable"}; MOE: ${metric?.marginOfError ?? "unavailable"}; status: ${metric?.status ?? "unavailable"}`); });
  });
  lines.push("");

  lines.push("## Accessibility, redundancy, and resilience");
  lines.push("");
  lines.push("Accessibility, redundancy, and resilience sections are unavailable until source-backed datasets are activated. No routing, road-time, live status, or clinical conclusions are included.");
  lines.push("");

  lines.push("## Planning considerations");
  lines.push("");
  PLANNING_CONSIDERATIONS.forEach((p) => {
    lines.push(`- **${p.label}:** ${p.text}`);
  });
  lines.push("");

  lines.push("## Questions to verify locally");
  lines.push("");
  lines.push(
    "- Are the listed hospital capability designations still active and unsuspended?",
  );
  lines.push(
    "- What is the current behavioral-health receiving status for facilities in this area?",
  );
  lines.push(
    "- Has EMS protocol review incorporated the latest chronic-disease burden estimates?",
  );
  lines.push("");

  lines.push("## Source appendix");
  lines.push("");
  Array.from(relevantSourceIds).forEach((id) => {
    const s = getSourceById(id);
    if (!s) return;
    lines.push(`### ${s.dataset}`);
    lines.push(`- Agency: ${s.sourceAgency}`);
    lines.push(`- Release date: ${formatDate(s.releaseDate)}`);
    lines.push(`- Retrieval date: ${formatDate(s.retrievalDate)}`);
    lines.push(`- Geography level: ${s.geographyLevel}`);
    lines.push(`- Method: ${s.dataMethod}`);
    lines.push(`- Expected refresh cadence: ${s.expectedRefreshCadence}`);
    lines.push(`- Freshness: ${FRESHNESS_LABELS[s.freshness]}`);
    lines.push(`- Limitations: ${s.limitations.join("; ")}`);
    lines.push(`- Official source URL: ${s.sourceUrl}`);
    lines.push(`- Synthetic demonstration record: Yes`);
    lines.push("");
  });

  lines.push("## Active filters at time of export");
  lines.push("");
  lines.push(
    `- Facility types: ${filterSummary.facilityTypes.join(", ") || "None selected"}`,
  );
  lines.push(
    `- Capability filters: ${filterSummary.capabilities.join(", ") || "None"}`,
  );
  lines.push(`- Population overlay: ${filterSummary.overlay}`);
  lines.push("");

  lines.push("## Limitations");
  lines.push("");
  lines.push(
    "This brief is generated from the active CMS hospital public-data map experience. Facility capability, freshness, and population context must be verified with official sources and must not be used for operational, clinical, routing, or transfer decisions.",
  );
  lines.push("");

  lines.push("## Required disclaimer");
  lines.push("");
  lines.push(`> ${product.disclaimer}`);
  lines.push("");

  return lines.join("\n");
}

export function buildEvidenceSchema(ctx: BriefContext) {
  const relevantSourceIds = new Set<string>();
  ctx.briefFacilities.forEach((f) => f.sourceIds.forEach((id) => relevantSourceIds.add(id)));
  const sourcesForBrief = Array.from(relevantSourceIds).map((id) => getSourceById(id)).filter(Boolean);
  const hospitalProvenance = classifyHospitalRecords(ctx.briefFacilities);
  const planningLocation = ctx.planningLocation ?? null;
  return {
    schemaVersion: "statterrain-evidence-v2",
    generatedAt: new Date().toISOString(),
    productVersion: product.prototypeVersion,
    researchArea: {
      planningLocation,
      radiusMiles: ctx.radiusMiles,
      radiusUnits: "miles",
      distanceMethod: "great-circle-haversine",
    },
    activeLayers: activeResearchLayers,
    summary: {
      facilityCount: ctx.briefFacilities.length,
      displayedFacilityCount: ctx.visibleFacilities.length,
      noHospitalsWithinRadius: ctx.briefFacilities.length === 0,
      coverageHeadline: ctx.coverageStatus?.headline ?? null,
      coverageManifestSummary: {
        selectedLocation: ctx.locationLabel,
        selectedRadiusMiles: ctx.radiusMiles,
        mapReadySources: (ctx.coverageStatus?.sourceSummaries ?? getSourceCoverageSummaries()).filter((source) => (source.mapReadyRecordCount ?? 0) > 0),
        notYetMapReadySources: (ctx.coverageStatus?.sourceSummaries ?? getSourceCoverageSummaries()).filter((source) => (source.mapReadyRecordCount ?? 0) === 0),
      },
    },
    facilities: ctx.briefFacilities.map((f) => ({
      cmsFacilityId: f.sourceFacilityId ?? null,
      facilityName: f.name,
      address: f.address,
      city: f.city ?? null,
      state: f.state ?? null,
      zip: f.zip ?? null,
      county: f.countyName ?? null,
      coordinates: { latitude: f.lat, longitude: f.lng },
      distanceFromPlanningLocationMiles: f.distanceMiles,
      hospitalType: f.hospitalType ?? null,
      ownership: f.ownershipType ?? null,
      emergencyServices: f.emergencyServicesIndicator ?? null,
      criticalAccess: f.criticalAccessIndicator ?? (f.criticalAccess ? "Yes" : null),
      phone: f.phone ?? null,
      source: f.sourceName ?? "CMS Hospital General Information",
      sourceDatasetId: f.sourceDatasetId ?? null,
      sourceRelease: hospitalSourceMetadata.releaseLabel,
      sourceRetrievedAt: f.retrievedAt ?? hospitalSourceMetadata.retrievedAt ?? null,
      sourceUrl: f.sourceUrl ?? null,
      fieldProvenance: "CMS Hospital General Information map-ready public-data artifact",
      missingFieldStatus: {
        county: f.countyName ? "present" : "missing-or-unavailable",
        emergencyServices: f.emergencyServicesIndicator ? "present" : "missing-or-unavailable",
        criticalAccess: f.criticalAccessIndicator || f.criticalAccess ? "present" : "missing-or-unavailable",
        phone: f.phone ? "present" : "missing-or-unavailable",
        website: "unavailable-in-current-CMS-source-mapping",
      },
    })),
    population: {
      containingCounty: ctx.containingCounty ?? null,
      intersectingCounties: ctx.intersectingCounties ?? [],
      metrics: ACS_METRIC_ORDER,
      visualization: buildCountyComparisonState({ overlay: ctx.filters.overlay, layerEnabled: Boolean(ctx.filters.overlay), containingCounty: ctx.containingCounty ?? null, counties: ctx.intersectingCounties ?? [] }),
      limitation: "Whole-county ACS totals are not estimates of population located inside the selected radius. County-level data do not show variation within a county.",
      geometrySource: "National county boundary partitions from generated static artifacts",
      representativePointLimitation: "Point-in-county and radius intersection may use representative or simplified geometry until validated national boundaries are available.",
    },
    accessibility: null,
    resilience: null,
    unavailableSections: ["accessibility", "redundancyAndResilience"],
    sources: {
      facilities: sourcesForBrief,
      humanReadable: [
        { role: "hospitals", ...hospitalSourceMetadata },
        { role: "countyContext", ...acsSourceMetadata },
        { role: "boundaries", ...boundarySourceMetadata },
      ],
    },
    methods: [
      "Planning location is set through one canonical PlanningLocation state from search or map click.",
      "Candidate CMS partitions are selected by radius-intersecting state/territory bounds; final inclusion uses great-circle Haversine distance in miles.",
      "Unsupported capabilities and inactive layers are hidden rather than represented as absent.",
    ],
    limitations: [
      "CMS hospital data are not live operating status, bed availability, diversion status, routing, transfer guidance, or clinical decision support.",
      "Missing fields indicate unavailable or unmapped source data, not absence of a service.",
      "Whole-county ACS totals are not estimates of population located inside the selected radius.",
      "County boundary activation requires PASS validation, national coverage, and at least 52 partitions.",
    ],
    freshness: sourcesForBrief.map((source: any) => ({ sourceId: source.id, dataset: source.dataset, releaseDate: source.releaseDate, retrievalDate: source.retrievalDate, freshness: source.freshness })),
    exportMetadata: {
      hospitalSourceType: hospitalProvenance.classification,
      hospitalDatasetTitle: hospitalSourceMetadata.datasetTitle,
      hospitalDatasetRelease: hospitalSourceMetadata.releaseLabel,
      hospitalRetrievedAt: hospitalSourceMetadata.retrievedAt,
      hospitalOfficialUrl: hospitalSourceMetadata.officialUrl,
      acsDatasetTitle: acsSourceMetadata.datasetTitle,
      acsRelease: acsSourceMetadata.releaseLabel,
      acsEstimatePeriod: acsSourceMetadata.estimatePeriod,
      acsRetrievedAt: acsSourceMetadata.retrievedAt,
      acsOfficialUrl: acsSourceMetadata.officialUrl,
      boundarySource: boundarySourceMetadata.datasetTitle,
      boundaryVintage: boundarySourceMetadata.releaseLabel,
      coverageStatus: ctx.coverageStatus?.headline ?? null,
      provenanceClassification: hospitalProvenance.classification,
      cmsRecordCount: hospitalProvenance.cmsCount,
      syntheticRecordCount: hospitalProvenance.syntheticCount,
    },
    completeness: {
      activeFacilitySource: "CMS hospitals",
      missingDoesNotMeanAbsent: true,
      inactiveSectionsRepresentedAsUnavailable: true,
    },
    exportManifest: {
      includesRawFacilityRecords: true,
      includesPopulationRecords: true,
      includesAiApiCalls: false,
      prohibitedUsesExcluded: true,
    },
  };
}

export function buildJsonBrief(ctx: BriefContext) {
  return buildEvidenceSchema(ctx);
}

function csvEscape(value: string | number): string {
  const str = String(value);
  if (str.includes(",") || str.includes('"') || str.includes("\n")) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

export function buildCsvBrief(ctx: BriefContext): string {
  const { briefFacilities } = ctx;
  const header = [
    "id",
    "name",
    "facility_type",
    "address",
    "distance_miles",
    "critical_access",
    "capabilities",
    "freshness",
    "synthetic",
  ];
  const rows = briefFacilities.map((f) =>
    [
      f.id,
      f.name,
      FACILITY_TYPE_LABELS[f.facilityType],
      f.address,
      f.distanceMiles,
      f.criticalAccess ? "yes" : "no",
      f.capabilities.map((c) => c.label).join("; "),
      FRESHNESS_LABELS[f.freshness],
      "yes",
    ]
      .map(csvEscape)
      .join(","),
  );
  const notes = [
    "",
    `# Search location: ${ctx.locationLabel}`,
    `# Selected planning radius: ${ctx.radiusMiles} miles`,
    `# ${BRIEF_SCOPE_STATEMENT}`,
    `# ${product.disclaimer}`,
    `# hospitalSourceType: ${classifyHospitalRecords(ctx.briefFacilities).classification}`,
    `# hospitalDatasetTitle: ${hospitalSourceMetadata.datasetTitle}`,
    `# hospitalDatasetRelease: ${hospitalSourceMetadata.releaseLabel ?? "not reported"}`,
    `# hospitalRetrievedAt: ${hospitalSourceMetadata.retrievedAt ?? "not reported"}`,
    `# hospitalOfficialUrl: ${hospitalSourceMetadata.officialUrl}`,
    `# acsDatasetTitle: ${acsSourceMetadata.datasetTitle}`,
    `# acsRelease: ${acsSourceMetadata.releaseLabel ?? "not reported"}`,
    `# acsEstimatePeriod: ${acsSourceMetadata.estimatePeriod ?? "not reported"}`,
    `# acsRetrievedAt: ${acsSourceMetadata.retrievedAt ?? "not reported"}`,
    `# acsOfficialUrl: ${acsSourceMetadata.officialUrl}`,
    `# coverageStatus: ${ctx.coverageStatus?.headline ?? "not reported"}`,
    `# Plain-language metric notes are included in Markdown and JSON exports. ${POPULATION_METRIC_EXPORT_CAVEAT}`,
  ];
  return [header.join(","), ...rows, ...notes].join("\n");
}

export function downloadMarkdownBrief(ctx: BriefContext) {
  download(buildFilename("md"), buildMarkdownBrief(ctx), "text/markdown");
}

export function downloadJsonBrief(ctx: BriefContext) {
  download(
    buildFilename("json"),
    JSON.stringify(buildJsonBrief(ctx), null, 2),
    "application/json",
  );
}

export function downloadCsvBrief(ctx: BriefContext) {
  download(buildFilename("csv"), buildCsvBrief(ctx), "text/csv");
}
export function downloadCountyAcsJson(ctx: BriefContext) {
  const visualization = buildCountyComparisonState({ overlay: ctx.filters.overlay, layerEnabled: Boolean(ctx.filters.overlay), containingCounty: ctx.containingCounty ?? null, counties: ctx.intersectingCounties ?? [] });
  download(buildCountyFilename("json"), JSON.stringify({ containingCounty: ctx.containingCounty ?? null, intersectingCounties: ctx.intersectingCounties ?? [], visualization, limitation: "The selected radius intersects whole counties. County ACS estimates are included for geographic context and are not estimates of the population located inside the selected radius. County-level data do not show variation within a county." }, null, 2), "application/json");
}
export function downloadCountyAcsCsv(ctx: BriefContext) {
  download(buildCountyFilename("csv"), buildCountyAcsCsv(ctx), "text/csv");
}

export { sources };

export function buildCountyAcsCsv(ctx: BriefContext): string {
  const visualization = buildCountyComparisonState({ overlay: ctx.filters.overlay, layerEnabled: Boolean(ctx.filters.overlay), containingCounty: ctx.containingCounty ?? null, counties: ctx.intersectingCounties ?? [] });
  const displayByGeoid = new Map(visualization.counties.map((county) => [county.geoid, county]));
  const header = ["geoid","county_name","state","role","metric_id","metric_label","estimate","moe","numerator","numerator_moe","denominator","denominator_moe","percentage","status","universe","variables","calculation_method","release","estimate_period","visualizationRole","visibleComparisonRank","visibleComparisonCount","selectedMetric","displayClass","displayStatus"];
  const rows = (ctx.intersectingCounties ?? []).flatMap((county) =>
    ACS_METRIC_ORDER.map((metricId) => {
      const m = county.metrics[metricId];
      const role = county.geoid === ctx.containingCounty?.geoid ? "containing" : "intersecting";
      const display = displayByGeoid.get(county.geoid);
      return [county.geoid, county.fullName, county.stateCode, role, metricId, ACS_METRIC_LABELS[metricId], m?.estimate ?? "", m?.marginOfError ?? "", m?.numerator ?? "", m?.numeratorMarginOfError ?? "", m?.denominator ?? "", m?.denominatorMarginOfError ?? "", m?.percentage ?? "", m?.status ?? "unavailable", m?.universe ?? "", (m?.sourceVariables ?? []).join(";"), m?.calculationMethod ?? "", county.acsRelease, county.estimatePeriod, display?.role ?? role, display?.rank ?? "", visualization.validComparableCount, visualization.selectedMetric ?? "", display?.displayClass ?? "", display?.displayStatus ?? ""].map(csvEscape).join(",");
    })
  );
  return [header.join(","), ...rows].join("\n");
}
