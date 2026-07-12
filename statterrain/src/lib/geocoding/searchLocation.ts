import { demoRegion, type SearchLocation } from "@/data/demo-region";
import { resolveStateFromCoordinates } from "@/lib/geography/resolveStateFromCoordinates";
import { parseStateFromText, normalizeStateCode } from "@/lib/geography/stateCodes";
import type { PlanningLocation } from "@/types/planningLocation";

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
  source: "U.S. Census Geocoder" | "StatTerrain demo" | "Manual coordinates" | "Map click";
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

function applyHemisphere(value: number, hemi?: string): number {
  if (!hemi) return value;
  return /[SW]/i.test(hemi) ? -Math.abs(value) : Math.abs(value);
}

export function parseCoordinateSearch(query: string): { lat: number; lng: number } | null | "invalid" {
  const normalized = query.trim().replace(/[()]/g, " ").replace(/°/g, " ");
  const explicit = normalized.match(/lat(?:itude)?\s*[:=]?\s*([+-]?\d+(?:\.\d+)?)\s*([NS])?\s*(?:[,;\s]+)?lon(?:gitude)?\s*[:=]?\s*([+-]?\d+(?:\.\d+)?)\s*([EW])?/i);
  const hemiPair = normalized.match(/([+-]?\d+(?:\.\d+)?)\s*([NS])\s*[,;\s]+([+-]?\d+(?:\.\d+)?)\s*([EW])/i);
  const plainPair = normalized.match(/^\s*([+-]?\d+(?:\.\d+)?)\s*(?:,|\s)\s*([+-]?\d+(?:\.\d+)?)\s*$/);
  let lat: number | null = null;
  let lng: number | null = null;
  if (explicit) {
    lat = applyHemisphere(Number(explicit[1]), explicit[2]);
    lng = applyHemisphere(Number(explicit[3]), explicit[4]);
  } else if (hemiPair) {
    lat = applyHemisphere(Number(hemiPair[1]), hemiPair[2]);
    lng = applyHemisphere(Number(hemiPair[3]), hemiPair[4]);
  } else if (plainPair) {
    lat = Number(plainPair[1]);
    lng = Number(plainPair[2]);
  } else {
    return null;
  }
  if (!Number.isFinite(lat) || !Number.isFinite(lng) || lat < -90 || lat > 90 || lng < -180 || lng > 180) return "invalid";
  return { lat, lng };
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
      message: "Enter a U.S. street address, ZIP code, city/state, or lat/lon.",
      matchCount: 0,
    };
  const parsedCoordinates = parseCoordinateSearch(clean);
  if (parsedCoordinates === "invalid") {
    return { status: "invalid-input", location: null, message: "Invalid latitude/longitude. Latitude must be -90 to 90 and longitude -180 to 180.", matchCount: 0 };
  }
  if (parsedCoordinates) {
    const location = buildManualCoordinateLocation(parsedCoordinates.lat, parsedCoordinates.lng, clean);
    return { status: "found", location, message: `Planning center set to ${location.label}. Session-only; not stored.`, matchCount: 1 };
  }
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
      message: "No match found. Try a ZIP code, city/state, coordinates, or full address.",
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
  const addressComponents = top?.addressComponents ?? top?.address ?? {};
  const structuredState = normalizeStateCode(addressComponents.stateCode ?? addressComponents.state ?? addressComponents.State);
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
    source: "U.S. Census Geocoder",
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
    },
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
