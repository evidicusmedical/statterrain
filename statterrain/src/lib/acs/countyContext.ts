import { loadAcsManifest, loadAcsStatePartition } from "./runtimeLoader";
import type { AcsCountyRecord } from "./types";
import { loadCountyBoundaryManifest, loadCountyBoundaryStatePartition } from "@/lib/county-boundaries/loader";
import { isNationalCountyBoundaryActive, type CountyBoundaryFeature } from "@/lib/county-boundaries/types";
import { pointInPolygon, polygonIntersectsRadius, type Point } from "@/lib/county-boundaries/geometry";
import { resolveStateFromCoordinates } from "@/lib/geography/resolveStateFromCoordinates";
import { STATE_BOUNDS } from "@/lib/geography/stateBounds";

export type CountyContextStatus = "idle" | "loading" | "available" | "unavailable" | "error";
export interface CountyContextState { status: CountyContextStatus; message: string; containingCounty: AcsCountyRecord | null; intersectingCounties: AcsCountyRecord[]; boundaryFeatures: CountyBoundaryFeature[]; manifestSummary?: { acs: string; boundaries: string }; }

function polygons(feature: CountyBoundaryFeature): Point[][][] { return feature.geometry.type === "Polygon" ? [feature.geometry.coordinates as Point[][]] : feature.geometry.coordinates as Point[][][]; }
function stateCodesForRadius(lat:number,lng:number,radiusMiles:number, primary:string | null) { const latDelta = radiusMiles / 69; const lngDelta = radiusMiles / Math.max(1, 69 * Math.cos((lat*Math.PI)/180)); const codes = Object.entries(STATE_BOUNDS).filter(([,b]) => lat+latDelta >= b.minLat && lat-latDelta <= b.maxLat && lng+lngDelta >= b.minLng && lng-lngDelta <= b.maxLng).map(([c])=>c); if (primary && !codes.includes(primary)) codes.unshift(primary); return codes; }
function acsManifestActive(m:any) { return !!m && m.buildMode === "national" && m.stateCount >= 52 && m.countyRecordCount >= 3222 && Array.isArray(m.metricList) && m.metricList.length >= 8; }
export async function resolveCountyContext(lat:number,lng:number,radiusMiles:number): Promise<CountyContextState> {
  const [acsManifest,boundaryManifest] = await Promise.all([loadAcsManifest(), loadCountyBoundaryManifest()]);
  if (!acsManifestActive(acsManifest) || !isNationalCountyBoundaryActive(boundaryManifest)) return { status:"unavailable", message:"County population context unavailable because national ACS or county boundary activation guards did not pass.", containingCounty:null, intersectingCounties:[], boundaryFeatures:[] };
  const activeAcsManifest = acsManifest!;
  const activeBoundaryManifest = boundaryManifest!;
  const primary = resolveStateFromCoordinates(lat,lng);
  if (!primary) return { status:"unavailable", message:"County population context unavailable because the planning state partition could not be resolved.", containingCounty:null, intersectingCounties:[], boundaryFeatures:[] };
  const stateCodes = stateCodesForRadius(lat,lng,radiusMiles,primary);
  const features = (await Promise.all(stateCodes.map((s)=>loadCountyBoundaryStatePartition(s).catch(()=>[])))).flat();
  const point: Point = [lng,lat];
  const containingMatches = features.filter((f)=>polygons(f).some((poly)=>pointInPolygon(point, poly))).sort((a,b)=>a.properties.GEOID.localeCompare(b.properties.GEOID));
  const containing = containingMatches[0] ?? null;
  const intersectingFeatures = features.filter((f)=>polygons(f).some((poly)=>polygonIntersectsRadius(poly, point, radiusMiles)) || f.properties.GEOID === containing?.properties.GEOID).sort((a,b)=>a.properties.GEOID.localeCompare(b.properties.GEOID));
  const records = (await Promise.all(stateCodes.map((s)=>loadAcsStatePartition(s).catch(()=>[])))).flat();
  const byGeoid = new Map(records.map((r)=>[r.geoid,r]));
  const intersectingCounties = intersectingFeatures.map((f)=>byGeoid.get(f.properties.GEOID)).filter((r): r is AcsCountyRecord => Boolean(r));
  const containingCounty = containing ? byGeoid.get(containing.properties.GEOID) ?? null : null;
  return { status: containingCounty ? "available" : "unavailable", message: containingCounty ? "County population context loaded from national ACS and county boundary partitions. Boundary-edge ties use the lowest GEOID and are documented in exports." : "Containing county was not matched to an ACS GEOID record; population context unavailable.", containingCounty, intersectingCounties, boundaryFeatures: intersectingFeatures, manifestSummary: { acs: `${activeAcsManifest.release} ${activeAcsManifest.estimatePeriod}; ${activeAcsManifest.countyRecordCount} county records`, boundaries: `${activeBoundaryManifest.validationStatus}/${activeBoundaryManifest.coverageStatus}; ${activeBoundaryManifest.partitionCount} partitions` } };
}
