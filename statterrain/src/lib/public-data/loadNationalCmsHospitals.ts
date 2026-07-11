import type { Facility } from "@/types/facility";

export const NATIONAL_CMS_PUBLIC_BASE = "/generated/cms-hospitals-national";
export const CMS_LOAD_FAILURE_COPY = "CMS hospital public-data records could not be loaded. Synthetic facilities were not substituted.";
export const CMS_EMPTY_RESULT_COPY = "No map-ready CMS hospital records were found within the selected radius.";
export const CMS_EMPTY_RESULT_CLARIFICATION = "This reflects the current CMS map-ready dataset and selected planning radius.";

export interface NationalCmsManifest { sourceName:string; retrievedAt:string|null; mapReadyRecords:number; statesPresent:string[]; partitions:{state:string; publicPath?:string; path?:string; recordCount:number}[]; validationStatus?:string; }
export type CmsLoadStatus = "loading" | "success" | "partial-failure" | "error";
export interface CmsLoadResult { status:CmsLoadStatus; manifest:NationalCmsManifest|null; facilities:Facility[]; requestedPartitions:string[]; loadedPartitions:string[]; errors:string[]; missingManifestPartitions?: string[]; failedPartitions?: string[]; partialCoverage?: boolean; }
export interface LoadOptions { partitionCodes:string[]; fetcher?: typeof fetch; basePath?: string; }

const partitionCache = new Map<string, Facility[]>();
let manifestCache: NationalCmsManifest | null = null;

function pathFor(basePath:string, manifest:NationalCmsManifest, state:string): string {
  const p = manifest.partitions.find(x => x.state === state);
  return p?.publicPath ?? `${basePath}/states/${state}.json`;
}
function asText(v: unknown): string | undefined { return typeof v === "string" && v.trim() ? v : undefined; }
function cmsRecordToFacility(record:any, manifest:NationalCmsManifest): Facility | null {
  const lat = Number(record.latitude); const lng = Number(record.longitude);
  const sourceFacilityId = asText(record.sourceFacilityId ?? record.id);
  const name = asText(record.name ?? record.facilityName);
  if (!sourceFacilityId || !name || !Number.isFinite(lat) || !Number.isFinite(lng)) return null;
  const critical = String(record.criticalAccessIndicator ?? "").toLowerCase() === "yes";
  return { id:`cms-${sourceFacilityId}`, name, facilityType: "hospital", lat, lng, address: asText(record.address) ?? "Not reported in this source", city: asText(record.city), state: asText(record.state), zip: asText(record.zip), phone: asText(record.phone), distanceMiles: 0, criticalAccess: critical, capabilities: [], sourceIds:[sourceFacilityId, asText(record.sourceId) ?? "cms-hospital-general-information"], freshness:"current", confidence:"high", limitations: Array.isArray(record.limitations) ? record.limitations : ["CMS Hospital General Information public-data record; unsupported clinical capability fields are not inferred."], isSynthetic:false };
}
export function haversineMiles(aLat:number,aLng:number,bLat:number,bLng:number): number { const R=3958.8; const dLat=(bLat-aLat)*Math.PI/180; const dLng=(bLng-aLng)*Math.PI/180; const lat1=aLat*Math.PI/180; const lat2=bLat*Math.PI/180; const h=Math.sin(dLat/2)**2+Math.cos(lat1)*Math.cos(lat2)*Math.sin(dLng/2)**2; return R*2*Math.asin(Math.sqrt(h)); }
export function filterFacilitiesByRadius(facilities:Facility[], lat:number, lng:number, radiusMiles:number): Facility[] { return facilities.map(f=>({...f,distanceMiles:Number(haversineMiles(lat,lng,f.lat,f.lng).toFixed(1))})).filter(f=>f.distanceMiles<=radiusMiles).sort((a,b)=>a.distanceMiles-b.distanceMiles); }

export async function loadNationalCmsHospitals(options: LoadOptions): Promise<CmsLoadResult> {
  const fetcher = options.fetcher ?? fetch; const basePath = options.basePath ?? NATIONAL_CMS_PUBLIC_BASE;
  const errors:string[]=[]; const loadedPartitions:string[]=[]; const requestedPartitions=[...new Set(options.partitionCodes.map(s=>s.toUpperCase()))].sort();
  try {
    if (!manifestCache || basePath !== NATIONAL_CMS_PUBLIC_BASE) {
      const res = await fetcher(`${basePath}/manifest.json`); if (!res.ok) throw new Error(`manifest ${res.status}`);
      manifestCache = await res.json();
    }
    const manifest = manifestCache;
    if (!manifest) throw new Error("manifest unavailable");
    const manifestStates = new Set(manifest.statesPresent ?? manifest.partitions.map(p=>p.state));
    const manifestPartitionStates = new Set(manifest.partitions.map(p=>p.state));
    const missingManifestPartitions = requestedPartitions.filter(state => !manifestStates.has(state) || !manifestPartitionStates.has(state));
    errors.push(...missingManifestPartitions.map(state => `missing manifest partition ${state}`));
    const loadablePartitions = requestedPartitions.filter(state => !missingManifestPartitions.includes(state));
    const failedPartitions:string[]=[];
    const facilities:Facility[]=[]; const seen = new Set<string>();
    await Promise.all(loadablePartitions.map(async state => {
      const cacheKey = `${basePath}:${state}`;
      try {
        let partitionFacilities = partitionCache.get(cacheKey);
        if (!partitionFacilities) {
          const res = await fetcher(pathFor(basePath, manifest, state)); if (!res.ok) throw new Error(`${state} ${res.status}`);
          const json = await res.json(); const records = Array.isArray(json.records) ? json.records : [];
          partitionFacilities = records.map((r:any)=>cmsRecordToFacility(r, manifest)).filter(Boolean) as Facility[];
          partitionCache.set(cacheKey, partitionFacilities);
        }
        for (const f of partitionFacilities) { const id = f.sourceIds[0]; if (!seen.has(id)) { seen.add(id); facilities.push(f); } }
        loadedPartitions.push(state);
      } catch (err) { failedPartitions.push(state); errors.push(err instanceof Error ? err.message : String(err)); }
    }));
    const status = errors.length ? (facilities.length ? "partial-failure" : "error") : "success";
    return { status, manifest, facilities, requestedPartitions, loadedPartitions: loadedPartitions.sort(), errors, missingManifestPartitions, failedPartitions, partialCoverage: status === "partial-failure" };
  } catch (err) { return { status:"error", manifest:null, facilities:[], requestedPartitions, loadedPartitions:[], errors:[CMS_LOAD_FAILURE_COPY, err instanceof Error ? err.message : String(err)] }; }
}
