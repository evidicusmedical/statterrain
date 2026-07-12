import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
const root=process.cwd();
const registry=readFileSync(join(root,'src/config/researchLayerRegistry.ts'),'utf8');
const sidebar=readFileSync(join(root,'src/components/filters/FilterSidebar.tsx'),'utf8');
test('only CMS hospitals active initially',()=>{assert.match(registry,/layerId: "cms-hospitals"/);assert.match(registry,/active: true/);assert.match(registry,/available: true/);assert.doesNotMatch(registry,/aha/i);});
test('inactive population controls are hidden',()=>{assert.match(sidebar,/activeResearchLayers/);assert.doesNotMatch(sidebar,/OVERLAY_ORDER\.map/);assert.match(sidebar,/Population, rurality, vulnerability/);});
