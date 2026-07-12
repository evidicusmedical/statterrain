import test from 'node:test';import assert from 'node:assert/strict';
import {ACS_VARIABLE_IDS} from '../scripts/public-data/acs-county-metric-registry.mjs';
import {buildAcsVariableChunks,assertAllVariablesChunked} from '../scripts/public-data/acs-variable-chunking.mjs';
test('variable chunk count is deterministic and all variables assigned exactly once',()=>{const a=buildAcsVariableChunks();const b=buildAcsVariableChunks();assert.deepEqual(a,b);assertAllVariablesChunked(a);assert.equal(new Set(a.flatMap(c=>c.variables)).size,ACS_VARIABLE_IDS.length);});
test('E/M pairs remain together where practical',()=>{const chunks=buildAcsVariableChunks(undefined,{maxVariables:40});for(const c of chunks)for(const v of c.variables.filter(x=>x.endsWith('E'))){const m=v.replace(/E$/,'M');if(ACS_VARIABLE_IDS.includes(m))assert.ok(c.variables.includes(m));}});
