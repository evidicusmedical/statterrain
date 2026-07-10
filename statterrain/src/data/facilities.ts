import type { Facility } from "@/types/facility";
import { makeCapability } from "./capabilities";

/**
 * Synthetic demonstration facilities for the Terrace Basin region.
 * Coordinates, names, and capability records are entirely fictional.
 */
export const facilities: Facility[] = [
  // ---- Hospitals / EDs -----------------------------------------------
  {
    id: "fac-terrace-general",
    name: "Terrace Basin General Hospital",
    facilityType: "hospital",
    lat: 43.62,
    lng: -116.2,
    address: "100 Basin Parkway, Cascadia City, Demonstration State",
    distanceMiles: 0,
    criticalAccess: false,
    capabilities: [
      makeCapability({
        capability: "trauma_level_i",
        level: "Level I",
        sourceId: "src-state-trauma",
        sourceAgency: "State Department of Health",
        sourceDate: "2025-05-01",
        confidence: "high",
        freshness: "current",
      }),
      makeCapability({
        capability: "comprehensive_stroke_center",
        sourceId: "src-state-stroke-stemi",
        sourceAgency: "State EMS Office",
        sourceDate: "2025-04-01",
        confidence: "medium",
        freshness: "watch",
      }),
      makeCapability({
        capability: "stemi_pci",
        sourceId: "src-state-stroke-stemi",
        sourceAgency: "State EMS Office",
        sourceDate: "2025-04-01",
        confidence: "medium",
        freshness: "watch",
      }),
      makeCapability({
        capability: "pediatric_emergency",
        sourceId: "src-cms-provider-data",
        sourceAgency: "CMS Provider Data Catalog",
        sourceDate: "2025-10-01",
        confidence: "high",
        freshness: "current",
      }),
      makeCapability({
        capability: "obstetric_capability",
        sourceId: "src-cms-provider-data",
        sourceAgency: "CMS Provider Data Catalog",
        sourceDate: "2025-10-01",
        confidence: "high",
        freshness: "current",
      }),
    ],
    sourceIds: ["src-cms-provider-data", "src-state-trauma", "src-state-stroke-stemi", "src-nppes"],
    freshness: "current",
    confidence: "high",
    limitations: ["Flagship reference facility for this demonstration region."],
    isSynthetic: true,
  },
  {
    id: "fac-cascadia-city-medical",
    name: "Cascadia City Medical Center",
    facilityType: "hospital",
    lat: 43.605,
    lng: -116.235,
    address: "220 Harborview Ave, Cascadia City, Demonstration State",
    distanceMiles: 3.4,
    criticalAccess: false,
    capabilities: [
      makeCapability({
        capability: "trauma_level_ii",
        level: "Level II",
        sourceId: "src-state-trauma",
        sourceAgency: "State Department of Health",
        sourceDate: "2025-05-01",
        confidence: "high",
        freshness: "current",
      }),
      makeCapability({
        capability: "primary_stroke_center",
        sourceId: "src-state-stroke-stemi",
        sourceAgency: "State EMS Office",
        sourceDate: "2025-04-01",
        confidence: "medium",
        freshness: "watch",
      }),
      makeCapability({
        capability: "stemi_pci",
        sourceId: "src-state-stroke-stemi",
        sourceAgency: "State EMS Office",
        sourceDate: "2025-04-01",
        confidence: "medium",
        freshness: "watch",
      }),
      makeCapability({
        capability: "obstetric_capability",
        sourceId: "src-cms-provider-data",
        sourceAgency: "CMS Provider Data Catalog",
        sourceDate: "2025-10-01",
        confidence: "high",
        freshness: "current",
      }),
    ],
    sourceIds: ["src-cms-provider-data", "src-state-trauma", "src-state-stroke-stemi"],
    freshness: "current",
    confidence: "high",
    limitations: [],
    isSynthetic: true,
  },
  {
    id: "fac-riverbend-community",
    name: "Riverbend Community Hospital",
    facilityType: "hospital",
    lat: 43.665,
    lng: -116.145,
    address: "58 Riverbend Rd, Riverbend, Demonstration State",
    distanceMiles: 6.1,
    criticalAccess: false,
    capabilities: [
      makeCapability({
        capability: "trauma_level_iii",
        level: "Level III",
        sourceId: "src-state-trauma",
        sourceAgency: "State Department of Health",
        sourceDate: "2025-05-01",
        confidence: "high",
        freshness: "current",
      }),
      makeCapability({
        capability: "acute_stroke_ready",
        sourceId: "src-state-stroke-stemi",
        sourceAgency: "State EMS Office",
        sourceDate: "2025-04-01",
        confidence: "medium",
        freshness: "watch",
      }),
      makeCapability({
        capability: "obstetric_capability",
        sourceId: "src-cms-provider-data",
        sourceAgency: "CMS Provider Data Catalog",
        sourceDate: "2025-10-01",
        confidence: "high",
        freshness: "current",
      }),
    ],
    sourceIds: ["src-cms-provider-data", "src-state-trauma", "src-state-stroke-stemi"],
    freshness: "current",
    confidence: "high",
    limitations: [],
    isSynthetic: true,
  },
  {
    id: "fac-highland-rural",
    name: "Highland Rural Health Clinic",
    facilityType: "critical_access_hospital",
    lat: 43.74,
    lng: -116.05,
    address: "12 Ridgeline Way, Highland, Demonstration State",
    distanceMiles: 14.8,
    criticalAccess: true,
    capabilities: [
      makeCapability({
        capability: "acute_stroke_ready",
        sourceId: "src-state-stroke-stemi",
        sourceAgency: "State EMS Office",
        sourceDate: "2025-04-01",
        confidence: "low",
        freshness: "stale",
        limitations: [
          "Designation record has not been reconfirmed in the last cycle; verify locally.",
        ],
      }),
    ],
    sourceIds: ["src-cms-provider-data", "src-state-stroke-stemi"],
    freshness: "watch",
    confidence: "medium",
    limitations: ["Small rural facility with limited public reporting detail."],
    isSynthetic: true,
  },
  {
    id: "fac-north-basin-regional",
    name: "North Basin Regional Hospital",
    facilityType: "hospital",
    lat: 43.71,
    lng: -116.27,
    address: "900 North Basin Hwy, North Basin, Demonstration State",
    distanceMiles: 10.2,
    criticalAccess: false,
    capabilities: [
      makeCapability({
        capability: "trauma_level_ii",
        level: "Level II",
        sourceId: "src-state-trauma",
        sourceAgency: "State Department of Health",
        sourceDate: "2025-05-01",
        confidence: "high",
        freshness: "current",
      }),
      makeCapability({
        capability: "thrombectomy_capable",
        sourceId: "src-state-stroke-stemi",
        sourceAgency: "State EMS Office",
        sourceDate: "2025-04-01",
        confidence: "medium",
        freshness: "watch",
      }),
      makeCapability({
        capability: "pediatric_trauma",
        sourceId: "src-state-trauma",
        sourceAgency: "State Department of Health",
        sourceDate: "2025-05-01",
        confidence: "medium",
        freshness: "current",
      }),
      makeCapability({
        capability: "burn_center",
        sourceId: "src-cms-provider-data",
        sourceAgency: "CMS Provider Data Catalog",
        sourceDate: "2025-10-01",
        confidence: "low",
        freshness: "manual_review",
        limitations: ["Burn center designation could not be cross-confirmed against a second source."],
      }),
    ],
    sourceIds: ["src-cms-provider-data", "src-state-trauma", "src-state-stroke-stemi"],
    freshness: "current",
    confidence: "high",
    limitations: [],
    isSynthetic: true,
  },
  {
    id: "fac-cascadia-childrens",
    name: "Cascadia Children's Hospital",
    facilityType: "hospital",
    lat: 43.59,
    lng: -116.21,
    address: "77 Meadowlark Dr, Cascadia City, Demonstration State",
    distanceMiles: 2.9,
    criticalAccess: false,
    capabilities: [
      makeCapability({
        capability: "pediatric_trauma",
        sourceId: "src-state-trauma",
        sourceAgency: "State Department of Health",
        sourceDate: "2025-05-01",
        confidence: "high",
        freshness: "current",
      }),
      makeCapability({
        capability: "pediatric_emergency",
        sourceId: "src-cms-provider-data",
        sourceAgency: "CMS Provider Data Catalog",
        sourceDate: "2025-10-01",
        confidence: "high",
        freshness: "current",
      }),
      makeCapability({
        capability: "obstetric_capability",
        sourceId: "src-cms-provider-data",
        sourceAgency: "CMS Provider Data Catalog",
        sourceDate: "2025-10-01",
        confidence: "medium",
        freshness: "current",
      }),
    ],
    sourceIds: ["src-cms-provider-data", "src-state-trauma"],
    freshness: "current",
    confidence: "high",
    limitations: [],
    isSynthetic: true,
  },
  {
    id: "fac-basin-valley-critical-access",
    name: "Basin Valley Critical Access Hospital",
    facilityType: "critical_access_hospital",
    lat: 43.5,
    lng: -116.33,
    address: "5 Valley View Rd, Basin Valley, Demonstration State",
    distanceMiles: 17.6,
    criticalAccess: true,
    capabilities: [],
    sourceIds: ["src-cms-provider-data"],
    freshness: "watch",
    confidence: "medium",
    limitations: ["No publicly documented specialty capability records available for this facility."],
    isSynthetic: true,
  },
  {
    id: "fac-southfork-community",
    name: "Southfork Community Medical Center",
    facilityType: "hospital",
    lat: 43.55,
    lng: -116.12,
    address: "310 Southfork Blvd, Southfork, Demonstration State",
    distanceMiles: 9.5,
    criticalAccess: false,
    capabilities: [
      makeCapability({
        capability: "trauma_level_iii",
        level: "Level III",
        sourceId: "src-state-trauma",
        sourceAgency: "State Department of Health",
        sourceDate: "2025-05-01",
        confidence: "medium",
        freshness: "current",
      }),
      makeCapability({
        capability: "primary_stroke_center",
        sourceId: "src-state-stroke-stemi",
        sourceAgency: "State EMS Office",
        sourceDate: "2025-04-01",
        confidence: "medium",
        freshness: "watch",
      }),
      makeCapability({
        capability: "behavioral_health_receiving",
        sourceId: "src-samhsa-findtreatment",
        sourceAgency: "SAMHSA",
        sourceDate: "2025-09-15",
        confidence: "medium",
        freshness: "current",
      }),
    ],
    sourceIds: ["src-cms-provider-data", "src-state-trauma", "src-samhsa-findtreatment"],
    freshness: "current",
    confidence: "medium",
    limitations: [],
    isSynthetic: true,
  },

  // ---- Pharmacies -------------------------------------------------------
  ...([
    ["fac-pharm-basin-parkway", "Basin Parkway Pharmacy", 43.615, -116.205, "110 Basin Parkway, Cascadia City"],
    ["fac-pharm-harborview", "Harborview Pharmacy", 43.607, -116.238, "224 Harborview Ave, Cascadia City"],
    ["fac-pharm-riverbend", "Riverbend Drug & Wellness", 43.663, -116.148, "60 Riverbend Rd, Riverbend"],
    ["fac-pharm-highland", "Highland Family Pharmacy", 43.738, -116.055, "14 Ridgeline Way, Highland"],
    ["fac-pharm-north-basin", "North Basin Pharmacy", 43.712, -116.265, "902 North Basin Hwy, North Basin"],
    ["fac-pharm-meadowlark", "Meadowlark Pharmacy", 43.591, -116.213, "79 Meadowlark Dr, Cascadia City"],
    ["fac-pharm-valley", "Basin Valley Pharmacy", 43.502, -116.328, "7 Valley View Rd, Basin Valley"],
    ["fac-pharm-southfork", "Southfork Pharmacy", 43.552, -116.122, "312 Southfork Blvd, Southfork"],
    ["fac-pharm-downtown", "Downtown Cascadia Pharmacy", 43.601, -116.222, "45 Main St, Cascadia City"],
    ["fac-pharm-eastgate", "Eastgate Pharmacy", 43.63, -116.16, "150 Eastgate Rd, Cascadia City"],
  ] as const).map(([id, name, lat, lng, address]) => makePharmacy(id, name, lat, lng, address)),

  // ---- Dialysis facilities ----------------------------------------------
  ...([
    ["fac-dialysis-basin", "Basin Dialysis Center", 43.617, -116.19, "130 Basin Parkway, Cascadia City"],
    ["fac-dialysis-riverbend", "Riverbend Kidney Care", 43.668, -116.15, "62 Riverbend Rd, Riverbend"],
    ["fac-dialysis-southfork", "Southfork Renal Care Center", 43.548, -116.118, "320 Southfork Blvd, Southfork"],
  ] as const).map(([id, name, lat, lng, address]) => makeDialysis(id, name, lat, lng, address)),

  // ---- Nursing homes / SNFs ----------------------------------------------
  ...([
    ["fac-snf-basin-manor", "Basin Manor Skilled Nursing", 43.625, -116.215, "140 Basin Parkway, Cascadia City"],
    ["fac-snf-harborview", "Harborview Care Center", 43.6, -116.24, "230 Harborview Ave, Cascadia City"],
    ["fac-snf-riverbend", "Riverbend Nursing & Rehab", 43.67, -116.14, "64 Riverbend Rd, Riverbend"],
    ["fac-snf-highland", "Highland Senior Care", 43.745, -116.048, "16 Ridgeline Way, Highland"],
    ["fac-snf-north-basin", "North Basin Care Community", 43.715, -116.26, "905 North Basin Hwy, North Basin"],
    ["fac-snf-valley", "Basin Valley Nursing Home", 43.495, -116.335, "9 Valley View Rd, Basin Valley"],
  ] as const).map(([id, name, lat, lng, address]) => makeNursingHome(id, name, lat, lng, address)),

  // ---- Behavioral health facilities --------------------------------------
  makeBehavioralHealth(
    "fac-bh-cascadia-counseling",
    "Cascadia Behavioral Health Center",
    43.598,
    -116.228,
    "88 Harborview Ave, Cascadia City",
    true,
  ),
  makeBehavioralHealth(
    "fac-bh-riverbend-recovery",
    "Riverbend Recovery Services",
    43.672,
    -116.155,
    "70 Riverbend Rd, Riverbend",
    false,
  ),
  makeBehavioralHealth(
    "fac-bh-north-basin-wellness",
    "North Basin Behavioral Wellness",
    43.708,
    -116.275,
    "910 North Basin Hwy, North Basin",
    true,
  ),
  makeBehavioralHealth(
    "fac-bh-southfork-counseling",
    "Southfork Counseling & Crisis Services",
    43.558,
    -116.128,
    "325 Southfork Blvd, Southfork",
    false,
  ),
];

/**
 * Deterministic pseudo-random helper so demonstration distance
 * values are stable across server and client renders (avoids hydration
 * mismatches that Math.random() would cause).
 */
function seededValue(id: string, min: number, max: number): number {
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    hash = (hash * 31 + id.charCodeAt(i)) >>> 0;
  }
  const fraction = (hash % 1000) / 1000;
  return min + fraction * (max - min);
}

function makePharmacy(id: string, name: string, lat: number, lng: number, address: string): Facility {
  return {
    id,
    name,
    facilityType: "pharmacy",
    lat,
    lng,
    address: `${address}, Demonstration State`,
    distanceMiles: Number(seededValue(id, 1, 13).toFixed(1)),
    criticalAccess: false,
    capabilities: [],
    sourceIds: ["src-nppes"],
    freshness: "current",
    confidence: "high",
    limitations: ["Demonstration record: does not reflect medication inventory or hours."],
    isSynthetic: true,
  };
}

function makeDialysis(id: string, name: string, lat: number, lng: number, address: string): Facility {
  return {
    id,
    name,
    facilityType: "dialysis",
    lat,
    lng,
    address: `${address}, Demonstration State`,
    distanceMiles: Number(seededValue(id, 1, 13).toFixed(1)),
    criticalAccess: false,
    capabilities: [],
    sourceIds: ["src-cms-provider-data"],
    freshness: "current",
    confidence: "medium",
    limitations: ["Demonstration record: does not reflect chair capacity or shift schedule."],
    isSynthetic: true,
  };
}

function makeNursingHome(id: string, name: string, lat: number, lng: number, address: string): Facility {
  return {
    id,
    name,
    facilityType: "nursing_home",
    lat,
    lng,
    address: `${address}, Demonstration State`,
    distanceMiles: Number(seededValue(id, 1, 13).toFixed(1)),
    criticalAccess: false,
    capabilities: [],
    sourceIds: ["src-cms-provider-data"],
    freshness: "watch",
    confidence: "medium",
    limitations: ["Demonstration record: does not reflect current bed availability."],
    isSynthetic: true,
  };
}

function makeBehavioralHealth(
  id: string,
  name: string,
  lat: number,
  lng: number,
  address: string,
  receiving: boolean,
): Facility {
  return {
    id,
    name,
    facilityType: "behavioral_health",
    lat,
    lng,
    address: `${address}, Demonstration State`,
    distanceMiles: Number(seededValue(id, 1, 13).toFixed(1)),
    criticalAccess: false,
    capabilities: receiving
      ? [
          makeCapability({
            capability: "behavioral_health_receiving",
            sourceId: "src-samhsa-findtreatment",
            sourceAgency: "SAMHSA",
            sourceDate: "2025-09-15",
            confidence: "medium",
            freshness: "current",
          }),
        ]
      : [],
    sourceIds: ["src-samhsa-findtreatment"],
    freshness: "current",
    confidence: "medium",
    limitations: ["Demonstration record: receiving status changes frequently and must be verified locally."],
    isSynthetic: true,
  };
}

export function getFacilityById(id: string): Facility | undefined {
  return facilities.find((f) => f.id === id);
}
