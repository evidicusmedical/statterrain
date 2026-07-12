import { ACS_VARIABLE_IDS } from './acs-county-metric-registry.mjs';
export function geoidFor(row){return `${row.state}${row.county}`;}
export function mergeCountyChunks(chunkResults,{requiredVariables=ACS_VARIABLE_IDS}={}){
 const metrics={chunksPlanned:chunkResults.length,chunksCompleted:0,chunkFailures:0,countyRowsPerChunk:{},countySetMismatches:[],missingVariables:[],duplicateFields:[],mergedCountyRecords:0,mergeStatus:'PASS'};
 const merged=new Map(); let baseline=null;
 for(const chunk of chunkResults){ if(chunk.error){metrics.chunkFailures++; continue;} metrics.chunksCompleted++; const ids=new Set(); const seenRows=new Set(); const headers=chunk.headers||Object.keys(chunk.rows?.[0]||{}); for(const v of chunk.variables||[]) if(!headers.includes(v)) metrics.missingVariables.push(`${chunk.chunkId}:${v}`);
  for(const row of chunk.rows||[]){ const id=geoidFor(row); if(seenRows.has(id)) throw Object.assign(new Error(`duplicate county row ${id} in ${chunk.chunkId}`),{code:'DUPLICATE_COUNTY_ROW'}); seenRows.add(id); ids.add(id); const out=merged.get(id)||{}; for(const [k,val] of Object.entries(row)){ if(k in out && out[k]!==val){ metrics.duplicateFields.push(`${id}:${k}`); throw Object.assign(new Error(`conflicting duplicate field ${k} for ${id}`),{code:'DUPLICATE_CONFLICT'});} out[k]=val; } merged.set(id,out); }
  const set=[...ids].sort(); metrics.countyRowsPerChunk[chunk.chunkId]=set.length; if(!baseline) baseline=set; else if(set.join('|')!==baseline.join('|')) metrics.countySetMismatches.push(chunk.chunkId);
 }
 for(const [id,row] of merged) for(const v of requiredVariables) if(!(v in row)) metrics.missingVariables.push(`${id}:${v}`);
 metrics.mergedCountyRecords=merged.size; if(metrics.chunkFailures||metrics.countySetMismatches.length||metrics.missingVariables.length||metrics.duplicateFields.length) metrics.mergeStatus='FAIL';
 return {records:[...merged.values()].sort((a,b)=>geoidFor(a).localeCompare(geoidFor(b))),metrics};
}
