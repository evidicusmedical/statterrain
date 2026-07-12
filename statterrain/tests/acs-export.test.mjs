import test from 'node:test';import assert from 'node:assert/strict';import {readFileSync} from 'node:fs';
test('County ACS CSV export preserves statuses and MOE fields',()=>{const s=readFileSync('src/lib/export.ts','utf8'); assert.match(s,/buildCountyAcsCsv/); for (const h of ['status','numerator_moe','denominator_moe','estimate_period']) assert.match(s,new RegExp(h));});
