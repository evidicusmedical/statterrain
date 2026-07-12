import { createHash } from 'node:crypto';
import { ACS_VARIABLE_IDS } from './acs-county-metric-registry.mjs';
export const ACS_CHUNK_VARIABLE_LIMIT=40;
export function moeFor(id){return /E$/.test(id)?id.replace(/E$/,'M'):id}
export function estimateFor(id){return /M$/.test(id)?id.replace(/M$/,'E'):id}
export function buildAcsVariableChunks(variableIds=ACS_VARIABLE_IDS,{maxVariables=ACS_CHUNK_VARIABLE_LIMIT}={}){
  const remaining=new Set([...variableIds].sort()); const pairs=[];
  for(const id of [...remaining]){ if(!remaining.has(id)) continue; const base=estimateFor(id); const pair=moeFor(base); const vars=[base]; if(remaining.has(pair)) vars.push(pair); for(const v of vars) remaining.delete(v); pairs.push([...new Set(vars)].sort()); }
  const chunks=[]; let current=[]; let pairCount=0;
  for(const p of pairs){ if(current.length && current.length+p.length>maxVariables){ chunks.push(makeChunk(chunks.length,current,pairCount)); current=[]; pairCount=0; } current.push(...p); pairCount++; }
  if(current.length) chunks.push(makeChunk(chunks.length,current,pairCount)); return chunks;
}
function makeChunk(i,vars,pairCount){ const variables=[...new Set(vars)].sort(); return {chunkId:`acs-vars-${String(i+1).padStart(3,'0')}`,variables,pairCount,checksum:createHash('sha256').update(variables.join(',')).digest('hex').slice(0,16)}; }
export function assertAllVariablesChunked(chunks, required=ACS_VARIABLE_IDS){ const seen=new Map(); for(const c of chunks) for(const v of c.variables) seen.set(v,(seen.get(v)||0)+1); const missing=required.filter(v=>!seen.has(v)); const duplicates=[...seen].filter(([,n])=>n!==1).map(([v])=>v); if(missing.length||duplicates.length) throw new Error(`chunk manifest invalid missing=${missing.join(',')} duplicates=${duplicates.join(',')}`); return true; }
