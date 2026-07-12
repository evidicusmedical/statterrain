import test from 'node:test';import assert from 'node:assert/strict';import {readFileSync} from 'node:fs';
test('activation guard requires pass national coverage and 52 partitions',()=>{const s=readFileSync('src/lib/county-boundaries/types.ts','utf8'); assert.match(s,/validationStatus === "PASS"/); assert.match(s,/coverageStatus === "national"/); assert.match(s,/partitionCount >= 52/);});
