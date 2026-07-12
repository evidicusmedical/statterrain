import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { parseCoordinateSearch } from '../src/lib/geocoding/coordinates.ts';

const search = readFileSync(new URL('../src/lib/geocoding/searchLocation.ts', import.meta.url), 'utf8');
test('coordinates parse locally and invalid coordinates reject', () => {
  assert.deepEqual(parseCoordinateSearch('38.8977 -77.0365'), { lat: 38.8977, lng: -77.0365 });
  assert.deepEqual(parseCoordinateSearch('38.8977, -77.0365'), { lat: 38.8977, lng: -77.0365 });
  assert.equal(parseCoordinateSearch('999, 999'), 'invalid');
});
test('address search uses same-origin route while coordinate path returns before fetch', () => {
  assert.match(search, /parseCoordinateSearch\(clean\)/);
  assert.match(search, /if \(parsedCoordinates\) \{[\s\S]*return \{ status: "found"/);
  assert.match(search, /fetcher\(`\/api\/geocode\?\$\{params\.toString\(\)\}`/);
  assert.doesNotMatch(search, /geocoding\.geo\.census\.gov\/geocoder\/locations\/onelineaddress/);
});
