import type { CapabilityName, FacilityType } from "@/types/facility";

export type TaxonomyStatus =
  | "source-backed-now"
  | "synthetic-demo-only"
  | "future-source-needed"
  | "source-mapping-needed"
  | "removed-unsupported";

export type UiVisibility = "active" | "synthetic-only" | "hidden" | "docs-only" | "disabled-future";
export type TaxonomyCategoryType = "facility-category" | "hospital-capability";

export interface FacilityTaxonomyEntry {
  id: FacilityType | CapabilityName;
  label: string;
  description: string;
  categoryType: TaxonomyCategoryType;
  status: TaxonomyStatus;
  sourceIds: string[];
  sourceFieldMappings: string[];
  currentUiVisibility: UiVisibility;
  mapLayerEligibility: "eligible" | "synthetic-only" | "not-eligible";
  evidenceEligibility: "eligible" | "synthetic-only" | "not-eligible";
  syntheticOnly: boolean;
  limitations: string[];
  reason: string;
  nextRequiredSource: string | null;
}

export const taxonomyVersion = "v0.3.1-source-backed-taxonomy";
export const taxonomyGeneratedAt = "2026-07-10T00:00:00.000Z";

export const facilityTaxonomy: FacilityTaxonomyEntry[] = [
  {
    id: "hospital",
    label: "Hospitals / emergency departments",
    description: "National CMS Hospital General Information map-ready records.",
    categoryType: "facility-category",
    status: "source-backed-now",
    sourceIds: ["cms-hospital-general-information"],
    sourceFieldMappings: ["facility_id", "facility_name", "address", "city", "state", "zip_code", "phone_number", "hospital_type", "hospital_ownership", "emergency_services"],
    currentUiVisibility: "active",
    mapLayerEligibility: "eligible",
    evidenceEligibility: "eligible",
    syntheticOnly: false,
    limitations: ["CMS fields do not validate trauma, stroke, STEMI/PCI, bed availability, diversion, or other clinical capabilities."],
    reason: "Direct current CMS source mapping exists for baseline hospital identity and address fields.",
    nextRequiredSource: null,
  },
  {
    id: "critical_access_hospital",
    label: "Critical access hospitals",
    description: "Critical-access hospitals identified from the national CMS hospital public-data partition records.",
    categoryType: "facility-category",
    status: "source-backed-now",
    sourceIds: ["cms-hospital-general-information"],
    sourceFieldMappings: ["criticalAccessIndicator"],
    currentUiVisibility: "docs-only",
    mapLayerEligibility: "not-eligible",
    evidenceEligibility: "eligible",
    syntheticOnly: false,
    limitations: ["Critical-access status may be present as CMS metadata, but this patch does not render a distinct marker or active filter."],
    reason: "Critical-access hospitals share the standard hospital marker in the active map experience.",
    nextRequiredSource: null,
  },
  {
    id: "dialysis",
    label: "Dialysis facilities",
    description: "CMS dialysis scaffold is fixture-only and not map-ready.",
    categoryType: "facility-category",
    status: "future-source-needed",
    sourceIds: ["cms-dialysis-facilities"],
    sourceFieldMappings: [],
    currentUiVisibility: "synthetic-only",
    mapLayerEligibility: "synthetic-only",
    evidenceEligibility: "synthetic-only",
    syntheticOnly: true,
    limitations: ["Fixture-only; not real national data; not for referral, routing, treatment, capacity, or clinical decisions."],
    reason: "Real CMS dialysis pull and generated map-ready artifacts have not been completed.",
    nextRequiredSource: "Complete real CMS dialysis ingestion, validation, geocoding, joins, and generated artifacts.",
  },
  {
    id: "nursing_home",
    label: "Nursing home / SNF",
    description: "Future source category; no current ingested generated source-backed artifact.",
    categoryType: "facility-category",
    status: "future-source-needed",
    sourceIds: [],
    sourceFieldMappings: [],
    currentUiVisibility: "docs-only",
    mapLayerEligibility: "not-eligible",
    evidenceEligibility: "not-eligible",
    syntheticOnly: false,
    limitations: ["A CMS source may be planned, but it has not been ingested for this release."],
    reason: "No validated current source mapping exists in v0.3.1.",
    nextRequiredSource: "Select, ingest, validate, geocode, and integrate an official SNF/nursing home source.",
  },
  {
    id: "behavioral_health",
    label: "Behavioral health facilities",
    description: "Future source category pending SAMHSA or another validated official source.",
    categoryType: "facility-category",
    status: "future-source-needed",
    sourceIds: [],
    sourceFieldMappings: [],
    currentUiVisibility: "docs-only",
    mapLayerEligibility: "not-eligible",
    evidenceEligibility: "not-eligible",
    syntheticOnly: false,
    limitations: ["Not exposed as an active checkbox or real coverage claim."],
    reason: "No validated current source mapping exists in v0.3.1.",
    nextRequiredSource: "Validate and ingest an official behavioral-health facility source.",
  },
  {
    id: "pharmacy",
    label: "Pharmacies",
    description: "Future source category pending a validated official source.",
    categoryType: "facility-category",
    status: "future-source-needed",
    sourceIds: [],
    sourceFieldMappings: [],
    currentUiVisibility: "docs-only",
    mapLayerEligibility: "not-eligible",
    evidenceEligibility: "not-eligible",
    syntheticOnly: false,
    limitations: ["Not exposed as active public-data pharmacy coverage."],
    reason: "No validated current source mapping exists in v0.3.1.",
    nextRequiredSource: "Validate and ingest an official pharmacy source before active map use.",
  },
];

const unsupportedCapabilities: CapabilityName[] = [
  "trauma_level_i", "trauma_level_ii", "trauma_level_iii", "pediatric_trauma", "burn_center",
  "acute_stroke_ready", "primary_stroke_center", "thrombectomy_capable", "comprehensive_stroke_center",
  "stemi_pci", "pediatric_emergency", "obstetric_capability", "behavioral_health_receiving",
  "emergency_department", "critical_access_hospital", "behavioral_health_capability", "dialysis_related_capability",
];

export const hospitalCapabilityTaxonomy: FacilityTaxonomyEntry[] = unsupportedCapabilities.map((id) => ({
  id,
  label: id.replaceAll("_", " "),
  description: "Hospital capability hidden from normal public-data controls until a validated source mapping exists.",
  categoryType: "hospital-capability",
  status: "synthetic-demo-only",
  sourceIds: [],
  sourceFieldMappings: [],
  currentUiVisibility: "synthetic-only",
  mapLayerEligibility: "synthetic-only",
  evidenceEligibility: "synthetic-only",
  syntheticOnly: true,
  limitations: ["Synthetic demonstration only; do not present as public-data fact."],
  reason: "No validated v0.3.1 public source mapping supports this active capability filter.",
  nextRequiredSource: "Add validated source mapping before enabling in primary controls.",
}));

export const sourceBackedFacilityTypes = facilityTaxonomy.filter((e) => e.categoryType === "facility-category" && e.currentUiVisibility === "active").map((e) => e.id as FacilityType);
export const syntheticDemoFacilityTypes = facilityTaxonomy.filter((e) => e.categoryType === "facility-category" && e.currentUiVisibility === "synthetic-only").map((e) => e.id as FacilityType);
export const futureFacilityTypes = facilityTaxonomy.filter((e) => e.categoryType === "facility-category" && ["docs-only", "disabled-future", "hidden"].includes(e.currentUiVisibility)).map((e) => e.id as FacilityType);
export const activeCapabilityFilters = hospitalCapabilityTaxonomy.filter((e) => e.currentUiVisibility === "active").map((e) => e.id as CapabilityName);
export const allTaxonomyEntries = [...facilityTaxonomy, ...hospitalCapabilityTaxonomy];
