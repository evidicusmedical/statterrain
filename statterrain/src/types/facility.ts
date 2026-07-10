import type { ConfidenceLevel, FreshnessStatus } from "./source";

export type FacilityType =
  | "hospital"
  | "critical_access_hospital"
  | "pharmacy"
  | "dialysis"
  | "nursing_home"
  | "behavioral_health";

export type CapabilityName =
  | "trauma_level_i"
  | "trauma_level_ii"
  | "trauma_level_iii"
  | "pediatric_trauma"
  | "burn_center"
  | "acute_stroke_ready"
  | "primary_stroke_center"
  | "thrombectomy_capable"
  | "comprehensive_stroke_center"
  | "stemi_pci"
  | "pediatric_emergency"
  | "obstetric_capability"
  | "behavioral_health_receiving"
  | "emergency_department"
  | "critical_access_hospital"
  | "behavioral_health_capability"
  | "dialysis_related_capability";

export interface CapabilityRecord {
  capability: CapabilityName;
  label: string;
  level: string | null;
  populationServed: string | null;
  sourceId: string;
  sourceAgency: string;
  sourceDate: string;
  retrievalDate: string;
  confidence: ConfidenceLevel;
  freshness: FreshnessStatus;
  expirationDate: string | null;
  limitations: string[];
  isSynthetic: boolean;
}

export interface Facility {
  id: string;
  name: string;
  facilityType: FacilityType;
  lat: number;
  lng: number;
  address: string;
  city?: string;
  state?: string;
  zip?: string;
  phone?: string;
  website?: string;
  email?: string;
  fax?: string;
  distanceMiles: number;
  criticalAccess: boolean;
  capabilities: CapabilityRecord[];
  sourceIds: string[];
  freshness: FreshnessStatus;
  confidence: ConfidenceLevel;
  limitations: string[];
  isSynthetic: boolean;
}

export const FACILITY_TYPE_LABELS: Record<FacilityType, string> = {
  hospital: "Hospital / Emergency Department",
  critical_access_hospital: "Critical Access Hospital",
  pharmacy: "Pharmacy",
  dialysis: "Dialysis Facility",
  nursing_home: "Nursing Home / SNF",
  behavioral_health: "Behavioral Health Facility",
};

export const CAPABILITY_LABELS: Record<CapabilityName, string> = {
  trauma_level_i: "Trauma Level I",
  trauma_level_ii: "Trauma Level II",
  trauma_level_iii: "Trauma Level III",
  pediatric_trauma: "Pediatric Trauma",
  burn_center: "Burn Center",
  acute_stroke_ready: "Acute Stroke-Ready Hospital",
  primary_stroke_center: "Primary Stroke Center",
  thrombectomy_capable: "Thrombectomy-Capable Stroke Center",
  comprehensive_stroke_center: "Comprehensive Stroke Center",
  stemi_pci: "STEMI / PCI Capability",
  pediatric_emergency: "Pediatric Emergency Capability",
  obstetric_capability: "Obstetric Capability",
  behavioral_health_receiving: "Behavioral Health Receiving Facility",
  emergency_department: "Emergency department",
  critical_access_hospital: "Critical access hospital",
  behavioral_health_capability: "Behavioral health capability",
  dialysis_related_capability: "Dialysis-related capability",
};
