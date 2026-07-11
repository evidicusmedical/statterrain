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
import { formatDate, todayIso } from "./format";
import type { AppFilters } from "@/hooks/useAppState";
import { PLANNING_CONSIDERATIONS } from "./planning-considerations";
import type { PublicDataArtifactSummary } from "@/lib/public-data/readPublicDataArtifacts";
import type { CoverageStatus } from "@/lib/coverage/coverageStatus";
import { getSourceCoverageSummaries } from "@/lib/coverage/coverageStatus";
import { normalizeCmsPhoneDisplay, normalizeFacilityWebsite } from "@/lib/facilityIdentity";

export interface BriefContext {
  locationLabel: string;
  radiusMiles: number;
  filters: AppFilters;
  visibleFacilities: Facility[];
  briefFacilities: Facility[];
  publicDataSummary?: PublicDataArtifactSummary;
  coverageStatus?: CoverageStatus;
  selectedLocationSource?: string;
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
  populationMetrics.forEach((m) => relevantSourceIds.add(m.sourceId));

  const lines: string[] = [];
  lines.push(`# ${product.name} Regional Emergency Care Evidence Brief`);
  lines.push("");
  lines.push(`**${product.tagline}**`);
  lines.push("");
  lines.push(`- Search location: ${locationLabel}`);
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
  lines.push("- National CMS hospital coverage is active from generated map-ready partitions.");
  lines.push(`- Selected location: ${locationLabel}`);
  lines.push(`- Selected radius: ${radiusMiles} miles`);
  coverageSources.forEach((source) => {
    lines.push(`- ${source.label}; map-ready records: ${source.mapReadyRecordCount ?? "not applicable"}; used in current app: ${source.usedInCurrentApp ? "yes" : "no"}`);
  });
  lines.push("- CMS dialysis is fixture-only/not map-ready and is not included as real records.");
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

  lines.push("## Unavailable facility categories");
  lines.push("");
  (["pharmacy", "dialysis", "nursing_home", "behavioral_health"] as const).forEach((type) => {
    const syntheticCount = briefFacilities.filter((f) => f.facilityType === type && f.isSynthetic).length;
    lines.push(`- ${FACILITY_TYPE_LABELS[type]}: unavailable as source-backed coverage in v0.3.1${syntheticCount ? `; ${syntheticCount} synthetic demo record(s) may be present if demo filters were enabled` : ""}.`);
  });
  lines.push("");

  lines.push("## Population demographics");
  lines.push("");
  lines.push("| Metric | Local | State | National |");
  lines.push("| --- | --- | --- | --- |");
  populationMetrics.forEach((m) => {
    lines.push(
      `| ${m.label} | ${m.value.local}${m.unit.includes("%") ? "%" : ""} | ${m.value.state}${m.unit.includes("%") ? "%" : ""} | ${m.value.national}${m.unit.includes("%") ? "%" : ""} |`,
    );
  });
  lines.push("");

  lines.push("## How to read these metrics");
  lines.push("");
  lines.push(POPULATION_METRIC_EXPORT_CAVEAT);
  lines.push("");
  populationMetrics.forEach((m) => {
    const definition = populationMetricDefinitions[m.metricId];
    lines.push(
      `- **${definition.label}:** What it is: ${definition.simpleWhatItIs} Higher means: ${definition.higherMeans} Lower means: ${definition.lowerMeans} Do not assume: ${definition.doNotAssume}`,
    );
  });
  lines.push("");

  lines.push("## Disease burden and vulnerability / access considerations");
  lines.push("");
  lines.push(
    "See the Population demographics table above for disease-burden, vulnerability, and access-related metrics (COPD, coronary heart disease, stroke prevalence, poor mental health, social vulnerability, no-vehicle access, limited English proficiency, and rurality).",
  );
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
    "- Are pharmacy and dialysis hours and capacity current for this population?",
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
    lines.push(`- Source URL (example/placeholder): ${s.sourceUrl}`);
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

export function buildJsonBrief(ctx: BriefContext) {
  const {
    locationLabel,
    radiusMiles,
    filters,
    visibleFacilities,
    briefFacilities,
  } = ctx;
  const relevantSourceIds = new Set<string>();
  briefFacilities.forEach((f) =>
    f.sourceIds.forEach((id) => relevantSourceIds.add(id)),
  );
  populationMetrics.forEach((m) => relevantSourceIds.add(m.sourceId));

  return {
    product: {
      name: product.name,
      tagline: product.tagline,
      status: product.status,
      version: product.prototypeVersion,
    },
    generatedAt: new Date().toISOString(),
    searchLocation: locationLabel,
    radiusMiles,
    activeDisplayFilters: activeFilterSummary(filters),
    briefScope: BRIEF_SCOPE_STATEMENT,
    displayedFacilities: visibleFacilities,
    facilities: briefFacilities,
    populationMetrics,
    populationMetricDefinitions,
    cmsPublicDataProvenance: ctx.publicDataSummary ?? null,
    coverageManifestSummary: {
      selectedLocation: locationLabel,
      selectedRadiusMiles: radiusMiles,
      nationalCoverageComplete: false,
      mapReadySources: (ctx.coverageStatus?.sourceSummaries ?? getSourceCoverageSummaries()).filter((source) => (source.mapReadyRecordCount ?? 0) > 0),
      notYetMapReadySources: (ctx.coverageStatus?.sourceSummaries ?? getSourceCoverageSummaries()).filter((source) => (source.mapReadyRecordCount ?? 0) === 0),
      notes: [
        "National CMS hospital map-ready partitions are active.",
        "CMS dialysis is fixture-only/not map-ready.",
        "CMS emergency-services designation is not live operational status.",
        "Website URL is not provided by the current CMS Hospital General Information source mapping unless a future source-backed field is added.",
      ],
    },
    coverageStatus: ctx.coverageStatus ?? null,
    selectedLocationSource: ctx.selectedLocationSource ?? "StatTerrain demo",
    dataModeGuardrails: {
      defaultMapDataset: "CMS hospital public-data partitions",
      fixtureDataMayPowerRealDataMapLayer: false,
    },
    plainLanguageMetricInterpretations: populationMetrics.map((m) => {
      const definition = populationMetricDefinitions[m.metricId];
      return {
        metricId: m.metricId,
        label: definition.label,
        whatItIs: definition.simpleWhatItIs,
        higherMeans: definition.higherMeans,
        lowerMeans: definition.lowerMeans,
        whyItMatters: definition.whyItMatters,
        planningUse: definition.planningUse,
        doNotAssume: definition.doNotAssume,
        currentDataNote: definition.currentDataNote,
      };
    }),
    populationMetricLimitationsStatement: POPULATION_METRIC_EXPORT_CAVEAT,
    sources: Array.from(relevantSourceIds)
      .map((id) => getSourceById(id))
      .filter(Boolean),
    planningConsiderations: PLANNING_CONSIDERATIONS,
    disclaimer: product.disclaimer,
    limitations: [
      "Not live operating status.",
      "Not live emergency service availability.",
      "Not bed availability.",
      "Verify current facility status directly."
    ],
    syntheticDataNotice: product.syntheticDataNotice,
    isSynthetic: false,
  };
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

export { sources };
