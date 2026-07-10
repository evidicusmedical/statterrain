import { demoRegion, type SearchLocation } from "@/data/demo-region";

export type LocationSearchStatus =
  | "idle"
  | "searching"
  | "found"
  | "multiple-matches-top-used"
  | "no-match"
  | "geocoder-unavailable"
  | "network-error"
  | "invalid-input";
export type LocationMatchType =
  | "address"
  | "zip"
  | "city"
  | "county"
  | "state"
  | "place";
export interface SelectedLocation extends SearchLocation {
  query: string;
  matchType: LocationMatchType;
  source: "U.S. Census Geocoder" | "StatTerrain demo";
  confidence: "exact" | "top-match" | "unavailable";
  isDemoRegion: boolean;
  searchedAt: string;
  status: LocationSearchStatus;
}
export interface LocationSearchResult {
  status: LocationSearchStatus;
  location: SelectedLocation | null;
  message: string;
  matchCount: number;
}
function inferMatchType(query: string): LocationMatchType {
  const q = query.trim();
  if (/^\d{5}(?:-\d{4})?$/.test(q)) return "zip";
  if (/county/i.test(q)) return "county";
  if (/^[A-Za-z]{2}$/.test(q)) return "state";
  if (/\d/.test(q)) return "address";
  if (/,/.test(q)) return "city";
  return "place";
}
function kindFor(matchType: LocationMatchType): SearchLocation["kind"] {
  return matchType === "state" || matchType === "place" ? "city" : matchType;
}
export function isInDemoRegion(lat: number, lng: number): boolean {
  return (
    Math.abs(lat - demoRegion.centerLat) <= 0.35 &&
    Math.abs(lng - demoRegion.centerLng) <= 0.45
  );
}
export async function searchLocation(
  query: string,
  fetcher: typeof fetch = fetch,
): Promise<LocationSearchResult> {
  const clean = query.trim();
  if (!clean)
    return {
      status: "invalid-input",
      location: null,
      message: "Enter a U.S. address, ZIP code, city/state, or state.",
      matchCount: 0,
    };
  const params = new URLSearchParams({
    address: clean,
    benchmark: "Public_AR_Current",
    format: "json",
  });
  let response: Response;
  try {
    response = await fetcher(
      `https://geocoding.geo.census.gov/geocoder/locations/onelineaddress?${params.toString()}`,
    );
  } catch {
    return {
      status: "network-error",
      location: null,
      message: "Network unavailable. Current map view unchanged.",
      matchCount: 0,
    };
  }
  if (!response.ok)
    return {
      status: "geocoder-unavailable",
      location: null,
      message: "Geocoder unavailable. Try again later.",
      matchCount: 0,
    };
  let json: any;
  try {
    json = await response.json();
  } catch {
    return {
      status: "geocoder-unavailable",
      location: null,
      message: "Geocoder unavailable. Try again later.",
      matchCount: 0,
    };
  }
  const matches = json?.result?.addressMatches ?? [];
  if (!Array.isArray(matches) || matches.length === 0)
    return {
      status: "no-match",
      location: null,
      message: "No match found. Try a ZIP code, city/state, or full address.",
      matchCount: 0,
    };
  const top = matches[0];
  const lat = Number(top?.coordinates?.y);
  const lng = Number(top?.coordinates?.x);
  if (!Number.isFinite(lat) || !Number.isFinite(lng))
    return {
      status: "geocoder-unavailable",
      location: null,
      message: "Geocoder unavailable. Try again later.",
      matchCount: matches.length,
    };
  const status: LocationSearchStatus =
    matches.length > 1 ? "multiple-matches-top-used" : "found";
  const label = String(top.matchedAddress ?? clean);
  const matchType = inferMatchType(clean);
  const location: SelectedLocation = {
    id: `census-${Date.now()}`,
    label,
    kind: kindFor(matchType),
    lat,
    lng,
    regionId: isInDemoRegion(lat, lng) ? demoRegion.id : "searched-us-location",
    query: clean,
    matchType,
    source: "U.S. Census Geocoder",
    confidence: matches.length > 1 ? "top-match" : "exact",
    isDemoRegion: isInDemoRegion(lat, lng),
    searchedAt: new Date().toISOString(),
    status,
  };
  return {
    status,
    location,
    message:
      status === "found"
        ? `Location found: ${label}`
        : `Top geocoder match used: ${label}`,
    matchCount: matches.length,
  };
}
