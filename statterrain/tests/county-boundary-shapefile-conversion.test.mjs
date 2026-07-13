import test from 'node:test';import assert from 'node:assert/strict';
import {normalizeGeoid,validateFeature} from '../scripts/public-data/build-county-boundaries.mjs';
test('GEOID normalization yields exactly five digits',()=>assert.equal(normalizeGeoid('123'), '00123'));
test('empty geometry rejection',()=>assert.equal(validateFeature({type:'Feature',properties:{GEOID:'00123'},geometry:{type:'Polygon',coordinates:[]}}),false));
