import type { AcsCountyManifest, AcsCountyRecord } from "./types";

const BASE = "/api/generated-data/acs-county-population-national";
let manifestPromise: Promise<AcsCountyManifest | null> | null = null;
const partitionCache = new Map<string, Promise<AcsCountyRecord[]>>();
let requestSeq = 0;

async function fetchJson<T>(url: string): Promise<T> {
  const res = await fetch(url, { cache: "force-cache" });
  if (!res.ok) throw new Error(`Unable to load ${url}: ${res.status}`);
  return res.json() as Promise<T>;
}

export function loadAcsManifest(): Promise<AcsCountyManifest | null> {
  if (!manifestPromise) manifestPromise = fetchJson<AcsCountyManifest>(`${BASE}/manifest.json`).catch(() => null);
  return manifestPromise;
}

export function loadAcsStatePartition(stateCode: string): Promise<AcsCountyRecord[]> {
  const code = stateCode.trim().toUpperCase();
  if (!/^[A-Z]{2}$/.test(code)) return Promise.reject(new Error(`Invalid ACS state partition ${stateCode}`));
  if (!partitionCache.has(code)) {
    partitionCache.set(code, fetchJson<{ records: AcsCountyRecord[] }>(`${BASE}/states/${code}.json`).then((d) => d.records));
  }
  return partitionCache.get(code)!;
}

export async function loadAcsCountiesForStates(stateCodes: string[]) {
  const seq = ++requestSeq;
  const unique = Array.from(new Set(stateCodes.map((s) => s.toUpperCase())));
  const settled = await Promise.allSettled(unique.map(loadAcsStatePartition));
  if (seq !== requestSeq) return { status: "stale" as const, records: [], errors: [] as string[] };
  const records = settled.flatMap((r) => (r.status === "fulfilled" ? r.value : []));
  const errors = settled.flatMap((r, i) => (r.status === "rejected" ? [`${unique[i]}: ${r.reason?.message ?? r.reason}`] : []));
  return { status: errors.length ? "partial" as const : "loaded" as const, records, errors };
}

export async function findAcsCountyByGeoid(geoid: string, stateCode: string) {
  const records = await loadAcsStatePartition(stateCode);
  return records.find((r) => r.geoid === geoid) ?? null;
}

export function clearAcsRuntimeCachesForTests() { manifestPromise = null; partitionCache.clear(); requestSeq = 0; }
