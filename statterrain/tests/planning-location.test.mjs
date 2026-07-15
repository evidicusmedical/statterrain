import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
const root = process.cwd();
const product = readFileSync(join(root,'src/config/product.ts'),'utf8');
const search = readFileSync(join(root,'src/lib/geocoding/searchLocation.ts'),'utf8');
const state = readFileSync(join(root,'src/hooks/useAppState.ts'),'utf8');
const page = readFileSync(join(root,'src/app/page.tsx'),'utf8');
const map = readFileSync(join(root,'src/components/map/MapView.tsx'),'utf8');

test('version is v0.3.7.7 prototype',()=>assert.match(product,/prototypeVersion: "v0\.3\.7\.7 prototype"/));
test('search modes create canonical PlanningLocation',()=>{
  assert.match(search,/planningLocation: PlanningLocation/);
  assert.match(search,/"address-search"/);
  assert.match(search,/"place-search"/);
  assert.match(search,/"coordinate-search"/);
  assert.match(search,/parseCoordinateSearch/);
  assert.match(search,/Invalid coordinates/);
});
test('single planning setter feeds search and map click',()=>{
  assert.match(state,/function setPlanningLocation\(/);
  assert.match(state,/setPlanningLocationState\(next\)/);
  assert.match(page,/state\.setPlanningLocation\(result\.location\.planningLocation, result\.location\)/);
  assert.match(page,/state\.setPlanningLocation\(location\.planningLocation, location\)/);
});
test('planning marker and recenter use selected coordinates',()=>{
  assert.match(map,/Recenter lat=\{location\.lat\} lng=\{location\.lng\}/);
  assert.match(map,/search-location-marker/);
  assert.match(map,/Selected location:/);
});
test('analysis is radius-aware without click fallback',()=>{
  assert.match(state,/selectCmsHospitalPartitionResult\(\{ lat: location\.lat, lng: location\.lng, radiusMiles/);
  assert.match(state,/filterFacilitiesByRadius\(cmsLoad\.facilities, location\.lat, location\.lng, radiusMiles\)/);
  assert.doesNotMatch(search,/synthetic fallback/i);
});
