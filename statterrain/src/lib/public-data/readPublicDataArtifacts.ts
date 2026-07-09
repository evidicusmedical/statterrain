import cmsHospitalsGenerated from "../../../data/generated/cms-hospitals.generated.json";
import cmsHospitalsGeocodingSummary from "../../../data/reports/cms-hospitals-geocoding-summary-v0.2.4.json";
import { isGeneratedDataSafeToDisplay } from "./generatedDataContract";
import type { Facility } from "@/types/facility";

type GeneratedCmsHospitalRecord = {
  sourceFacilityId?: string;
  facilityName?: string | null;
  facilityCategory?: string | null;
  hospitalType?: string | null;
  criticalAccessHospital?: boolean;
  address?: string | null;
  city?: string | null;
  state?: string | null;
  zip?: string | null;
  phone?: string | null;
  latitude?: number;
  longitude?: number;
  sourceId?: string | null;
  sourceName?: string | null;
  sourceAgency?: string | null;
  sourceRecordId?: string | null;
};

type GeneratedCmsHospitalContract = {
  metadata: {
    datasetId?: string;
    sourceId?: string | null;
    sourceName?: string | null;
    sourceAgency?: string | null;
    dataMode?: string;
    fixtureMode?: boolean;
    usedInCurrentApp?: boolean;
    previewLabelRequired?: boolean;
    recordCount?: number;
    retrievedAt?: string | null;
    sourceReleaseDate?: string | null;
    validationStatus?: string;
    validationReportPath?: string;
    rawSnapshotMetadataPath?: string;
    normalizedDatasetPath?: string;
    qualitySummaryPath?: string;
    geocodingInputPath?: string;
    geocodingResultPath?: string;
    geographyJoinPath?: string;
    geocodingSummaryPath?: string;
    geocodingStatus?: string;
    fallbackActive?: boolean;
    safeToDisplay?: boolean;
    limitations?: string[];
    allowedUses?: string[];
    prohibitedUses?: string[];
    lastKnownGood?: {
      exists?: boolean;
      path?: string;
      updatedThisRun?: boolean;
    };
    lastKnownGoodStatus?: {
      active?: boolean;
      available?: boolean;
      path?: string | null;
    };
  };
  records: GeneratedCmsHospitalRecord[];
};

export type PublicDataPreviewStatus =
  | "available"
  | "blocked-fixture"
  | "blocked-validation"
  | "blocked-geography"
  | "blocked-dry-run"
  | "unavailable";

export interface PublicDataArtifactSummary {
  datasetId: string;
  sourceName: string;
  sourceAgency: string;
  dataMode: string;
  fixtureMode: boolean;
  usedInCurrentApp: boolean;
  recordCount: number;
  retrievedAt: string | null;
  sourceReleaseDate: string | null;
  validationStatus: string;
  geocodingStatus: string;
  safeToDisplay: boolean;
  canPreviewOnMap: boolean;
  previewStatus: PublicDataPreviewStatus;
  previewBlockReason: string;
  artifactStatusLabel: string;
  currentMapDataLabel: string;
  geocodingDisplayStatus: string;
  artifactPaths: string[];
  limitations: string[];
  allowedUses: string[];
  prohibitedUses: string[];
}

const cmsContract =
  cmsHospitalsGenerated as unknown as GeneratedCmsHospitalContract;
const geocodingSummary = cmsHospitalsGeocodingSummary as {
  mode?: string;
  externalCallsEnabled?: boolean;
  matchedCount?: number;
  recordCount?: number;
};

function hasUsableCoordinates(records: GeneratedCmsHospitalRecord[]): boolean {
  return records.every(
    (record) =>
      typeof record.latitude === "number" &&
      Number.isFinite(record.latitude) &&
      typeof record.longitude === "number" &&
      Number.isFinite(record.longitude),
  );
}

export function getPublicDataArtifactSummary(): PublicDataArtifactSummary {
  const metadata = cmsContract.metadata;
  const fixtureMode =
    metadata.fixtureMode === true ||
    metadata.dataMode === "synthetic-test-fixture";
  const safeByContract = isGeneratedDataSafeToDisplay({
    metadata: {
      ...metadata,
      validationStatus: metadata.validationStatus,
      recordCount: metadata.recordCount ?? cmsContract.records.length,
      lastKnownGoodStatus: metadata.lastKnownGoodStatus ?? {
        active: metadata.fallbackActive === true,
        available: metadata.lastKnownGood?.exists === true,
        path: metadata.lastKnownGood?.path ?? null,
      },
    },
    records: cmsContract.records,
  } as never);
  const coordinatesReady = hasUsableCoordinates(cmsContract.records);
  const dryRunOnly =
    geocodingSummary.mode === "dry-run" ||
    geocodingSummary.externalCallsEnabled === false;
  const canPreviewOnMap =
    safeByContract &&
    !fixtureMode &&
    metadata.dataMode === "real-public-data" &&
    coordinatesReady &&
    !dryRunOnly;

  let previewStatus: PublicDataPreviewStatus = "available";
  let previewBlockReason =
    "Validation-safe real public CMS hospital records are available for explicitly labeled preview.";
  if (fixtureMode) {
    previewStatus = "blocked-fixture";
    previewBlockReason =
      "The generated CMS hospital artifact is a synthetic fixture and cannot be used as a real public-data map layer.";
  } else if (dryRunOnly && metadata.dataMode === "real-public-data") {
    previewStatus = "blocked-dry-run";
    previewBlockReason =
      "geocoding was dry-run only and usable map coordinates are not available.";
  } else if (!safeByContract) {
    previewStatus = metadata.recordCount ? "blocked-validation" : "unavailable";
    previewBlockReason =
      "The generated CMS hospital artifact is not validation-safe for preview.";
  } else if (!coordinatesReady) {
    previewStatus = "blocked-geography";
    previewBlockReason =
      "coordinates/geocoding are not complete for the real CMS hospital artifact.";
  }

  const artifactStatusLabel = fixtureMode
    ? "Fixture/test artifacts only — not real public data."
    : metadata.dataMode === "real-public-data"
      ? "Real public-data refresh artifact available for review."
      : "No real public-data refresh artifact is available.";
  const geocodingDisplayStatus = dryRunOnly
    ? "dry-run / not map-ready"
    : coordinatesReady
      ? "live geocoding validated / map-ready"
      : (metadata.geocodingStatus ?? "not map-ready");

  return {
    datasetId: metadata.datasetId ?? "cms-hospitals",
    sourceName: metadata.sourceName ?? "CMS Hospital General Information",
    sourceAgency:
      metadata.sourceAgency ?? "Centers for Medicare & Medicaid Services",
    dataMode: metadata.dataMode ?? "unavailable",
    fixtureMode,
    usedInCurrentApp: metadata.usedInCurrentApp === true,
    recordCount: metadata.recordCount ?? cmsContract.records.length,
    retrievedAt: metadata.retrievedAt ?? null,
    sourceReleaseDate: metadata.sourceReleaseDate ?? null,
    validationStatus: metadata.validationStatus ?? "not-run",
    geocodingStatus: metadata.geocodingStatus ?? "unknown",
    safeToDisplay: safeByContract,
    canPreviewOnMap,
    previewStatus,
    previewBlockReason,
    artifactStatusLabel,
    currentMapDataLabel: "Synthetic demonstration data.",
    geocodingDisplayStatus,
    artifactPaths: [
      "data/generated/cms-hospitals.generated.json",
      metadata.validationReportPath,
      metadata.rawSnapshotMetadataPath,
      metadata.normalizedDatasetPath,
      metadata.qualitySummaryPath,
      metadata.geocodingInputPath,
      metadata.geocodingResultPath,
      metadata.geographyJoinPath,
      metadata.geocodingSummaryPath,
    ].filter((path): path is string => Boolean(path)),
    limitations: metadata.limitations ?? [],
    allowedUses: metadata.allowedUses ?? [],
    prohibitedUses: metadata.prohibitedUses ?? [],
  };
}

export function getPreviewCmsHospitalFacilities(): Facility[] {
  const summary = getPublicDataArtifactSummary();
  if (!summary.canPreviewOnMap) return [];

  return cmsContract.records.map((record) => ({
    id: `cms-preview-${record.sourceFacilityId ?? record.sourceRecordId}`,
    name: record.facilityName ?? "Unnamed CMS hospital",
    facilityType: record.criticalAccessHospital
      ? "critical_access_hospital"
      : "hospital",
    lat: record.latitude as number,
    lng: record.longitude as number,
    address: [record.address, record.city, record.state, record.zip]
      .filter(Boolean)
      .join(", "),
    city: record.city,
    state: record.state,
    zip: record.zip,
    phone: record.phone,
    distanceMiles: 0,
    approxDriveTimeMinutes: 0,
    criticalAccess: record.criticalAccessHospital === true,
    capabilities: [],
    sourceIds: [record.sourceId ?? summary.datasetId],
    freshness: "unknown",
    confidence: "medium",
    limitations: [
      "Preview-only public facility listing; does not indicate live operating status, diversion, bed availability, transfer capability, specialty designation, or clinical readiness.",
      ...summary.limitations,
    ],
    isSynthetic: false,
  })) as unknown as Facility[];
}
