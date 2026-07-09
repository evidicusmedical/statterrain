export type DataMode = "synthetic-demo" | "real-public-data" | "mixed" | "unavailable" | "not-yet-ingested";
export type DataConfidence = "synthetic" | "source-supported" | "limited" | "stale" | "unavailable" | "unknown";
export type FreshnessStatus = "current" | "recent" | "stale" | "unknown" | "not-yet-ingested";
export type ValidationStatus = "pass" | "warn" | "fail" | "not-run";
export type SourceAccessPattern = "TBD" | "manual-download" | "api" | "bulk-file" | "web-page";
export type AutomationStatus = "not-started" | "manual-planned" | "manual-ready" | "scheduled-planned" | "scheduled-active" | "disabled";
export type RefreshMethod = "manual-planned" | "manual" | "scheduled" | "not-applicable";
export type SyntheticRealStatus = "synthetic" | "real" | "mixed" | "unavailable";

export interface PublicDataSource {
  id: string; name: string; agency: string; sourceType: "official-public-data" | string; status: "planned" | "inactive" | "active";
  usedInCurrentApp: boolean; dataMode: DataMode; expectedUse: string; allowedUse: string; notAllowedUse: string;
  sourceAccessPattern: SourceAccessPattern | "TBD"; refreshMethod: RefreshMethod; refreshCadence: string; automationStatus: AutomationStatus;
  plannedRefreshCadence: string; lastRefreshAttempt: string | null; lastSuccessfulRefresh: string | null; lastValidationStatus: ValidationStatus;
  lastKnownGoodAvailable: boolean; sourceUrl: string | null; limitations: string[];
}

export interface DatasetMetadata {
  datasetId: string; sourceId: string; sourceName: string; agency: string; sourceType: string; dataMode: DataMode;
  syntheticRealStatus: SyntheticRealStatus; retrievalTimestamp: string | null; sourceReleaseDate?: string | null;
  geographyCovered: string[]; recordCount: number; checksum?: string | null; confidence: DataConfidence; freshness: FreshnessStatus;
  limitations: string[]; allowedUses: string[]; prohibitedUses: string[];
}
export interface RawSnapshotMetadata extends DatasetMetadata { inputSnapshotPath: string; rawSnapshotMetadataPath?: string; }
export interface NormalizedDatasetMetadata extends DatasetMetadata { inputSnapshotPath: string; normalizedOutputPath: string; validationStatus: ValidationStatus; validationReportPath?: string; warnings: string[]; errors: string[]; }
export interface GeneratedDatasetMetadata extends NormalizedDatasetMetadata { generatedAppDataPath: string; generatedFilePath: string; lastKnownGoodFallbackPath?: string | null; lastKnownGoodStatus: LastKnownGoodStatus; safeToDisplay: boolean; }
export interface LastKnownGoodStatus { available: boolean; active: boolean; path: string | null; reason?: string; generatedAt?: string | null; sourceReleaseDate?: string | null; }
export interface ValidationIssue { severity: "warning" | "error"; code: string; message: string; recordId?: string; field?: string; }
export interface ValidationReport { sourceId: string; datasetId: string; validationRunTimestamp: string; inputSnapshotPath: string; outputGeneratedPath: string; status: ValidationStatus; recordCount: number; duplicateCount: number; missingRequiredFieldCount: number; invalidCoordinateCount: number; invalidContactFieldCount: number; unsupportedCapabilityFieldCount: number; anomalyCount: number; warnings: ValidationIssue[]; errors: ValidationIssue[]; recommendation: string; publishRecommendation: string; shouldPublishGeneratedData: boolean; shouldUseLastKnownGoodFallback: boolean; }
export interface RefreshAttempt { sourceId: string; datasetId: string; refreshAttemptTimestamp: string; refreshMethod: RefreshMethod; automationStatus: AutomationStatus; status: ValidationStatus; }
export interface RefreshReport extends RefreshAttempt { snapshotPath: string | null; normalizedPath: string | null; generatedPath: string | null; validationReportPath: string | null; lastKnownGoodPath: string | null; summary: string; warnings: string[]; errors: string[]; nextRecommendedAction: string; }
export interface GeneratedDatasetContract<TRecord = unknown> { schemaVersion: string; metadata: GeneratedDatasetMetadata; records: TRecord[]; }
