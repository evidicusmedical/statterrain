import { STATE_BOUNDS } from "./stateBounds";

function contains(b: {minLat:number;maxLat:number;minLng:number;maxLng:number}, lat:number, lng:number): boolean { return lat >= b.minLat && lat <= b.maxLat && lng >= b.minLng && lng <= b.maxLng; }
function distance2(lat:number,lng:number,cLat:number,cLng:number): number { const x=(lng-cLng)*Math.cos((lat*Math.PI)/180); const y=lat-cLat; return x*x+y*y; }
export function resolveStateFromCoordinates(lat: number, lng: number): string | null {
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;
  // Tight priority windows for small jurisdictions where hospital-derived bounds overlap neighbors.
  if (lat >= 38.78 && lat <= 38.995 && lng >= -77.13 && lng <= -76.91) return "DC";
  if (lat >= 17.8 && lat <= 18.6 && lng >= -67.4 && lng <= -65.1) return "PR";
  const candidates = Object.entries(STATE_BOUNDS).filter(([, b]) => contains(b, lat, lng));
  if (!candidates.length) return null;
  candidates.sort((a,b)=>distance2(lat,lng,a[1].centroidLat,a[1].centroidLng)-distance2(lat,lng,b[1].centroidLat,b[1].centroidLng));
  return candidates[0][0];
}
