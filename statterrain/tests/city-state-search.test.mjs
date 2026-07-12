import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { loadClassifier } from './helpers/load-search-strategy.mjs';

const route = readFileSync(new URL('../src/app/api/geocode/route.ts', import.meta.url), 'utf8');
const search = readFileSync(new URL('../src/lib/geocoding/searchLocation.ts', import.meta.url), 'utf8');

test('city/state classifier executes and route uses Census TIGERweb place strategy', async () => {
  const { classifyGeocodeSearchQuery } = await loadClassifier();
  for (const input of ['Washington, DC','Richmond, VA','Toledo, OH','Ann Arbor, MI','Toledo, Ohio','Ann Arbor, Michigan']) {
    assert.equal(classifyGeocodeSearchQuery(input).strategy, 'city-state', input);
  }
  assert.match(route, /Places_CouSub_ConCity_SubMCD/);
  assert.match(route, /resolvePlace/);
  assert.match(route, /representative geographic point/);
  assert.match(search, /resolvedGeographyType/);
  assert.match(search, /City found/);
});
