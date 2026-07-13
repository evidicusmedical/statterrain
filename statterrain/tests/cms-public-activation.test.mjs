import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, writeFileSync, readFileSync, rmSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { spawnSync } from 'node:child_process';

const root = process.cwd();

test('version is v0.3.7.5 prototype and rejects old patch versions', () => {
  const product = readFileSync(join(root, 'src/config/product.ts'), 'utf8');
  assert.match(product, /prototypeVersion: "v0\.3\.7\.5 prototype"/);
  for (const old of ['v0.3.4 prototype','v0.3.3.3 prototype','v0.3.3.2 prototype','v0.3.3.1 prototype','v0.3.3 prototype','v0.3.2.4 prototype']) assert.ok(!product.includes(`prototypeVersion: "${old}"`));
});


test('normal controls and legend are source-aligned and synthetic controls are developer-only', () => {
  const filters = readFileSync(join(root, 'src/components/filters/FilterSidebar.tsx'), 'utf8');
  const legend = readFileSync(join(root, 'src/components/map/MapLegend.tsx'), 'utf8');
  const appState = readFileSync(join(root, 'src/hooks/useAppState.ts'), 'utf8');
  const header = readFileSync(join(root, 'src/components/layout/Header.tsx'), 'utf8');
  assert.ok(!filters.includes('Synthetic demo categories'));
  assert.ok(!filters.includes('Include all demonstration records'));
  assert.ok(!filters.includes('Source confidence display'));
  assert.ok(!filters.includes('Show facility labels'));
  assert.ok(!filters.includes('Show freshness badges'));
  assert.ok(legend.includes('Hospital'));
  assert.ok(legend.includes('Selected planning location'));
  assert.ok(legend.includes('Planning-radius boundary'));
  assert.ok(!legend.includes('Critical Access Hospital'));
  assert.ok(filters.includes('Normal mode shows source-backed CMS hospital controls only.'));
  assert.ok(legend.includes('CMS hospital markers are source-backed public records.'));
  assert.ok(!legend.includes('"pharmacy"'));
  assert.ok(!legend.includes('"dialysis"'));
  assert.ok(appState.includes('const ALL_FACILITY_TYPES: FacilityType[] = ["hospital"];'));
  assert.ok(!header.includes('SyntheticBadge'));
});

test('summary-hidden workspace removes interactive summary and invalidates map size', () => {
  const page = readFileSync(join(root, 'src/app/page.tsx'), 'utf8');
  const map = readFileSync(join(root, 'src/components/map/MapView.tsx'), 'utf8');
  assert.ok(page.includes('{(summaryOpen || mobileTab === "summary") && ('));
  assert.ok(page.includes('lg:pointer-events-none'));
  assert.ok(page.includes('aria-hidden={!summaryOpen && mobileTab !== "summary"}'));
  assert.ok(page.includes('inert={!summaryOpen && mobileTab !== "summary" ? true : undefined}'));
  assert.ok(page.includes('lg:grid-cols-[minmax(0,1fr)]'));
  assert.ok(map.includes('map.invalidateSize()'));
  assert.ok(map.includes('layoutKey?: string'));
});

test('sync script copies manifest and fixture partitions without altering source', () => {
  const dir = mkdtempSync(join(tmpdir(), 'cms-sync-'));
  const source = join(dir, 'source'); const dest = join(dir, 'dest'); mkdirSync(join(source, 'states'), { recursive:true });
  const manifest = { sourceName:'CMS Hospital General Information', retrievedAt:'2026-07-10T00:00:00Z', mapReadyRecords:2, statesPresent:['CA','NY'], partitions:[{state:'NY', path:'states/NY.json', recordCount:1}, {state:'CA', path:'states/CA.json', recordCount:1}] };
  writeFileSync(join(source, 'manifest.json'), JSON.stringify(manifest)); writeFileSync(join(source, 'summary.json'), JSON.stringify(manifest));
  writeFileSync(join(source, 'states/CA.json'), JSON.stringify({records:[{id:'1'}]})); writeFileSync(join(source, 'states/NY.json'), JSON.stringify({records:[{id:'2'}]}));
  const before = readFileSync(join(source, 'manifest.json'), 'utf8');
  const r = spawnSync(process.execPath, [join(root, 'scripts/public-data/sync-national-cms-hospital-public-assets.mjs'), `--source=${source}`, `--dest=${dest}`], { cwd: root, encoding:'utf8' });
  assert.equal(r.status, 0, r.stderr);
  assert.match(r.stdout, /2 partitions copied/);
  assert.ok(existsSync(join(dest, 'manifest.json'))); assert.ok(existsSync(join(dest, 'states/CA.json'))); assert.ok(existsSync(join(dest, 'states/NY.json')));
  assert.equal(readFileSync(join(source, 'manifest.json'), 'utf8'), before);
  rmSync(dir, { recursive:true, force:true });
});

test('sync destination is git ignored', () => {
  const ignored = spawnSync('git', ['check-ignore', 'public/generated/cms-hospitals-national/manifest.json'], { cwd: root, encoding:'utf8' });
  assert.equal(ignored.status, 0, ignored.stderr);
});

test('loader fetches manifest, requested partitions only, deduplicates, and reports partial failure', async () => {
  const mod = await import(`file://${join(root, 'src/lib/public-data/loadNationalCmsHospitals.ts')}`);
  const calls = [];
  const fetcher = async (url) => { calls.push(String(url)); if (String(url).endsWith('/manifest.json')) return { ok:true, json:async()=>({ sourceName:'CMS', retrievedAt:'2026-07-10T00:00:00Z', mapReadyRecords:3, statesPresent:['CA','NY','TX'], partitions:[{state:'CA', publicPath:'/base/states/CA.json', recordCount:2},{state:'NY', publicPath:'/base/states/NY.json', recordCount:1},{state:'TX', publicPath:'/base/states/TX.json', recordCount:1}] }) }; if (String(url).endsWith('/CA.json')) return { ok:true, json:async()=>({records:[{id:'1', name:'A', latitude:34, longitude:-118, sourceFacilityId:'1'},{id:'1', name:'A dup', latitude:34, longitude:-118, sourceFacilityId:'1'}]})}; return {ok:false, status:500, json:async()=>({})}; };
  const result = await mod.loadNationalCmsHospitals({ partitionCodes:['CA','TX'], fetcher, basePath:'/base' });
  assert.equal(result.status, 'partial-failure'); assert.equal(result.facilities.length, 1); assert.deepEqual(result.loadedPartitions, ['CA']); assert.ok(result.errors.length);
  assert.ok(calls.some(c => c.endsWith('/manifest.json'))); assert.ok(calls.some(c => c.endsWith('/CA.json'))); assert.ok(calls.some(c => c.endsWith('/TX.json'))); assert.ok(!calls.some(c => c.endsWith('/NY.json')));
});

test('haversine filtering respects radius and does not expose synthetic capability values', async () => {
  const { filterFacilitiesByRadius } = await import(`file://${join(root, 'src/lib/public-data/loadNationalCmsHospitals.ts')}`);
  const base = { id:'cms-1', name:'A', facilityType:'hospital', lat:34, lng:-118, address:'x', distanceMiles:0, criticalAccess:false, capabilities:[], sourceIds:['1'], freshness:'current', confidence:'high', limitations:[], isSynthetic:false };
  const near = filterFacilitiesByRadius([base, {...base, id:'cms-2', sourceIds:['2'], lat:40}], 34, -118, 50);
  assert.equal(near.length, 1); assert.equal(near[0].capabilities.length, 0); assert.equal(near[0].isSynthetic, false);
});

test('initial application code does not statically import all national partitions or active preview toggle', () => {
  const app = readFileSync(join(root, 'src/hooks/useAppState.ts'), 'utf8') + readFileSync(join(root, 'src/app/page.tsx'), 'utf8');
  assert.ok(!app.includes('states/CA.json'));
  assert.ok(!app.includes('getPreviewCmsHospitalFacilities'));
  assert.ok(!app.includes('setPublicDataPreviewEnabled(false)'));
});
