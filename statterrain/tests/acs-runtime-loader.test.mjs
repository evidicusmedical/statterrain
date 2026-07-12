import test from 'node:test';import assert from 'node:assert/strict';import {readFileSync} from 'node:fs';
test('ACS runtime loader uses partitions, cache, dedupe, and no Census API key',()=>{const s=readFileSync('src/lib/acs/runtimeLoader.ts','utf8'); assert.match(s,/partitionCache/); assert.match(s,/requestSeq/); assert.doesNotMatch(s,/CENSUS_API_KEY|api\.census\.gov/);});
