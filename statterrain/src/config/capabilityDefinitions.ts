export interface CapabilityDefinition {
  term: string;
  plainLanguageDefinition: string;
  planningRelevance: string;
  knownLimitation: string;
  operationalCaution: string;
}

const operationalCaution =
  "Planning context only. This is not live routing, diversion, transfer, medical-control, destination, or clinical advice.";

export const capabilityDefinitions: CapabilityDefinition[] = [
  {
    term: "Emergency department",
    plainLanguageDefinition: "A hospital-based service intended to evaluate and stabilize emergency conditions.",
    planningRelevance: "Identifies likely acute-care entry points for geography-level resource awareness.",
    knownLimitation: "Public listings may not verify current hours, staffing, diversion, surge constraints, or specialty coverage.",
    operationalCaution,
  },
  {
    term: "Critical access hospital",
    plainLanguageDefinition: "A rural hospital designation intended to preserve access in eligible communities.",
    planningRelevance: "Useful for rural access, transport-time, and continuity planning.",
    knownLimitation: "Designation does not by itself verify current operational capability or specialty availability.",
    operationalCaution,
  },
  {
    term: "Trauma center",
    plainLanguageDefinition: "A facility designated by an appropriate authority as meeting trauma-system criteria for a stated level.",
    planningRelevance: "Supports trauma-system overview and specialty-access planning.",
    knownLimitation: "Designation data can lag changes and does not show real-time availability or diversion status.",
    operationalCaution,
  },
  {
    term: "Stroke center",
    plainLanguageDefinition: "A facility recognized for stroke evaluation and treatment capabilities at a defined level.",
    planningRelevance: "Supports geography-level stroke-system awareness.",
    knownLimitation: "Public designation data may not show current imaging, specialist, transfer, or bed availability.",
    operationalCaution,
  },
  {
    term: "Primary stroke center",
    plainLanguageDefinition: "A stroke designation commonly associated with standardized acute stroke evaluation and treatment processes.",
    planningRelevance: "Helps distinguish baseline organized stroke capability from higher-acuity stroke services.",
    knownLimitation: "Terminology and verification sources vary by jurisdiction and accrediting body.",
    operationalCaution,
  },
  {
    term: "Thrombectomy-capable stroke center",
    plainLanguageDefinition: "A stroke-center category indicating capability for selected endovascular stroke interventions when verified by an appropriate source.",
    planningRelevance: "Useful for understanding potential access to advanced stroke intervention in regional planning.",
    knownLimitation: "A listed capability does not prove current team availability, suite availability, transfer acceptance, or real-time eligibility.",
    operationalCaution,
  },
  {
    term: "Comprehensive stroke center",
    plainLanguageDefinition: "A high-acuity stroke designation associated with advanced stroke services when verified by an appropriate source.",
    planningRelevance: "Supports understanding of regional advanced stroke-care anchors.",
    knownLimitation: "Public records may not reflect current staffing, ICU capacity, transfer status, or procedural availability.",
    operationalCaution,
  },
  {
    term: "Acute stroke ready hospital",
    plainLanguageDefinition: "A facility recognized for initial stroke evaluation and stabilization capability when verified by an appropriate source.",
    planningRelevance: "Highlights facilities that may play an initial stabilization role in a stroke system.",
    knownLimitation: "Does not imply definitive advanced stroke intervention capability or real-time acceptance.",
    operationalCaution,
  },
  {
    term: "STEMI / PCI capability",
    plainLanguageDefinition: "A cardiac-care label indicating a source-reported relationship to STEMI systems or percutaneous coronary intervention capability.",
    planningRelevance: "Supports awareness of potential time-sensitive cardiac-care resources.",
    knownLimitation: "Designation does not verify current cath-lab staffing, opening status, transfer acceptance, or diversion status.",
    operationalCaution,
  },
  {
    term: "Pediatric capability",
    plainLanguageDefinition: "A label for source-reported services, designations, or resources relevant to children.",
    planningRelevance: "Supports pediatric emergency preparedness and specialty-access planning.",
    knownLimitation: "Public records may not specify age limits, specialty coverage, ICU capacity, or real-time readiness.",
    operationalCaution,
  },
  {
    term: "Behavioral health capability",
    plainLanguageDefinition: "A label for source-reported behavioral-health services or receiving functions.",
    planningRelevance: "Supports mental-health and substance-use crisis-system planning.",
    knownLimitation: "Public records may not verify involuntary status, exclusion criteria, payer limits, intake hours, or capacity.",
    operationalCaution,
  },
  {
    term: "Dialysis-related capability",
    plainLanguageDefinition: "A label for source-reported dialysis services or dialysis-relevant facility resources.",
    planningRelevance: "Supports continuity planning for patients who require recurring dialysis.",
    knownLimitation: "Public data may not show chair availability, water status, schedule disruption, or emergency operating status.",
    operationalCaution,
  },
];
