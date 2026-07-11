import cmsHospitalsGenerated from "../../../data/generated/cms-hospitals.generated.json";
import cmsHospitalsGeocodingSummary from "../../../data/reports/cms-hospitals-geocoding-summary-v0.2.7.json";
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
  retrievedAt?: string | null;
  geocodingStatus?: string | null;
  geographyJoinStatus?: string | null;
  geocodingConfidence?: string | null;
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
    previewEligibility?: string;
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
  geocodingRunDate: string | null;
  matchedCount: number;
  joinedCount: number;
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
  joinedCount?: number;
  recordCount?: number;
  generatedAt?: string;
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
  const recordCount = metadata.recordCount ?? cmsContract.records.length;
  const contractSafeToDisplay = isGeneratedDataSafeToDisplay({
    metadata: {
      ...metadata,
      validationStatus: metadata.validationStatus,
      recordCount,
      lastKnownGoodStatus: metadata.lastKnownGoodStatus ?? {
        active: metadata.fallbackActive === true,
        available: metadata.lastKnownGood?.exists === true,
        path: metadata.lastKnownGood?.path ?? null,
      },
    },
    records: cmsContract.records,
  } as never);
  const safeByContract =
    contractSafeToDisplay ||
    (metadata.safeToDisplay === true &&
      metadata.validationStatus === "warn" &&
      metadata.previewEligibility === "eligible-public-data-preview" &&
      (metadata.recordCount ?? cmsContract.records.length) === cmsContract.records.length);
  const coordinatesReady = hasUsableCoordinates(cmsContract.records);
  const matchedCount = geocodingSummary.matchedCount ?? 0;
  const joinedCount = geocodingSummary.joinedCount ?? 0;
  const recordsMatched = cmsContract.records.every((record) => record.geocodingStatus === "matched");
  const recordsJoined = cmsContract.records.every((record) => record.geographyJoinStatus === "joined");
  const geocodingComplete =
    geocodingSummary.mode === "live-census" &&
    geocodingSummary.externalCallsEnabled === true &&
    matchedCount === cmsContract.records.length &&
    joinedCount === cmsContract.records.length &&
    recordsMatched &&
    recordsJoined;
  const dryRunOnly =
    geocodingSummary.mode === "dry-run" ||
    geocodingSummary.externalCallsEnabled === false;
  const canPreviewOnMap =
    safeByContract &&
    !fixtureMode &&
    metadata.dataMode === "real-public-data" &&
    coordinatesReady &&
    geocodingComplete &&
    !dryRunOnly;

  let previewStatus: PublicDataPreviewStatus = "available";
  let previewBlockReason =
    "Validation-safe real public CMS hospital records are available for the active map layer.";
  if (fixtureMode) {
    previewStatus = "blocked-fixture";
    previewBlockReason =
      "The generated CMS hospital artifact is a synthetic fixture and cannot be used as a real public-data map layer.";
  } else if (dryRunOnly && metadata.dataMode === "real-public-data") {
    previewStatus = "blocked-dry-run";
    previewBlockReason =
      "geocoding was dry-run only and usable map coordinates are not available.";
  } else if (!safeByContract) {
    previewStatus = recordCount ? "blocked-validation" : "unavailable";
    previewBlockReason =
      "The generated CMS hospital artifact is not validation-safe for map display.";
  } else if (!coordinatesReady) {
    previewStatus = "blocked-geography";
    previewBlockReason =
      "live geocoding/geography validation is not complete for the real CMS hospital artifact.";
  }

  const artifactStatusLabel = fixtureMode
    ? "Fixture/test artifacts only — not real public data."
    : metadata.dataMode === "real-public-data"
      ? "Real public-data source artifact available."
      : "No real public-data refresh artifact is available.";
  const geocodingDisplayStatus = canPreviewOnMap
    ? `Live Census Geocoder, ${matchedCount} matched, ${joinedCount} joined`
    : dryRunOnly
      ? "dry-run / not map-ready"
      : coordinatesReady
        ? "live geocoding coordinates present; validation not complete"
        : (metadata.geocodingStatus ?? "not map-ready");

  return {
    datasetId: metadata.datasetId ?? "cms-hospitals",
    sourceName: metadata.sourceName ?? "CMS Hospital General Information",
    sourceAgency:
      metadata.sourceAgency ?? "Centers for Medicare & Medicaid Services",
    dataMode: metadata.dataMode ?? "unavailable",
    fixtureMode,
    usedInCurrentApp: metadata.usedInCurrentApp === true,
    recordCount,
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
    geocodingRunDate: geocodingSummary.generatedAt ?? null,
    matchedCount,
    joinedCount,
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
    criticalAccess: record.criticalAccessHospital === true,
    capabilities: [],
    sourceIds: [record.sourceId ?? summary.datasetId],
    freshness: "unknown",
    confidence: "medium",
    limitations: [
      "Public-data preview record from CMS Hospital General Information.",
      "Source: CMS Hospital General Information; Geocoder: US Census Geocoder / Census Geocoder.",
      record.geocodingConfidence ? `Geocoding confidence: ${record.geocodingConfidence}.` : "Geocoding confidence: not reported.",
      `Retrieved date: ${record.retrievedAt ?? summary.retrievedAt ?? "not reported"}.`,
      `Geocoding run date: ${summary.geocodingRunDate ?? "not reported"}.`,
      `Validation status: ${summary.validationStatus}.`,
      "Preview-only public facility listing; main map remains synthetic by default.",
      "Does not indicate live operating status, diversion, bed availability, transfer capability, specialty designation, or clinical readiness.",
      ...summary.limitations,
    ],
    isSynthetic: false,
  })) as unknown as Facility[];
}
