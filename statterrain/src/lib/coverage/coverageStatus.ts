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
  if (source.sourceId === "cms-hospital-general-information")
    return `${source.sourceName}: ${source.previewEligibleRecordCount} preview-ready records, bounded sample, not national`;
  if (source.sourceId === "cms-dialysis-facilities")
    return `${source.sourceName}: fixture-only, not map-ready`;
  if (source.sourceId === "synthetic-demo")
    return `${source.sourceName}: local demo only, not real public data`;
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
  if (args.searchStatus === "geocoder-unavailable")
    messages.push(
      "Geocoder unavailable. Coverage status could not be refreshed.",
    );
  if (!args.selectedLocation)
    messages.push(
      "Synthetic demo region active. Default map remains synthetic demonstration data.",
    );
  if (outsideDemo)
    messages.push(
      "Synthetic demo data is not representative of this searched location.",
    );
  if (args.previewFacilitiesInRadius.length > 0 && args.publicPreviewEnabled)
    messages.push(
      "Showing CMS hospital public-data preview records within selected radius; this is a bounded sample and not national coverage.",
    );
  else if (args.previewFacilitiesInRadius.length > 0)
    messages.push(
      "CMS hospital preview records are available within this radius. Enable preview to inspect them; the sample is not national coverage.",
    );
  else if (outsideDemo)
    messages.push(
      "No map-ready public-data preview records are currently loaded for this area. National coverage is still being built.",
    );
  messages.push(
    "CMS hospitals: bounded 5-record preview sample, not national coverage.",
  );
  messages.push(
    "CMS dialysis source scaffold exists, but records are fixture-only/not geocoded and are not map-ready.",
  );
  messages.push(
    "Synthetic demo data are local demonstration data only, not real public data.",
  );
  messages.push(
    "National facility coverage is not complete yet; source coverage for many areas is not yet loaded.",
  );
  messages.push(
    `Selected location coverage depends on map-ready records within the selected ${args.radiusMiles}-mile straight-line planning radius.`,
  );
  return {
    syntheticSuppressed: outsideDemo,
    headline: outsideDemo
      ? "Searched location outside synthetic demo region"
      : "Synthetic demo region active",
    messages,
    sourceSummaries,
    nationalCoverageComplete: sourceCoverageManifest.nationalCoverageComplete,
  };
}
