import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { loadClassifier } from './helpers/load-search-strategy.mjs';

const route = readFileSync(new URL('../src/app/api/geocode/route.ts', import.meta.url), 'utf8');
const search = readFileSync(new URL('../src/lib/geocoding/searchLocation.ts', import.meta.url), 'utf8');

test('ZIP classifier executes and route uses Census TIGERweb ZIP/ZCTA strategy', async () => {
  const { classifyGeocodeSearchQuery } = await loadClassifier();
  for (const input of ['20500','23219','43604','48104','20500-0003']) assert.equal(classifyGeocodeSearchQuery(input).strategy, 'zip', input);
  assert.match(route, /tigerWMS_ACS2022/);
  assert.match(route, /resolveZip/);
  assert.match(route, /area-derived reference point/);
  assert.match(search, /ZIP area found/);
});
