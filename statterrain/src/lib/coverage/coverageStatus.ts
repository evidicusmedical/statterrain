import type { Facility } from "@/types/facility";
import type {
  LocationSearchStatus,
  SelectedLocation,
} from "@/lib/geocoding/searchLocation";
export interface CoverageStatus {
  syntheticSuppressed: boolean;
  headline: string;
  messages: string[];
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
      "Showing CMS hospital public-data preview records within selected radius.",
    );
  else if (args.previewFacilitiesInRadius.length > 0)
    messages.push(
      "CMS hospital preview records are available within this radius. Enable preview to inspect them.",
    );
  else if (outsideDemo)
    messages.push(
      "No map-ready public-data preview records are currently loaded for this area. National coverage is still being built.",
    );
  messages.push(
    "CMS dialysis source scaffold exists, but records are fixture-only/not geocoded and are not map-ready.",
  );
  messages.push(
    "National facility coverage is not complete yet; source coverage for many areas is not yet loaded.",
  );
  return {
    syntheticSuppressed: outsideDemo,
    headline: outsideDemo
      ? "Searched location outside synthetic demo region"
      : "Synthetic demo region active",
    messages,
  };
}
