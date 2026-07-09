import type { FacilityType } from "@/types/facility";

export interface FacilityCategoryDefinition {
  label: string;
  plainLanguageMeaning: string;
  planningRelevance: string;
  knownLimitation: string;
}

export const facilityCategoryDefinitions: Record<FacilityType, FacilityCategoryDefinition> = {
  hospital: {
    label: "Hospital",
    plainLanguageMeaning: "A facility that provides inpatient care and may include an emergency department or specialty services.",
    planningRelevance: "Helps planners identify acute-care anchors and potential specialty-care access points in a geography.",
    knownLimitation: "Public records may not indicate current diversion, transfer capacity, bed availability, staffing, or real-time service status.",
  },
  critical_access_hospital: {
    label: "Critical access hospital",
    plainLanguageMeaning: "A small rural hospital category intended to preserve access to inpatient and emergency services in eligible communities.",
    planningRelevance: "Highlights rural access points that may be essential during transport, surge, or continuity-of-care planning.",
    knownLimitation: "Designation does not verify current specialty coverage, transfer capability, staffing, or operational readiness.",
  },
  pharmacy: {
    label: "Pharmacy",
    plainLanguageMeaning: "A medication dispensing location or pharmacy service represented in the demonstration facility layer.",
    planningRelevance: "Supports awareness of medication-access geography during preparedness and recovery planning.",
    knownLimitation: "Public records may not indicate current hours, inventory, vaccination services, closures, or emergency dispensing status.",
  },
  dialysis: {
    label: "Dialysis center",
    plainLanguageMeaning: "A facility offering outpatient dialysis-related services for people with kidney failure.",
    planningRelevance: "Supports continuity-of-care planning for patients who need recurring dialysis access during disruptions.",
    knownLimitation: "Public records may not indicate current chair availability, staffing, treatment schedules, water interruptions, or emergency capacity.",
  },
  nursing_home: {
    label: "Skilled nursing facility",
    plainLanguageMeaning: "A facility providing post-acute or long-term skilled nursing care.",
    planningRelevance: "Helps planners understand concentrations of medically vulnerable residents and potential evacuation or support needs.",
    knownLimitation: "Public records may not indicate current bed availability, transfer capacity, staffing, acuity, or emergency readiness.",
  },
  behavioral_health: {
    label: "Behavioral health facility",
    plainLanguageMeaning: "A facility associated with mental-health or substance-use treatment services.",
    planningRelevance: "Supports behavioral-health access and crisis-system situational awareness at a geography level.",
    knownLimitation: "Public records may not verify walk-in access, involuntary receiving status, age restrictions, payer acceptance, or real-time capacity.",
  },
};
