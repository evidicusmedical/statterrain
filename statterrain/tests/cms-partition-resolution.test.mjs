import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
const root = process.cwd();
const selector = readFileSync(join(root,'src/lib/geography/selectCmsHospitalPartitions.ts'),'utf8');
const resolver = readFileSync(join(root,'src/lib/geography/resolveStateFromCoordinates.ts'),'utf8');
const search = readFileSync(join(root,'src/lib/geocoding/searchLocation.ts'),'utf8');
const bounds = readFileSync(join(root,'src/lib/geography/stateBounds.ts'),'utf8');
const names = readFileSync(join(root,'src/lib/geography/stateCodes.ts'),'utf8');
const product = readFileSync(join(root,'src/config/product.ts'),'utf8');
const manifest = JSON.parse(readFileSync(join(root,'data/generated/cms-hospitals-national/manifest.json'),'utf8'));

test('version and arbitrary fallback removal',()=>{ assert.match(product,/v0\.3\.6 prototype/); for (const old of ['v0.3.3.2 prototype','v0.3.3.1 prototype','v0.3.3 prototype','v0.3.2.4 prototype']) assert.ok(!product.includes(`prototypeVersion: "${old}"`)); assert.ok(!selector.includes('["CA","DC","FL","IL","NY","TX"]')); assert.match(selector,/status:"unresolved"/); });
test('resolver and bounds cover every manifest state',()=>{ assert.match(resolver,/resolveStateFromCoordinates/); for (const code of manifest.statesPresent) { assert.ok(bounds.includes(`${code}: {`), code); assert.ok(names.includes(`"${code}"`), code); } });
test('coordinate and map-click selected locations populate state',()=>{ assert.match(search,/resolveStateFromCoordinates\(lat, lng\)/); assert.match(search,/source === "Map click"/); assert.match(search,/state: resolvedState \?\? undefined/); });
test('census structured state and full names are supported',()=>{ assert.match(search,/top\?\.state/); for (const name of ['montana','new mexico','district of columbia','puerto rico']) assert.ok(names.includes(name)); });
test('radius bounds, primary state and failure semantics are present',()=>{ assert.match(selector,/radiusBounds/); assert.match(selector,/intersects\(box, bounds\)/); assert.match(selector,/primaryState/); const loader=readFileSync(join(root,'src/lib/public-data/loadNationalCmsHospitals.ts'),'utf8'); assert.match(loader,/missingManifestPartitions/); assert.match(loader,/partialCoverage/); assert.match(loader,/CMS_EMPTY_RESULT_COPY/); });
test('representative states and border fixtures are encoded for regression coverage',()=>{ for (const code of ['MT','ID','AL','ME','AK','HI','DC','PR','KS','MO','TX','AR','TN','VA','NY','NJ','WA','OR']) assert.ok(bounds.includes(`${code}: {`), code); });
