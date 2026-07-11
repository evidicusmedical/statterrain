import { resolveStateFromCoordinates } from "./resolveStateFromCoordinates";
import { STATE_BOUNDS } from "./stateBounds";
import { normalizeStateCode, parseStateFromText } from "./stateCodes";

export interface PartitionSelectionInput { lat:number; lng:number; radiusMiles:number; state?:string | null; label?:string | null; query?:string | null; availableStates?: string[] | null; }
export type PartitionSelectionResult =
  | { status:"resolved"; primaryState:string; partitions:string[]; strategy:string; message?: string }
  | { status:"unresolved"; partitions:[]; strategy:"unresolved"; message:string };

export function inferStateCode(input: PartitionSelectionInput): string | null {
  return normalizeStateCode(input.state)
    ?? resolveStateFromCoordinates(input.lat, input.lng)
    ?? parseStateFromText(`${input.label ?? ""} ${input.query ?? ""}`);
}

function radiusBounds(lat:number, lng:number, radiusMiles:number) {
  const latDelta = radiusMiles / 69;
  const lngDelta = radiusMiles / Math.max(1, 69 * Math.cos((lat * Math.PI) / 180));
  return { minLat: lat-latDelta, maxLat: lat+latDelta, minLng: lng-lngDelta, maxLng: lng+lngDelta };
}
function intersects(a:{minLat:number;maxLat:number;minLng:number;maxLng:number}, b:{minLat:number;maxLat:number;minLng:number;maxLng:number}) { return a.minLat <= b.maxLat && a.maxLat >= b.minLat && a.minLng <= b.maxLng && a.maxLng >= b.minLng; }

export function selectCmsHospitalPartitionResult(input: PartitionSelectionInput): PartitionSelectionResult {
  const primaryState = inferStateCode(input);
  if (!primaryState) return { status:"unresolved", partitions:[], strategy:"unresolved", message:"StatTerrain could not determine the state or territory for this planning location. Hospital partitions were not loaded. Try a full address, city/state, ZIP code, or another map point." };
  const available = new Set((input.availableStates?.length ? input.availableStates : Object.keys(STATE_BOUNDS)).map(s=>s.toUpperCase()));
  const box = radiusBounds(input.lat, input.lng, input.radiusMiles);
  const partitions = Object.entries(STATE_BOUNDS)
    .filter(([code,bounds]) => available.has(code) && (code === primaryState || intersects(box, bounds)))
    .map(([code])=>code);
  if (available.has(primaryState) && !partitions.includes(primaryState)) partitions.push(primaryState);
  return { status:"resolved", primaryState, partitions: [...new Set(partitions)].sort(), strategy:"primary-state-plus-radius-bounds" };
}
export function selectCmsHospitalPartitions(input: PartitionSelectionInput): string[] { return selectCmsHospitalPartitionResult(input).partitions; }
