import { parseCoordinateSearch } from "./coordinates";
import { normalizeStateCode, parseStateFromText, STATE_NAME_TO_CODE } from "../geography/stateCodes";

export type GeocodeSearchStrategy = "coordinates" | "invalid-coordinates" | "street-address" | "city-state" | "zip" | "unsupported";

export interface ClassifiedSearchQuery {
  strategy: GeocodeSearchStrategy;
  query: string;
  city?: string;
  state?: string;
  zip?: string;
  message?: string;
}

export function classifyGeocodeSearchQuery(query: string): ClassifiedSearchQuery {
  const clean = query.trim().replace(/\s+/g, " ");
  const parsedCoordinates = parseCoordinateSearch(clean);
  if (parsedCoordinates === "invalid") return { strategy: "invalid-coordinates", query: clean, message: "Invalid coordinates" };
  if (parsedCoordinates) return { strategy: "coordinates", query: clean };

  const zip = clean.match(/^(\d{5})(?:-\d{4})?$/);
  if (zip) return { strategy: "zip", query: clean, zip: zip[1] };

  const cityState = clean.match(/^([A-Za-z][A-Za-z .'-]*(?:\s+[A-Za-z][A-Za-z .'-]*)*)\s*,\s*([A-Za-z]{2}|[A-Za-z][A-Za-z .'-]+)$/);
  if (cityState) {
    const city = cityState[1].trim();
    const rawState = cityState[2].trim();
    const state = normalizeStateCode(rawState) ?? STATE_NAME_TO_CODE[rawState.toLowerCase().replace(/\s+/g, " ")] ?? parseStateFromText(rawState);
    if (state) return { strategy: "city-state", query: clean, city, state };
  }

  if (/^\d+\s+\S+/.test(clean)) return { strategy: "street-address", query: clean };
  if (/^[A-Za-z][A-Za-z .'-]+$/.test(clean) && !clean.includes(",")) return { strategy: "unsupported", query: clean, message: "Include a state with the city name." };
  return { strategy: "unsupported", query: clean, message: "Search by full address, city and state, ZIP code, or latitude/longitude." };
}
