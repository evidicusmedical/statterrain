import { NextResponse } from "next/server";
import { normalizeStateCode } from "@/lib/geography/stateCodes";

export const dynamic = "force-dynamic";

const CENSUS_ENDPOINT = "https://geocoding.geo.census.gov/geocoder/locations/onelineaddress";
const TIMEOUT_MS = 8000;
const MAX_QUERY_LENGTH = 240;

type GeocodeStatus = "found" | "invalid-input" | "no-match" | "upstream-timeout" | "upstream-unavailable" | "invalid-upstream-response";

function payload(status: GeocodeStatus, init: ResponseInit = {}, matches: unknown[] = []) {
  return NextResponse.json({ status, matches, source: "U.S. Census Geocoder" }, { headers: { "Cache-Control": "no-store" }, ...init });
}

export async function GET(request: Request) {
  const q = new URL(request.url).searchParams.get("q")?.trim() ?? "";
  if (!q || q.length > MAX_QUERY_LENGTH) return payload("invalid-input", { status: 400 });

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), TIMEOUT_MS);
  let response: Response;
  try {
    const params = new URLSearchParams({ address: q, benchmark: "Public_AR_Current", format: "json" });
    response = await fetch(`${CENSUS_ENDPOINT}?${params.toString()}`, { signal: controller.signal, cache: "no-store" });
  } catch (error) {
    clearTimeout(timeout);
    return payload(error instanceof DOMException && error.name === "AbortError" ? "upstream-timeout" : "upstream-unavailable", { status: 502 });
  }
  clearTimeout(timeout);
  if (!response.ok) return payload("upstream-unavailable", { status: 502 });

  let json: unknown;
  try { json = await response.json(); } catch { return payload("invalid-upstream-response", { status: 502 }); }
  const matches = (json as any)?.result?.addressMatches;
  if (!Array.isArray(matches)) return payload("invalid-upstream-response", { status: 502 });
  if (matches.length === 0) return payload("no-match", { status: 404 });

  const normalized = matches.map((m: any) => {
    const latitude = Number(m?.coordinates?.y);
    const longitude = Number(m?.coordinates?.x);
    if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) return null;
    const components = m?.addressComponents ?? m?.address ?? {};
    return { label: String(m?.matchedAddress ?? q), latitude, longitude, state: normalizeStateCode(components.stateCode ?? components.state ?? components.State) ?? undefined };
  }).filter(Boolean);
  if (normalized.length === 0) return payload("invalid-upstream-response", { status: 502 });
  return payload("found", { status: 200 }, normalized);
}
