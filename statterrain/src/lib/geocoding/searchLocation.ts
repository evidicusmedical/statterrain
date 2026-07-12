import { demoRegion, type SearchLocation } from "@/data/demo-region";
import { resolveStateFromCoordinates } from "@/lib/geography/resolveStateFromCoordinates";
import { parseStateFromText, normalizeStateCode } from "@/lib/geography/stateCodes";
import type { PlanningLocation } from "@/types/planningLocation";
import { parseCoordinateSearch } from "@/lib/geocoding/coordinates";
import { classifyGeocodeSearchQuery } from "@/lib/geocoding/searchStrategy";

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
  | "place"
  | "coordinates"
  | "map-click";
export interface SelectedLocation extends SearchLocation {
  planningLocation: PlanningLocation;
  query: string;
  matchType: LocationMatchType;
  source: "U.S. Census Bureau" | "U.S. Census Geocoder" | "StatTerrain demo" | "Manual coordinates" | "Map click";
  confidence: "exact" | "top-match" | "unavailable";
  isDemoRegion: boolean;
  searchedAt: string;
  status: LocationSearchStatus;
  state?: string;
  sessionOnly: true;
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
  if (/^[A-Za-z]{2}$/.test(q) || parseStateFromText(q) === q.toUpperCase()) return "state";
  if (/\d/.test(q)) return "address";
  if (/,/.test(q)) return "city";
  return "place";
}
function kindFor(matchType: LocationMatchType): SearchLocation["kind"] {
  return matchType === "state" || matchType === "place" || matchType === "coordinates" || matchType === "map-click" ? "city" : matchType;
}
export function isInDemoRegion(lat: number, lng: number): boolean {
  return (
    Math.abs(lat - demoRegion.centerLat) <= 0.35 &&
    Math.abs(lng - demoRegion.centerLng) <= 0.45
  );
}

export function buildManualCoordinateLocation(lat: number, lng: number, query: string, source: "Manual coordinates" | "Map click" = "Manual coordinates"): SelectedLocation {
  const resolvedState = resolveStateFromCoordinates(lat, lng) ?? parseStateFromText(query);
  const label = source === "Map click" ? `Map point: ${lat.toFixed(4)}, ${lng.toFixed(4)}` : `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
  return {
    id: `${source === "Map click" ? "map-click" : "manual-coordinates"}-${Date.now()}`,
    label,
    kind: "city",
    lat,
    lng,
    regionId: isInDemoRegion(lat, lng) ? demoRegion.id : "searched-us-location",
    query,
    matchType: source === "Map click" ? "map-click" : "coordinates",
    source,
    confidence: "exact",
    isDemoRegion: isInDemoRegion(lat, lng),
    searchedAt: new Date().toISOString(),
    status: "found",
    sessionOnly: true,
    state: resolvedState ?? undefined,
    planningLocation: {
      latitude: lat,
      longitude: lng,
      displayLabel: label,
      inputMethod: source === "Map click" ? "map-click" : "coordinate-search",
      resolvedAt: new Date().toISOString(),
      searchQuery: query,
      state: resolvedState ?? undefined,
      searchStrategy: source === "Map click" ? "map-click" : "coordinates",
      resolvedGeographyType: source === "Map click" ? "map-point" : "coordinate",
      source,
    },
  };
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
      message: "Unable to complete search",
      matchCount: 0,
    };
  const parsedCoordinates = parseCoordinateSearch(clean);
  if (parsedCoordinates === "invalid") {
    return { status: "invalid-input", location: null, message: "Invalid coordinates", matchCount: 0 };
  }
  if (parsedCoordinates) {
    const location = buildManualCoordinateLocation(parsedCoordinates.lat, parsedCoordinates.lng, clean);
    return { status: "found", location, message: `Planning center set to ${location.label}. Session-only; not stored.`, matchCount: 1 };
  }
  const params = new URLSearchParams({ q: clean });
  let response: Response;
  try {
    response = await fetcher(`/api/geocode?${params.toString()}`, { cache: "no-store" } as RequestInit);
  } catch {
    return { status: "network-error", location: null, message: "Search service unavailable", matchCount: 0 };
  }
  let json: any;
  try {
    json = await response.json();
  } catch {
    return { status: "geocoder-unavailable", location: null, message: "Unable to complete search", matchCount: 0 };
  }
  if (!response.ok || (json?.status !== "found" && json?.status !== "multiple-matches")) {
    const status = json?.status === "no-match" ? "no-match" : json?.status === "invalid-input" || json?.status === "unsupported-query" ? "invalid-input" : "geocoder-unavailable";
    const message = json?.message ?? (status === "no-match" ? "No matching location found" : status === "invalid-input" ? "Unable to complete search" : "Search service unavailable");
    return { status, location: null, message, matchCount: 0 };
  }
  const matches = json?.matches ?? [];
  if (!Array.isArray(matches) || matches.length === 0)
    return {
      status: "no-match",
      location: null,
      message: "No match found. Try a ZIP code, city/state, coordinates, or full address.",
      matchCount: 0,
    };
  const top = matches[0];
  const lat = Number(top?.latitude);
  const lng = Number(top?.longitude);
  if (!Number.isFinite(lat) || !Number.isFinite(lng))
    return {
      status: "geocoder-unavailable",
      location: null,
      message: "Geocoder unavailable. Try again later.",
      matchCount: matches.length,
    };
  const status: LocationSearchStatus =
    matches.length > 1 ? "multiple-matches-top-used" : "found";
  const label = String(top.label ?? clean);
  const routeStrategy = json?.strategy ?? classifyGeocodeSearchQuery(clean).strategy;
  const matchType = top?.geographyType === "place" ? "city" : top?.geographyType === "zip" ? "zip" : inferMatchType(clean);
  const structuredState = normalizeStateCode(top?.state);
  const resolvedState = structuredState ?? resolveStateFromCoordinates(lat, lng) ?? parseStateFromText(`${label} ${clean}`);
  const inputMethod = matchType === "address" ? "address-search" : matchType === "coordinates" ? "coordinate-search" : "place-search";
  const location: SelectedLocation = {
    id: `census-${Date.now()}`,
    label,
    kind: kindFor(matchType),
    lat,
    lng,
    regionId: isInDemoRegion(lat, lng) ? demoRegion.id : "searched-us-location",
    query: clean,
    matchType,
    source: top?.source === "U.S. Census Bureau" ? "U.S. Census Bureau" : "U.S. Census Geocoder",
    confidence: matches.length > 1 ? "top-match" : "exact",
    isDemoRegion: isInDemoRegion(lat, lng),
    searchedAt: new Date().toISOString(),
    status,
    sessionOnly: true,
    state: resolvedState ?? undefined,
    planningLocation: {
      latitude: lat,
      longitude: lng,
      displayLabel: label,
      inputMethod,
      resolvedAt: new Date().toISOString(),
      searchQuery: clean,
      state: resolvedState ?? undefined,
      searchStrategy: routeStrategy === "city-state" || routeStrategy === "zip" || routeStrategy === "street-address" ? routeStrategy : matchType === "address" ? "street-address" : matchType === "zip" ? "zip" : "city-state",
      resolvedGeographyType: top?.geographyType ?? (matchType === "address" ? "address" : matchType === "zip" ? "zip" : "place"),
      resolvedGeographyId: top?.geographyId ?? undefined,
      zip: top?.zip ?? undefined,
      source: top?.source ?? "U.S. Census Bureau",
      limitations: Array.isArray(top?.limitations) ? top.limitations : [],
    },
  };
  return {
    status,
    location,
    message: matchType === "address" ? "Address found" : matchType === "zip" ? "ZIP area found" : matchType === "city" || matchType === "place" ? "City found" : "Location found",
    matchCount: matches.length,
  };
}
