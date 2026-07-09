import { product } from "@/config/product";
import { populationMetrics } from "@/data/population-metrics";
import { POPULATION_METRIC_EXPORT_CAVEAT, populationMetricDefinitions } from "@/config/populationMetricDefinitions";
import { getSourceById, sources } from "@/data/sources";
import type { Facility } from "@/types/facility";
import { CAPABILITY_LABELS, FACILITY_TYPE_LABELS } from "@/types/facility";
import { CONFIDENCE_LABELS, FRESHNESS_LABELS } from "@/types/source";
import { OVERLAY_LABELS } from "@/types/metric";
import { formatDate, todayIso } from "./format";
import type { AppFilters } from "@/hooks/useAppState";
import { PLANNING_CONSIDERATIONS } from "./planning-considerations";

export interface BriefContext {
  locationLabel: string;
  radiusMiles: number;
  filters: AppFilters;
  visibleFacilities: Facility[];
  briefFacilities: Facility[];
}

function activeFilterSummary(filters: AppFilters) {
  return {
    facilityTypes: Array.from(filters.facilityTypes).map((t) => FACILITY_TYPE_LABELS[t]),
    capabilities: Array.from(filters.capabilities).map((c) => CAPABILITY_LABELS[c]),
    overlay: filters.overlay ? OVERLAY_LABELS[filters.overlay] : "None active",
    confidence:
      filters.confidence === "high"
        ? "High confidence only"
        : filters.confidence === "high_medium"
          ? "High and medium confidence"
          : "All demonstration records",
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
  "Brief scope: This evidence brief includes all available facility categories within the selected geography. Current map display filters are not used to exclude records from this brief.";

export function buildMarkdownBrief(ctx: BriefContext): string {
  const { locationLabel, radiusMiles, filters, visibleFacilities, briefFacilities } = ctx;
  const filterSummary = activeFilterSummary(filters);
  const relevantSourceIds = new Set<string>();
  briefFacilities.forEach((f) => f.sourceIds.forEach((id) => relevantSourceIds.add(id)));
  populationMetrics.forEach((m) => relevantSourceIds.add(m.sourceId));

  const lines: string[] = [];
  lines.push(`# ${product.name} Regional Emergency Care Evidence Brief`);
  lines.push("");
  lines.push(`**${product.tagline}**`);
  lines.push("");
  lines.push(`> ${product.syntheticDataNotice}`);
  lines.push("");
  lines.push(`- Search location: ${locationLabel}`);
  lines.push(`- Radius: ${radiusMiles} miles (approximate; not routed drive-time)`);
  lines.push(`- Date generated: ${formatDate(todayIso())}`);
  lines.push(`- ${product.prototypeVersion}`);
  lines.push(`- ${BRIEF_SCOPE_STATEMENT}`);
  lines.push("");

  lines.push("## Data freshness summary");
  lines.push("");
  lines.push("| Source | Freshness | Confidence |");
  lines.push("| --- | --- | --- |");
  Array.from(relevantSourceIds).forEach((id) => {
    const s = getSourceById(id);
    if (!s) return;
    lines.push(`| ${s.dataset} | ${FRESHNESS_LABELS[s.freshness]} | ${CONFIDENCE_LABELS[s.confidence]} |`);
  });
  lines.push("");

  lines.push("## Emergency-care facility overview");
  lines.push("");
  const hospitals = briefFacilities.filter(
    (f) => f.facilityType === "hospital" || f.facilityType === "critical_access_hospital",
  );
  lines.push(`Hospitals / EDs in range: ${hospitals.length}`);
  lines.push("");
  lines.push("## Hospital capability summary");
  lines.push("");
  hospitals.forEach((f) => {
    lines.push(`### ${f.name}`);
    lines.push(`- Address: ${f.address}`);
    lines.push(`- Distance: ${f.distanceMiles} mi (approx. ${f.approxDriveTimeMinutes} min demonstration drive time)`);
    lines.push(`- Critical access: ${f.criticalAccess ? "Yes" : "No"}`);
    if (f.capabilities.length === 0) {
      lines.push("- No publicly documented specialty capability records available.");
    } else {
      f.capabilities.forEach((c) => {
        lines.push(
          `- ${c.label}${c.level ? ` (${c.level})` : ""} — ${CONFIDENCE_LABELS[c.confidence]}, ${FRESHNESS_LABELS[c.freshness]}, source: ${c.sourceAgency} (${formatDate(c.sourceDate)})`,
        );
      });
    }
    lines.push("");
  });

  lines.push("## Pharmacy, dialysis, nursing-home, and behavioral-health summary");
  lines.push("");
  (["pharmacy", "dialysis", "nursing_home", "behavioral_health"] as const).forEach((type) => {
    const count = briefFacilities.filter((f) => f.facilityType === type).length;
    lines.push(`- ${FACILITY_TYPE_LABELS[type]}: ${count}`);
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

  lines.push("## Metric definitions and limitations");
  lines.push("");
  lines.push(POPULATION_METRIC_EXPORT_CAVEAT);
  lines.push("");
  populationMetrics.forEach((m) => {
    const definition = populationMetricDefinitions[m.metricId];
    lines.push(`- **${definition.label}:** ${definition.whatThisMeasures} Basis: ${definition.denominatorOrBasis} Do not infer: ${definition.doNotInfer}`);
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
  lines.push("- Are the listed hospital capability designations still active and unsuspended?");
  lines.push("- What is the current behavioral-health receiving status for facilities in this area?");
  lines.push("- Are pharmacy and dialysis hours and capacity current for this population?");
  lines.push("- Has EMS protocol review incorporated the latest chronic-disease burden estimates?");
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
    lines.push(`- Confidence: ${CONFIDENCE_LABELS[s.confidence]}`);
    lines.push(`- Freshness: ${FRESHNESS_LABELS[s.freshness]}`);
    lines.push(`- Limitations: ${s.limitations.join("; ")}`);
    lines.push(`- Source URL (example/placeholder): ${s.sourceUrl}`);
    lines.push(`- Synthetic demonstration record: Yes`);
    lines.push("");
  });

  lines.push("## Active filters at time of export");
  lines.push("");
  lines.push(`- Facility types: ${filterSummary.facilityTypes.join(", ") || "None selected"}`);
  lines.push(`- Capability filters: ${filterSummary.capabilities.join(", ") || "None"}`);
  lines.push(`- Population overlay: ${filterSummary.overlay}`);
  lines.push(`- Source confidence filter: ${filterSummary.confidence}`);
  lines.push("");

  lines.push("## Limitations");
  lines.push("");
  lines.push(
    "This brief is generated from a frontend prototype using synthetic demonstration data. No live public datasets were queried. Facility capability, freshness, and population figures are illustrative and must not be used for operational, clinical, or transfer decisions.",
  );
  lines.push("");

  lines.push("## Required disclaimer");
  lines.push("");
  lines.push(`> ${product.disclaimer}`);
  lines.push("");
  lines.push(`> ${product.syntheticDataNotice}`);
  lines.push("");

  return lines.join("\n");
}

export function buildJsonBrief(ctx: BriefContext) {
  const { locationLabel, radiusMiles, filters, visibleFacilities, briefFacilities } = ctx;
  const relevantSourceIds = new Set<string>();
  briefFacilities.forEach((f) => f.sourceIds.forEach((id) => relevantSourceIds.add(id)));
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
    populationMetricLimitationsStatement: POPULATION_METRIC_EXPORT_CAVEAT,
    sources: Array.from(relevantSourceIds)
      .map((id) => getSourceById(id))
      .filter(Boolean),
    planningConsiderations: PLANNING_CONSIDERATIONS,
    disclaimer: product.disclaimer,
    syntheticDataNotice: product.syntheticDataNotice,
    isSynthetic: true,
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
    "approx_drive_time_minutes",
    "critical_access",
    "capabilities",
    "confidence",
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
      f.approxDriveTimeMinutes,
      f.criticalAccess ? "yes" : "no",
      f.capabilities.map((c) => c.label).join("; "),
      CONFIDENCE_LABELS[f.confidence],
      FRESHNESS_LABELS[f.freshness],
      "yes",
    ]
      .map(csvEscape)
      .join(","),
  );
  const notes = [
    "",
    `# ${BRIEF_SCOPE_STATEMENT}`,
    `# ${product.disclaimer}`,
    `# ${product.syntheticDataNotice}`,
    `# ${POPULATION_METRIC_EXPORT_CAVEAT}`,
  ];
  return [header.join(","), ...rows, ...notes].join("\n");
}

export function downloadMarkdownBrief(ctx: BriefContext) {
  download(buildFilename("md"), buildMarkdownBrief(ctx), "text/markdown");
}

export function downloadJsonBrief(ctx: BriefContext) {
  download(buildFilename("json"), JSON.stringify(buildJsonBrief(ctx), null, 2), "application/json");
}

export function downloadCsvBrief(ctx: BriefContext) {
  download(buildFilename("csv"), buildCsvBrief(ctx), "text/csv");
}

export { sources };
