import type { AutomationStatus, RefreshMethod, ValidationIssue, ValidationStatus } from "@/types/publicData";

export interface PublicDataValidationReport {
  sourceId: string; datasetId: string; validationRunTimestamp: string; inputSnapshotPath: string; outputGeneratedPath: string;
  status: ValidationStatus; recordCount: number; duplicateCount: number; missingRequiredFieldCount: number; invalidCoordinateCount: number;
  invalidContactFieldCount: number; unsupportedCapabilityFieldCount: number; anomalyCount: number; warnings: ValidationIssue[]; errors: ValidationIssue[];
  recommendation: string; publishRecommendation: string; shouldPublishGeneratedData: boolean; shouldUseLastKnownGoodFallback: boolean;
}
export interface PublicDataRefreshReport {
  sourceId: string; datasetId: string; refreshAttemptTimestamp: string; refreshMethod: RefreshMethod; automationStatus: AutomationStatus;
  snapshotPath: string | null; normalizedPath: string | null; generatedPath: string | null; validationReportPath: string | null; lastKnownGoodPath: string | null;
  status: ValidationStatus; summary: string; warnings: string[]; errors: string[]; nextRecommendedAction: string;
}
export const PUBLIC_DATA_REPORT_SCHEMA_VERSION = "public-data-report-v0.2.0";
