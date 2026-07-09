import type { OverlayMetricId } from "@/types/metric";
import { OVERLAY_LABELS } from "@/types/metric";

export interface PopulationMetricDefinition {
  metricId: OverlayMetricId;
  label: string;
  plainLanguageDefinition: string;
  denominatorOrBasis: string;
  sourceStatus: string;
  planningRelevance: string;
  knownLimitation: string;
  syntheticDataCaveat: string;
}

const syntheticCaveat =
  "Synthetic demonstration metric — not a real-world source. Future versions should show the source definition, denominator, geography level, release date, and limitation.";

export const populationMetricDefinitions: Record<OverlayMetricId, PopulationMetricDefinition> = {
  pop_65_plus: {
    metricId: "pop_65_plus",
    label: OVERLAY_LABELS.pop_65_plus,
    plainLanguageDefinition: "Share of residents in the selected geography who are age 65 or older.",
    denominatorOrBasis: "Percent of total population in the selected geography.",
    sourceStatus: "Synthetic demonstration value modeled after public demographic tables; no real ACS pull is active.",
    planningRelevance: "Older adult concentration can affect EMS demand, medication needs, fall risk planning, chronic disease burden, and post-acute access questions.",
    knownLimitation: "Age distribution alone does not measure frailty, disability, caregiver availability, or clinical acuity.",
    syntheticDataCaveat: syntheticCaveat,
  },
  pediatric_population: {
    metricId: "pediatric_population",
    label: OVERLAY_LABELS.pediatric_population,
    plainLanguageDefinition: "Estimated share of residents counted as pediatric for planning display purposes.",
    denominatorOrBasis: "Percent of total population. The pediatric age threshold depends on the source dataset once real data are connected.",
    sourceStatus: "Synthetic demonstration value; it does not represent a real source-defined pediatric age cutoff.",
    planningRelevance: "Pediatric population context can inform pediatric-ready ED planning, EMS equipment considerations, transfer pathways, and community preparedness review.",
    knownLimitation: "Does not indicate pediatric emergency capability, pediatric subspecialty access, school-day population, or seasonal population shifts.",
    syntheticDataCaveat: syntheticCaveat,
  },
  poverty: {
    metricId: "poverty",
    label: OVERLAY_LABELS.poverty,
    plainLanguageDefinition: "Estimated share of residents living below a poverty measure.",
    denominatorOrBasis: "Real datasets usually define this relative to a federal poverty threshold or dataset-specific poverty measure; current values are synthetic.",
    sourceStatus: "Synthetic demonstration value modeled after public socioeconomic tables; no real Census poverty table is connected.",
    planningRelevance: "Poverty context can highlight transportation, medication affordability, follow-up access, and disaster recovery concerns.",
    knownLimitation: "A single poverty measure does not capture wealth, insurance status, housing stability, or neighborhood-level variation.",
    syntheticDataCaveat: syntheticCaveat,
  },
  limited_english: {
    metricId: "limited_english",
    label: OVERLAY_LABELS.limited_english,
    plainLanguageDefinition: "Estimated share of households or residents with limited English proficiency.",
    denominatorOrBasis: "Prototype displays a percent of households; future real-data views should state the exact table denominator and language threshold.",
    sourceStatus: "Synthetic demonstration value; no real Census language table is connected.",
    planningRelevance: "Language-access needs affect emergency messaging, discharge instructions, consent workflows, and public-health outreach.",
    knownLimitation: "Does not identify specific languages, interpreter availability, literacy, or household-level clinical need.",
    syntheticDataCaveat: syntheticCaveat,
  },
  no_vehicle: {
    metricId: "no_vehicle",
    label: OVERLAY_LABELS.no_vehicle,
    plainLanguageDefinition: "Estimated share of households without access to a vehicle.",
    denominatorOrBasis: "Percent of households in the selected geography.",
    sourceStatus: "Synthetic demonstration value; no real Census vehicle-access table is connected.",
    planningRelevance: "Vehicle access can affect appointment adherence, pharmacy access, evacuation planning, and reliance on EMS or community transport.",
    knownLimitation: "Does not measure public transit quality, ride availability, disability transport needs, or individual access during emergencies.",
    syntheticDataCaveat: syntheticCaveat,
  },
  copd: {
    metricId: "copd",
    label: OVERLAY_LABELS.copd,
    plainLanguageDefinition: "Estimated adult prevalence of chronic obstructive pulmonary disease.",
    denominatorOrBasis: "Percent of adults; future real-data views should state the modeled source denominator and geography.",
    sourceStatus: "Synthetic demonstration value modeled after public chronic-disease estimates; no real CDC PLACES data is connected.",
    planningRelevance: "Respiratory disease burden can inform oxygen, ventilation, air-quality, wildfire smoke, and seasonal surge planning.",
    knownLimitation: "Modeled prevalence is not a count of active patients and does not predict individual acuity.",
    syntheticDataCaveat: syntheticCaveat,
  },
  coronary_heart_disease: {
    metricId: "coronary_heart_disease",
    label: OVERLAY_LABELS.coronary_heart_disease,
    plainLanguageDefinition: "Estimated adult prevalence of coronary heart disease.",
    denominatorOrBasis: "Percent of adults; future real-data views should state the modeled source denominator and geography.",
    sourceStatus: "Synthetic demonstration value; no real CDC PLACES data is connected.",
    planningRelevance: "Cardiac disease burden can inform STEMI system review, rehab access, medication continuity, and community paramedicine planning.",
    knownLimitation: "Does not indicate current catheterization lab availability, transfer time, or patient-specific cardiac risk.",
    syntheticDataCaveat: syntheticCaveat,
  },
  stroke_prevalence: {
    metricId: "stroke_prevalence",
    label: OVERLAY_LABELS.stroke_prevalence,
    plainLanguageDefinition: "Estimated adult prevalence of prior stroke.",
    denominatorOrBasis: "Percent of adults; future real-data views should state the modeled source denominator and geography.",
    sourceStatus: "Synthetic demonstration value; no real CDC PLACES data is connected.",
    planningRelevance: "Stroke burden can inform stroke-center network review, rehab access, prevention outreach, and transfer-pathway planning.",
    knownLimitation: "Does not measure acute stroke incidence, last-known-well times, thrombectomy eligibility, or live stroke-center status.",
    syntheticDataCaveat: syntheticCaveat,
  },
  poor_mental_health: {
    metricId: "poor_mental_health",
    label: OVERLAY_LABELS.poor_mental_health,
    plainLanguageDefinition: "Estimated share of adults reporting frequent poor mental-health days.",
    denominatorOrBasis: "Percent of adults, typically based on survey-modeled definitions in real datasets.",
    sourceStatus: "Synthetic demonstration value; no real CDC PLACES data is connected.",
    planningRelevance: "Mental-health burden can inform behavioral-health access review, crisis planning, and follow-up resource mapping.",
    knownLimitation: "Does not identify psychiatric emergencies, available beds, crisis-line usage, or individual behavioral-health needs.",
    syntheticDataCaveat: syntheticCaveat,
  },
  social_vulnerability: {
    metricId: "social_vulnerability",
    label: OVERLAY_LABELS.social_vulnerability,
    plainLanguageDefinition: "A relative vulnerability measure comparing community social factors across geographies; it is not a direct clinical-risk score.",
    denominatorOrBasis: "Prototype displays an overall relative percentile-style score; future real-data views should state theme variables, geography, and release year.",
    sourceStatus: "Synthetic demonstration value; no real CDC/ATSDR SVI file is connected.",
    planningRelevance: "SVI-style context can help planners identify communities that may need additional outreach, evacuation support, or recovery resources.",
    knownLimitation: "Composite scores can hide which underlying factor is driving vulnerability and should not be used for patient-level triage.",
    syntheticDataCaveat: syntheticCaveat,
  },
  rurality: {
    metricId: "rurality",
    label: OVERLAY_LABELS.rurality,
    plainLanguageDefinition: "A planning-oriented indication of how rural or urban the selected geography is.",
    denominatorOrBasis: "Real classification may come from a formal public rurality classification; current prototype values are synthetic.",
    sourceStatus: "Synthetic demonstration value; no real RUCA or other rurality file is connected.",
    planningRelevance: "Rurality context can inform transport-time assumptions, specialty access gaps, workforce planning, and mutual-aid conversations.",
    knownLimitation: "Rurality classifications can lag development and do not capture road conditions, weather, or live resource availability.",
    syntheticDataCaveat: syntheticCaveat,
  },
};

export function getPopulationMetricDefinition(metricId: OverlayMetricId) {
  return populationMetricDefinitions[metricId];
}
