import type { OverlayMetricId } from "@/types/metric";
import { OVERLAY_LABELS } from "@/types/metric";

export interface PopulationMetricDefinition {
  metricId: OverlayMetricId;
  label: string;
  shortLabel: string;
  whatThisMeasures: string;
  currentPrototypeDefinition: string;
  futureSourceDefinitionRequirement: string;
  denominatorOrBasis: string;
  planningRelevance: string;
  knownLimitations: string;
  syntheticDataCaveat: string;
  doNotInfer: string;
}

export const POPULATION_METRIC_EXPORT_CAVEAT =
  "Population metrics are synthetic demonstration values in this prototype. Future public-data versions must show source definitions, denominators, geography level, release dates, and limitations for each metric.";

const syntheticCaveat =
  "Synthetic demonstration value only — not a real-world source. Do not use this prototype value as an official population-health statistic.";

const chronicDiseaseSourceRequirement =
  "Future real-data versions may use CDC PLACES or similar public health estimates and must show the measure name, age group, denominator, modeling method, geography level, release date, and limitations.";

const chronicDiseaseLimitations =
  "Population-level estimates can be affected by survey methods, modeling assumptions, geography size, and release lag. They are not clinical diagnoses for individuals.";

const chronicDiseaseDoNotInfer =
  "Do not use this metric for patient-level triage, treatment decisions, diagnosis, routing, or facility destination decisions.";

export const populationMetricDefinitions: Record<OverlayMetricId, PopulationMetricDefinition> = {
  pop_65_plus: {
    metricId: "pop_65_plus",
    label: OVERLAY_LABELS.pop_65_plus,
    shortLabel: "Age 65+",
    whatThisMeasures: "The share of residents in the selected geography who are age 65 or older.",
    currentPrototypeDefinition: "Synthetic demonstration value only. It is shaped to look like a demographic percentage, but no real Census or ACS table is connected.",
    futureSourceDefinitionRequirement: "Future Census/ACS integration must show the exact table, age band, geography level, release year, and whether estimates or margins of error are displayed.",
    denominatorOrBasis: "Percent of the total resident population in the selected geography.",
    planningRelevance: "Helps planners consider older-adult EMS demand, fall risk, medication continuity, chronic disease burden, caregiver needs, and post-acute access.",
    knownLimitations: "Age alone does not measure frailty, disability, income, caregiver availability, congregate living, or clinical acuity.",
    syntheticDataCaveat: syntheticCaveat,
    doNotInfer: "Do not infer that a specific person is high risk or that nearby facilities have geriatric specialty capability.",
  },
  pediatric_population: {
    metricId: "pediatric_population",
    label: OVERLAY_LABELS.pediatric_population,
    shortLabel: "Pediatric",
    whatThisMeasures: "The share of residents counted as children or pediatric-age residents for planning context.",
    currentPrototypeDefinition: "Synthetic demonstration value only. This prototype does not yet use a real source-defined pediatric age cutoff. When real Census/ACS data are connected, this card must show the exact age band used, such as ages 0–17 or another source-defined category.",
    futureSourceDefinitionRequirement: "Future real Census/ACS integration must state the exact pediatric age band used. Likely examples may include under 18, ages 0–17, or another source-defined age band.",
    denominatorOrBasis: "Percent of the total resident population in the selected geography, once a source-defined age band is selected.",
    planningRelevance: "Supports pediatric equipment planning, family reunification planning, school and shelter coordination, pediatric transfer pathway review, and public-health messaging.",
    knownLimitations: "The prototype does not account for school-day population, seasonal population, daycare locations, pediatric subspecialty access, or household composition.",
    syntheticDataCaveat: syntheticCaveat,
    doNotInfer: "Do not infer pediatric emergency capability, pediatric inpatient capacity, or pediatric subspecialty availability at nearby hospitals.",
  },
  poverty: {
    metricId: "poverty",
    label: OVERLAY_LABELS.poverty,
    shortLabel: "Poverty",
    whatThisMeasures: "The share of people or households meeting a poverty definition in a public dataset.",
    currentPrototypeDefinition: "Synthetic demonstration value only. It is not calculated from real household income, Census, ACS, or benefits data.",
    futureSourceDefinitionRequirement: "Future public data may use federal poverty thresholds or dataset-specific poverty measures; the app must show the exact source definition, universe, time period, and geography.",
    denominatorOrBasis: "Typically a percent of people for whom poverty status is determined, but the real denominator must come from the selected source table.",
    planningRelevance: "Can highlight access barriers, medication affordability, transportation barriers, food and housing instability concerns, disaster recovery needs, and social-service coordination needs.",
    knownLimitations: "Area-level poverty does not capture wealth, debt, insurance status, household expenses, informal support, or variation inside the geography.",
    syntheticDataCaveat: syntheticCaveat,
    doNotInfer: "Do not infer household-level financial status or eligibility for assistance for any person or address.",
  },
  limited_english: {
    metricId: "limited_english",
    label: OVERLAY_LABELS.limited_english,
    shortLabel: "LEP",
    whatThisMeasures: "The share of residents or households with limited English proficiency, depending on the source definition.",
    currentPrototypeDefinition: "Synthetic demonstration value only. No real Census/ACS language or English-speaking ability fields are connected.",
    futureSourceDefinitionRequirement: "Future source definition may depend on Census/ACS language and English-speaking ability fields and must show the table, threshold, denominator, geography, and release year.",
    denominatorOrBasis: "May be based on people age 5 and older, households, or another source-defined universe; the prototype percentage is illustrative only.",
    planningRelevance: "Supports interpretation access, translated instructions, public-health messaging, EMS communication planning, shelter communication, and discharge or follow-up planning.",
    knownLimitations: "Does not identify which languages are needed, literacy level, interpreter availability, or communication needs during a specific encounter.",
    syntheticDataCaveat: syntheticCaveat,
    doNotInfer: "Do not use it to identify language needs for a specific person, household, facility encounter, or call.",
  },
  no_vehicle: {
    metricId: "no_vehicle",
    label: OVERLAY_LABELS.no_vehicle,
    shortLabel: "No vehicle",
    whatThisMeasures: "The share of households without access to a vehicle.",
    currentPrototypeDefinition: "Synthetic demonstration value only. No real Census/ACS vehicle-availability table is connected.",
    futureSourceDefinitionRequirement: "Future real-source definition may use households without vehicle access and must show the exact table, household universe, geography, release year, and margin of error when available.",
    denominatorOrBasis: "Percent of households in the selected geography, not percent of people.",
    planningRelevance: "Helps planners consider EMS reliance, pharmacy access, follow-up access, dialysis transport, evacuation planning, shelter access, and community transport partnerships.",
    knownLimitations: "Does not capture public transit quality, ride-share availability, disability transport, vehicle reliability, fuel affordability, or temporary access to borrowed vehicles.",
    syntheticDataCaveat: syntheticCaveat,
    doNotInfer: "Do not infer ambulance availability, actual transport time, road access, or whether a specific household can travel.",
  },
  copd: {
    metricId: "copd",
    label: OVERLAY_LABELS.copd,
    shortLabel: "COPD",
    whatThisMeasures: "Estimated adult prevalence of chronic obstructive pulmonary disease in the selected geography.",
    currentPrototypeDefinition: "Synthetic demonstration value only. It is not calculated from real CDC PLACES, claims, EHR, or survey data.",
    futureSourceDefinitionRequirement: chronicDiseaseSourceRequirement,
    denominatorOrBasis: "Percent of adults in the source-defined geography and age group.",
    planningRelevance: "Provides community risk context for EMS demand planning, oxygen and ventilation planning, air-quality events, wildfire smoke, chronic disease burden, and continuity planning.",
    knownLimitations: chronicDiseaseLimitations,
    syntheticDataCaveat: syntheticCaveat,
    doNotInfer: chronicDiseaseDoNotInfer,
  },
  coronary_heart_disease: {
    metricId: "coronary_heart_disease",
    label: OVERLAY_LABELS.coronary_heart_disease,
    shortLabel: "CHD",
    whatThisMeasures: "Estimated adult prevalence of coronary heart disease in the selected geography.",
    currentPrototypeDefinition: "Synthetic demonstration value only. It is not calculated from real CDC PLACES, claims, EHR, or survey data.",
    futureSourceDefinitionRequirement: chronicDiseaseSourceRequirement,
    denominatorOrBasis: "Percent of adults in the source-defined geography and age group.",
    planningRelevance: "Supports community risk context, EMS demand planning, cardiac system review, medication continuity planning, rehabilitation access review, and chronic disease burden planning.",
    knownLimitations: chronicDiseaseLimitations,
    syntheticDataCaveat: syntheticCaveat,
    doNotInfer: chronicDiseaseDoNotInfer,
  },
  stroke_prevalence: {
    metricId: "stroke_prevalence",
    label: OVERLAY_LABELS.stroke_prevalence,
    shortLabel: "Stroke",
    whatThisMeasures: "Estimated adult prevalence of prior stroke in the selected geography.",
    currentPrototypeDefinition: "Synthetic demonstration value only. It is not calculated from real CDC PLACES, claims, EHR, or survey data.",
    futureSourceDefinitionRequirement: chronicDiseaseSourceRequirement,
    denominatorOrBasis: "Percent of adults in the source-defined geography and age group.",
    planningRelevance: "Supports community risk context, EMS demand planning, stroke-network review, rehabilitation access review, prevention outreach, and continuity planning.",
    knownLimitations: "Population-level estimates can be affected by survey methods, modeling assumptions, geography size, and release lag. They do not measure acute stroke incidence, last-known-well times, thrombectomy eligibility, or live stroke-center status.",
    syntheticDataCaveat: syntheticCaveat,
    doNotInfer: chronicDiseaseDoNotInfer,
  },
  poor_mental_health: {
    metricId: "poor_mental_health",
    label: OVERLAY_LABELS.poor_mental_health,
    shortLabel: "Mental health",
    whatThisMeasures: "Estimated share of adults reporting frequent poor mental-health days or a similar source-defined measure.",
    currentPrototypeDefinition: "Synthetic demonstration value only. It is not calculated from real CDC PLACES, SAMHSA, claims, EHR, or survey data.",
    futureSourceDefinitionRequirement: "Future real values may come from CDC PLACES or similar public health estimates and must show the exact measure, lookback period, denominator, geography level, release date, and limitations.",
    denominatorOrBasis: "Percent of adults in the source-defined geography and survey or modeled population.",
    planningRelevance: "Supports community risk context, EMS demand planning, behavioral-health access review, crisis planning, follow-up resource mapping, and continuity planning.",
    knownLimitations: chronicDiseaseLimitations,
    syntheticDataCaveat: syntheticCaveat,
    doNotInfer: chronicDiseaseDoNotInfer,
  },
  social_vulnerability: {
    metricId: "social_vulnerability",
    label: OVERLAY_LABELS.social_vulnerability,
    shortLabel: "SVI",
    whatThisMeasures: "A relative vulnerability index comparing community social factors across geographies.",
    currentPrototypeDefinition: "Synthetic demonstration value only. No real CDC/ATSDR SVI file or theme score is connected.",
    futureSourceDefinitionRequirement: "Future real SVI display must show the SVI release, geography level, percentile direction, themes or variables included, and limitations.",
    denominatorOrBasis: "An index or percentile-style relative score for a geography, not a percent of people and not a clinical measure.",
    planningRelevance: "Higher vulnerability may suggest greater challenges with preparedness, evacuation, access, communication, continuity, or recovery.",
    knownLimitations: "Composite scores can hide which factor is driving vulnerability and can lag current local conditions.",
    syntheticDataCaveat: syntheticCaveat,
    doNotInfer: "Do not treat SVI as a clinical-risk score, danger score, crime score, individual risk score, or patient triage tool.",
  },
  rurality: {
    metricId: "rurality",
    label: OVERLAY_LABELS.rurality,
    shortLabel: "Rurality",
    whatThisMeasures: "A planning-oriented classification of how rural or urban the selected geography is.",
    currentPrototypeDefinition: "Synthetic demonstration value only. No real rurality classification is connected.",
    futureSourceDefinitionRequirement: "Future real classification may use RUCA, RUCC, Census, HRSA, or another public rurality definition. The exact classification system must be shown when real data are connected.",
    denominatorOrBasis: "A geography-level classification or score, not a percent of residents.",
    planningRelevance: "Supports planning for transport time, facility scarcity, specialty access, workforce constraints, mutual aid, and access planning.",
    knownLimitations: "Rurality classifications can lag development and may not reflect local travel barriers.",
    syntheticDataCaveat: syntheticCaveat,
    doNotInfer: "Do not infer road conditions, weather, EMS availability, ambulance response time, hospital capability, or current resource status.",
  },
};

export function getPopulationMetricDefinition(metricId: OverlayMetricId) {
  return populationMetricDefinitions[metricId];
}
