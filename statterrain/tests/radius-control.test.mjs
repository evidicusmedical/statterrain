import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
const root=process.cwd();
const lib=readFileSync(join(root,'src/lib/radiusControl.ts'),'utf8');
const sidebar=readFileSync(join(root,'src/components/filters/FilterSidebar.tsx'),'utf8');

test('canonical radius policy is one to 250 miles with decimals',()=>{assert.match(lib,/MIN_RADIUS_MILES = 1/);assert.match(lib,/MAX_RADIUS_MILES = 250/);assert.match(lib,/Math\.round\(value \* 10\) \/ 10/);});
test('slider text and quick controls update same callback',()=>{assert.match(sidebar,/type="range"/);assert.match(sidebar,/id="radius-number"/);assert.match(sidebar,/onRadiusChange\(parsed\)/);assert.match(sidebar,/onRadiusChange\(miles\)/);assert.match(sidebar,/onRadiusChange\(Number\(e\.target\.value\)\)/);});
test('invalid radius restores previous valid value',()=>{assert.match(sidebar,/setRadiusText\(formatRadiusMiles\(radiusMiles\)\)/);assert.match(sidebar,/Enter a radius from 1 to 250 miles/);});
