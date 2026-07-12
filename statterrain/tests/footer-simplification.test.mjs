import test from 'node:test';import assert from 'node:assert/strict';import {readFileSync} from 'node:fs';
test('footer is compact approved research prototype copy',()=>{const s=readFileSync('src/components/layout/Footer.tsx','utf8'); assert.match(s,/Data sources: CMS and U\.S\. Census Bureau/); assert.match(s,/Research prototype — not for clinical or operational use\./);});
