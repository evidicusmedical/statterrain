import test from 'node:test';import assert from 'node:assert/strict';
import {EXPECTED_STATES,partitionFeatures,generateManifest} from '../scripts/public-data/build-county-boundaries.mjs';
test('state partition assignment and 52-partition national guard',()=>{const m=partitionFeatures([{type:'Feature',properties:{STATEFP:'26',GEOID:'26001'},geometry:{type:'Polygon',coordinates:[[[0,0],[1,0],[0,1],[0,0]]]}}]);assert.equal(m.get('MI').length,1);const manifest=generateManifest(EXPECTED_STATES);assert.equal(manifest.partitionCount,52);assert.equal(manifest.coverageStatus,'national');});
