import test from 'node:test';import assert from 'node:assert/strict';
import {reconcileWithAcs} from '../scripts/public-data/build-county-boundaries.mjs';
test('ACS GEOID reconciliation detects duplicates and missing ACS boundaries',()=>{const fs=['00123','00123','00456'].map(GEOID=>({properties:{GEOID}}));const r=reconcileWithAcs(fs,['00123','00999']);assert.deepEqual(r.duplicateBoundaryGeoids,['00123']);assert.deepEqual(r.acsGeoidsMissingBoundary,['00999']);assert.deepEqual(r.boundaryGeoidsMissingAcs,['00456']);});
