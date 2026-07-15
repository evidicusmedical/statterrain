import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const overlay = readFileSync('src/lib/acs/countyOverlay.ts','utf8');
const map = readFileSync('src/components/map/MapView.tsx','utf8');
const summary = readFileSync('src/components/regional-summary/RegionalSummaryPanel.tsx','utf8');
const exp = readFileSync('src/lib/export.ts','utf8');
const filters = readFileSync('src/components/filters/FilterSidebar.tsx','utf8');
const product = readFileSync('src/config/product.ts','utf8');

test('county overlay is geography-only with containing and intersecting roles',()=>{
  assert.match(overlay,/County boundaries identify whole-county geography/);
  assert.match(overlay,/"containing"/);
  assert.match(overlay,/"intersecting"/);
  assert.match(map,/county-boundary-outline/);
  assert.match(map,/county-role-/);
});

test('choropleth comparison rendering and controls are absent',()=>{
  assert.doesNotMatch(map,/MapLegend|county-comparison-card|County colors|Rank:|Range:|gradient|choropleth/i);
  assert.doesNotMatch(filters,/County metric selector|ACS layer off|County ACS comparison|population layer|choropleth/i);
  assert.match(filters,/County boundaries/);
});

test('markers, planning marker, and radius remain above noninteractive county polygons',()=>{
  assert.ok(map.indexOf('<Polygon') < map.indexOf('{showRadius'));
  assert.ok(map.indexOf('{showRadius') < map.indexOf('<CircleMarker'));
  assert.match(map,/interactive=\{false\}/);
  assert.match(map,/facility-marker/);
  assert.match(map,/planning-location-marker/);
});

test('Area Summary keeps ACS values and whole-county limitation',()=>{
  assert.match(summary,/Population context/);
  assert.match(summary,/Containing county population/);
  assert.match(summary,/Demographic and vulnerability indicators/);
  assert.match(summary,/Counties intersecting radius/);
  assert.match(summary,/They do not show population distribution within a county/);
});

test('Evidence and exports preserve ACS records and remove display-derived fields',()=>{
  assert.match(exp,/containingCounty/);
  assert.match(exp,/intersectingCounties/);
  assert.match(exp,/ACS_METRIC_ORDER/);
  for (const field of ['visualizationRole','visibleComparisonRank','visibleComparisonCount','selectedMetric','displayClass','displayStatus','Visualization mode']) assert.doesNotMatch(exp,new RegExp(field));
});

test('no browser Census API call is introduced',()=>{
  assert.doesNotMatch(map + filters,/api\.census\.gov|fetch\(/);
});

test('active version guard text updated',()=>{
  assert.match(product,/v0\.3\.8 prototype/);
});
