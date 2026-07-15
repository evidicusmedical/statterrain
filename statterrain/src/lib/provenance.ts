import cmsNationalManifest from "../../data/generated/cms-hospitals-national/manifest.json";
import cmsGenerated from "../../data/generated/cms-hospitals.generated.json";
import acsManifest from "../../data/generated/acs-county-population-national/manifest.json";
import boundaryManifest from "../../data/generated/county-boundaries/manifest.json";
import sourceRegistry from "../../data/sources/source-registry.json";
import type { Facility } from "@/types/facility";

export type HospitalProvenanceClassification = "cms-only" | "synthetic-only" | "mixed" | "none";

export interface UiSourceMetadata {
  sourceOrganization: string;
  datasetTitle: string;
  datasetIdentifier: string;
  officialUrl: string;
  releaseLabel: string | null;
  reportingPeriod: string | null;
  estimatePeriod: string | null;
  retrievedAt: string | null;
  builtAt: string | null;
  coverageStatus: string | null;
}

function registrySource(id: string): any | null {
  return (sourceRegistry as any).sources?.find((source: any) => source.id === id || source.sourceId === id) ?? null;
}

const cmsRegistry = registrySource("cms-hospital-general-information");
const acsRegistry = registrySource("census-acs5-county-population-2024");

export const hospitalSourceMetadata: UiSourceMetadata = {
  sourceOrganization: (cmsGenerated as any).metadata?.sourceAgency ?? "Centers for Medicare & Medicaid Services",
  datasetTitle: (cmsNationalManifest as any).sourceName ?? (cmsGenerated as any).metadata?.sourceName ?? "CMS Hospital General Information",
  datasetIdentifier: (cmsNationalManifest as any).sourceDatasetId ?? (cmsGenerated as any).metadata?.sourceId ?? "xubh-q36u",
  officialUrl: cmsRegistry?.sourceUrl ?? "https://data.cms.gov/provider-data/dataset/xubh-q36u",
  releaseLabel: (cmsNationalManifest as any).sourceReleaseDate ?? null,
  reportingPeriod: null,
  estimatePeriod: null,
  retrievedAt: (cmsNationalManifest as any).retrievedAt ?? (cmsGenerated as any).metadata?.retrievedAt ?? null,
  builtAt: (cmsNationalManifest as any).generatedAt ?? (cmsGenerated as any).metadata?.generatedAt ?? null,
  coverageStatus: (cmsNationalManifest as any).validationStatus ?? (cmsGenerated as any).metadata?.validationStatus ?? null,
};

export const acsSourceMetadata: UiSourceMetadata = {
  sourceOrganization: (acsManifest as any).source?.agency ?? acsRegistry?.agency ?? "U.S. Census Bureau",
  datasetTitle: (acsManifest as any).source?.dataset ?? acsRegistry?.datasetName ?? "American Community Survey 5-Year Estimates",
  datasetIdentifier: (acsManifest as any).source?.sourceId ?? acsRegistry?.id ?? "census-acs5-county-population-2024",
  officialUrl: (acsManifest as any).source?.sourceUrl ?? acsRegistry?.sourceUrl ?? "https://api.census.gov/data/2024/acs/acs5",
  releaseLabel: (acsManifest as any).release ?? "2024 ACS 5-year",
  reportingPeriod: null,
  estimatePeriod: (acsManifest as any).estimatePeriod ?? acsRegistry?.estimatePeriod ?? "2020-2024",
  retrievedAt: (acsManifest as any).retrievedAt ?? null,
  builtAt: (acsManifest as any).generationTimestamp ?? null,
  coverageStatus: (acsManifest as any).validationStatus ?? null,
};

export const boundarySourceMetadata = {
  sourceOrganization: "U.S. Census Bureau",
  datasetTitle: "County boundary static artifacts",
  datasetIdentifier: (boundaryManifest as any).schemaVersion ?? "county-boundaries",
  officialUrl: "https://www.census.gov/geographies/mapping-files/time-series/geo/tiger-line-file.html",
  releaseLabel: (boundaryManifest as any).boundaryVintage ?? null,
  retrievedAt: (boundaryManifest as any).generatedAt ?? null,
  builtAt: (boundaryManifest as any).generatedAt ?? null,
  coverageStatus: (boundaryManifest as any).coverageStatus ?? null,
};

export function classifyHospitalRecords(facilities: Facility[]) {
  const hospitals = facilities.filter((f) => f.facilityType === "hospital" || f.facilityType === "critical_access_hospital");
  const cmsCount = hospitals.filter((f) => !f.isSynthetic && (f.sourceIds.includes("cms-hospital-general-information") || f.sourceName?.includes("CMS"))).length;
  const syntheticCount = hospitals.filter((f) => f.isSynthetic).length;
  const classification: HospitalProvenanceClassification = cmsCount > 0 && syntheticCount > 0 ? "mixed" : cmsCount > 0 ? "cms-only" : syntheticCount > 0 ? "synthetic-only" : "none";
  return { classification, hospitalCount: hospitals.length, cmsCount, syntheticCount };
}

export function formatSourceDate(value: string | null | undefined) {
  if (!value) return "Not reported";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : date.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
}
