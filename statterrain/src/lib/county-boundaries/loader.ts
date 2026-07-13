import type { CountyBoundaryFeature, CountyBoundaryManifest } from "./types";
const BASE = "/api/generated-data/county-boundaries";
let manifest: Promise<CountyBoundaryManifest | null> | null = null;
const cache = new Map<string, Promise<CountyBoundaryFeature[]>>();
async function json<T>(url:string){ const r=await fetch(url,{cache:"force-cache"}); if(!r.ok) throw new Error(`Unable to load ${url}`); return r.json() as Promise<T>; }
export function loadCountyBoundaryManifest(){ if(!manifest) manifest=json<CountyBoundaryManifest>(`${BASE}/manifest.json`).catch(()=>null); return manifest; }
export function loadCountyBoundaryStatePartition(stateCode:string){ const code=stateCode.toUpperCase(); if(!cache.has(code)) cache.set(code,json<{features:CountyBoundaryFeature[]}>(`${BASE}/states/${code}.json`).then(d=>d.features.filter(f=>!f.properties.fixtureOnly))); return cache.get(code)!; }
