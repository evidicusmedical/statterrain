import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const logic = readFileSync('src/lib/acs/countyComparison.ts','utf8');
const map = readFileSync('src/components/map/MapView.tsx','utf8');
const summary = readFileSync('src/components/regional-summary/RegionalSummaryPanel.tsx','utf8');
const exp = readFileSync('src/lib/export.ts','utf8');
const filters = readFileSync('src/components/filters/FilterSidebar.tsx','utf8');
const product = readFileSync('src/config/product.ts','utf8');

test('one available county selects single-county-outline mode and no comparative legend',()=>{
  assert.match(logic,/validComparableCount >= 2 \? "multi-county-comparison" : "single-county-outline"/);
  assert.match(map,/countyComparison\.legend/);
  assert.match(map,/comparative color scale is not shown/);
});

test('two or more valid counties select multi-county-comparison mode',()=>{
  assert.match(logic,/"multi-county-comparison"/);
  assert.match(logic,/validComparableCount >= 2/);
});

test('containing and intersecting county roles are explicit',()=>{
  assert.match(logic,/"containing"/);
  assert.match(logic,/"intersecting"/);
  assert.match(logic,/"loaded"/);
  assert.match(map,/county-role-/);
});

test('missing values are excluded and not converted to zero',()=>{
  assert.match(logic,/metric\.status !== "available"/);
  assert.match(logic,/return null/);
  assert.doesNotMatch(logic,/\|\| 0/);
  assert.match(logic,/displayStatus = "missing"/);
});

test('one valid value plus missing counties reverts to single-value behavior',()=>{
  assert.match(logic,/validComparableCount >= 2 \? "multi-county-comparison" : "single-county-outline"/);
});

test('equal values do not produce misleading gradient',()=>{
  assert.match(logic,/equalValues/);
  assert.match(logic,/"equal-value"/);
  assert.match(map,/all reported values are equal/);
});

test('visible rank is only among valid visible counties and not statewide or national',()=>{
  assert.match(logic,/valid\.slice\(\)\.sort/);
  assert.match(map,/Rank: .* of/);
  assert.doesNotMatch(map + logic, /statewide|national rank|peer rank/i);
});

test('county shading limitations are present without within-county or radius population claims',()=>{
  assert.match(logic,/do not represent within-county variation or population inside the radius/);
  assert.match(logic,/County-level data do not show variation within the county/);
  assert.doesNotMatch(map + logic + filters, /population within radius|radius population|service-area population|local population density/i);
});

test('markers and radius remain above noninteractive county polygons',()=>{
  assert.ok(map.indexOf('<Polygon') < map.indexOf('{showRadius'));
  assert.ok(map.indexOf('{showRadius') < map.indexOf('<CircleMarker'));
  assert.match(map,/interactive=\{false\}/);
  assert.match(map,/facility-marker/);
  assert.match(map,/planning-location-marker/);
});

test('layer-off mode removes metric fills',()=>{
  assert.match(logic,/"disabled"/);
  assert.match(logic,/mode === "disabled"/);
});

test('Area Summary county terminology remains unchanged',()=>{
  assert.match(summary,/Population context/);
  assert.match(summary,/Containing county population/);
  assert.match(summary,/Values describe the whole containing county, not the population inside the selected radius/);
});

test('Evidence records visualization mode and limitations',()=>{
  assert.match(exp,/visualization: buildCountyComparisonState/);
  assert.match(exp,/Visualization mode/);
  assert.match(exp,/County-level data do not show variation within a county/);
});

test('exports preserve raw ACS estimates and statuses and add display fields',()=>{
  assert.match(exp,/estimate/);
  assert.match(exp,/status/);
  for (const field of ['visualizationRole','visibleComparisonRank','visibleComparisonCount','selectedMetric','displayClass','displayStatus']) assert.match(exp,new RegExp(field));
});

test('no additional national partitions load for display-only purposes',()=>{
  assert.doesNotMatch(logic,/fetch\(|loadCountyBoundary|Census/i);
});

test('active version guard text updated',()=>{
  assert.match(product,/v0\.3\.7\.7 prototype/);
});
