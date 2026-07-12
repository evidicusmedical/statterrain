import { NextResponse } from "next/server";
import { classifyGeocodeSearchQuery } from "@/lib/geocoding/searchStrategy";
import { normalizeStateCode } from "@/lib/geography/stateCodes";

export const dynamic = "force-dynamic";

const CENSUS_ADDRESS_ENDPOINT = "https://geocoding.geo.census.gov/geocoder/locations/onelineaddress";
const TIGER_PLACE_ENDPOINT = "https://tigerweb.geo.census.gov/arcgis/rest/services/TIGERweb/Places_CouSub_ConCity_SubMCD/MapServer/4/query";
const TIGER_ZCTA_ENDPOINT = "https://tigerweb.geo.census.gov/arcgis/rest/services/TIGERweb/tigerWMS_ACS2022/MapServer/0/query";
const TIMEOUT_MS = 8000;
const MAX_QUERY_LENGTH = 240;
const SOURCE = "U.S. Census Bureau";

const STATE_TO_FIPS: Record<string, string> = { AL:"01",AK:"02",AZ:"04",AR:"05",CA:"06",CO:"08",CT:"09",DE:"10",DC:"11",FL:"12",GA:"13",HI:"15",ID:"16",IL:"17",IN:"18",IA:"19",KS:"20",KY:"21",LA:"22",ME:"23",MD:"24",MA:"25",MI:"26",MN:"27",MS:"28",MO:"29",MT:"30",NE:"31",NV:"32",NH:"33",NJ:"34",NM:"35",NY:"36",NC:"37",ND:"38",OH:"39",OK:"40",OR:"41",PA:"42",RI:"44",SC:"45",SD:"46",TN:"47",TX:"48",UT:"49",VT:"50",VA:"51",WA:"53",WV:"54",WI:"55",WY:"56",PR:"72" };

type GeocodeStatus = "found" | "multiple-matches" | "invalid-input" | "unsupported-query" | "no-match" | "upstream-timeout" | "upstream-unavailable" | "invalid-upstream-response";
type Match = { label: string; latitude: number; longitude: number; state?: string | null; zip?: string | null; geographyType: "address" | "place" | "zip"; geographyId?: string | null; source: string; limitations: string[] };

function payload(status: GeocodeStatus, init: ResponseInit = {}, matches: Match[] = [], strategy?: string, message?: string) {
  return NextResponse.json({ status, strategy, matches, source: SOURCE, message }, { headers: { "Cache-Control": "no-store" }, ...init });
}
async function fetchJson(url: string): Promise<unknown | "timeout" | "unavailable"> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    const response = await fetch(url, { signal: controller.signal, cache: "no-store" });
    clearTimeout(timeout);
    if (!response.ok) return "unavailable";
    return await response.json();
  } catch (error) {
    clearTimeout(timeout);
    return error instanceof DOMException && error.name === "AbortError" ? "timeout" : "unavailable";
  }
}
function upstreamFailure(result: unknown) { return result === "timeout" ? payload("upstream-timeout", { status: 504 }) : result === "unavailable" ? payload("upstream-unavailable", { status: 502 }) : null; }
function esc(value: string) { return value.replaceAll("'", "''").toUpperCase(); }
function point(feature: any) { const a = feature?.attributes ?? {}; const c = feature?.centroid ?? feature?.geometry; const lat = Number(c?.y ?? a.CENTLAT); const lng = Number(c?.x ?? a.CENTLON); return { lat, lng }; }

async function resolveAddress(q: string, strategy: string) {
  const params = new URLSearchParams({ address: q, benchmark: "Public_AR_Current", format: "json" });
  const json = await fetchJson(`${CENSUS_ADDRESS_ENDPOINT}?${params.toString()}`);
  const fail = upstreamFailure(json); if (fail) return fail;
  const matches = (json as any)?.result?.addressMatches;
  if (!Array.isArray(matches)) return payload("invalid-upstream-response", { status: 502 }, [], strategy);
  if (matches.length === 0) return payload("no-match", { status: 404 }, [], strategy);
  const normalized = matches.map((m: any): Match | null => {
    const latitude = Number(m?.coordinates?.y); const longitude = Number(m?.coordinates?.x);
    if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) return null;
    const components = m?.addressComponents ?? {};
    return { label: String(m?.matchedAddress ?? q), latitude, longitude, state: normalizeStateCode(components.stateCode ?? components.state) ?? null, zip: components.zip ?? null, geographyType: "address", geographyId: m?.tigerLine?.tigerLineId ? String(m.tigerLine.tigerLineId) : null, source: SOURCE, limitations: [] };
  }).filter(Boolean) as Match[];
  return normalized.length ? payload("found", { status: 200 }, normalized, strategy) : payload("invalid-upstream-response", { status: 502 }, [], strategy);
}

async function resolvePlace(city: string, state: string, strategy: string) {
  const fips = STATE_TO_FIPS[state]; if (!fips) return payload("invalid-input", { status: 400 }, [], strategy);
  const where = `UPPER(BASENAME)='${esc(city)}' AND STATE='${fips}'`;
  const params = new URLSearchParams({ where, outFields: "NAME,BASENAME,STATE,PLACE,GEOID,CENTLAT,CENTLON", returnGeometry: "true", returnCentroid: "true", f: "json" });
  const json = await fetchJson(`${TIGER_PLACE_ENDPOINT}?${params.toString()}`);
  const fail = upstreamFailure(json); if (fail) return fail;
  const features = (json as any)?.features;
  if (!Array.isArray(features)) return payload("invalid-upstream-response", { status: 502 }, [], strategy);
  if (features.length === 0) return payload("no-match", { status: 404 }, [], strategy);
  const normalized = features.map((feature: any): Match | null => {
    const { lat, lng } = point(feature); if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;
    const a = feature.attributes ?? {}; const name = a.NAME ?? `${city} city`;
    return { label: `${name}, ${state}`, latitude: lat, longitude: lng, state, zip: null, geographyType: "place", geographyId: a.GEOID ?? (a.STATE && a.PLACE ? `${a.STATE}${a.PLACE}` : null), source: SOURCE, limitations: ["Place search uses a representative geographic point rather than a street address."] };
  }).filter(Boolean) as Match[];
  return normalized.length ? payload(features.length > 1 ? "multiple-matches" : "found", { status: 200 }, normalized, strategy) : payload("invalid-upstream-response", { status: 502 }, [], strategy);
}
async function resolveZip(zip: string, strategy: string) {
  const params = new URLSearchParams({ where: `BASENAME='${zip}'`, outFields: "BASENAME,GEOID,CENTLAT,CENTLON", returnGeometry: "true", returnCentroid: "true", f: "json" });
  const json = await fetchJson(`${TIGER_ZCTA_ENDPOINT}?${params.toString()}`);
  const fail = upstreamFailure(json); if (fail) return fail;
  const features = (json as any)?.features;
  if (!Array.isArray(features)) return payload("invalid-upstream-response", { status: 502 }, [], strategy);
  if (features.length === 0) return payload("no-match", { status: 404 }, [], strategy);
  const normalized = features.map((feature: any): Match | null => {
    const { lat, lng } = point(feature); if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;
    const a = feature.attributes ?? {}; const z = String(a.BASENAME ?? zip);
    return { label: `ZIP/ZCTA ${z}`, latitude: lat, longitude: lng, state: null, zip: z, geographyType: "zip", geographyId: a.GEOID ?? z, source: SOURCE, limitations: ["ZIP search uses an area-derived reference point associated with the selected ZIP or ZCTA geography and does not represent a precise address."] };
  }).filter(Boolean) as Match[];
  return normalized.length ? payload("found", { status: 200 }, normalized, strategy) : payload("invalid-upstream-response", { status: 502 }, [], strategy);
}

export async function GET(request: Request) {
  const q = new URL(request.url).searchParams.get("q")?.trim() ?? "";
  if (!q || q.length > MAX_QUERY_LENGTH) return payload("invalid-input", { status: 400 });
  const classified = classifyGeocodeSearchQuery(q);
  if (classified.strategy === "unsupported") return payload("unsupported-query", { status: 400 }, [], classified.strategy, classified.message);
  if (classified.strategy === "invalid-coordinates" || classified.strategy === "coordinates") return payload("invalid-input", { status: 400 }, [], classified.strategy, "Coordinates resolve locally in the browser.");
  if (classified.strategy === "zip" && classified.zip) return resolveZip(classified.zip, classified.strategy);
  if (classified.strategy === "city-state" && classified.city && classified.state) return resolvePlace(classified.city, classified.state, classified.strategy);
  return resolveAddress(q, classified.strategy);
}
