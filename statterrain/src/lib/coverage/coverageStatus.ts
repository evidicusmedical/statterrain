import sourceCoverageManifest from "../../../data/generated/source-coverage-manifest.json";
import type { Facility } from "@/types/facility";
import type {
  LocationSearchStatus,
  SelectedLocation,
} from "@/lib/geocoding/searchLocation";

export interface SourceCoverageSummary {
  sourceId: string;
  label: string;
  nationalCoverageStatus: string;
  currentArtifactStatus: string;
  recordCount: number | null;
  mapReadyRecordCount: number | null;
  previewEligibleRecordCount: number;
  usedInCurrentApp: boolean;
  safeToDisplay: boolean;
}

export interface CoverageStatus {
  syntheticSuppressed: boolean;
  headline: string;
  messages: string[];
  sourceSummaries: SourceCoverageSummary[];
  nationalCoverageComplete: boolean;
}

type ManifestSource = (typeof sourceCoverageManifest.sources)[number];

function sourceLabel(source: ManifestSource): string {
  if (source.sourceId === "cms-hospital-general-information") return "CMS public hospital records";
  if (source.sourceId === "synthetic-demo") return "Synthetic demonstration records";
  return `${source.sourceName}: ${source.nationalCoverageStatus}`;
}

export function getSourceCoverageSummaries(): SourceCoverageSummary[] {
  return sourceCoverageManifest.sources.map((source) => ({
    sourceId: source.sourceId,
    label: sourceLabel(source),
    nationalCoverageStatus: source.nationalCoverageStatus,
    currentArtifactStatus: source.currentArtifactStatus,
    recordCount: source.recordCount,
    mapReadyRecordCount: source.mapReadyRecordCount,
    previewEligibleRecordCount: source.previewEligibleRecordCount,
    usedInCurrentApp: source.usedInCurrentApp,
    safeToDisplay: source.safeToDisplay,
  }));
}

export function buildCoverageStatus(args: {
  selectedLocation: SelectedLocation | null;
  radiusMiles: number;
  publicPreviewEnabled: boolean;
  previewFacilitiesInRadius: Facility[];
  searchStatus?: LocationSearchStatus;
}): CoverageStatus {
  const outsideDemo = Boolean(
    args.selectedLocation && !args.selectedLocation.isDemoRegion,
  );
  const sourceSummaries = getSourceCoverageSummaries();
  const messages: string[] = [];
  if (args.searchStatus === "geocoder-unavailable") messages.push("Geocoder unavailable. Coverage status could not be refreshed.");
  if (args.previewFacilitiesInRadius.length > 0 && args.publicPreviewEnabled) messages.push("Results include available mapped CMS hospital records within the selected straight-line radius.");
  else messages.push("No mapped hospital records were found within the selected radius.", "No matching mapped records does not establish that no hospital exists in the area.");
  return {
    syntheticSuppressed: outsideDemo,
    headline: args.previewFacilitiesInRadius.length ? "CMS public hospital records" : "No mapped hospital records",
    messages,
    sourceSummaries,
    nationalCoverageComplete: sourceCoverageManifest.nationalCoverageComplete,
  };
}
