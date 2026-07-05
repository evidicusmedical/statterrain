import type { PlanningConsideration } from "@/types/evidence";

export const PLANNING_CONSIDERATIONS: PlanningConsideration[] = [
  {
    id: "pc-age",
    label: "Planning consideration",
    text: "A relatively older population may be relevant to falls, sepsis, polypharmacy, anticoagulation-related trauma, and long-term-care transfers.",
  },
  {
    id: "pc-cardiopulm",
    label: "Planning consideration",
    text: "Elevated COPD and coronary-disease estimates may be relevant to EMS respiratory and cardiac protocol review.",
  },
  {
    id: "pc-vehicle",
    label: "Orientation prompt",
    text: "Limited vehicle access may affect EMS utilization, discharge planning, pharmacy access, and outpatient follow-up.",
  },
  {
    id: "pc-behavioral",
    label: "Planning consideration",
    text: "Limited behavioral-health resources may contribute to ED boarding and interfacility transfer burden.",
  },
  {
    id: "pc-rurality",
    label: "Orientation prompt",
    text: "Rural geography and longer travel distances may affect access to time-sensitive specialty services.",
  },
  {
    id: "pc-disability",
    label: "Planning consideration",
    text: "High disability prevalence may be relevant to evacuation planning, communication access, and community-paramedicine programs.",
  },
  {
    id: "pc-language",
    label: "Local verification question",
    text: "Limited English proficiency may support review of interpreter access and multilingual public-health communication.",
  },
];
