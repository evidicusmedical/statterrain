import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";

const root = new URL("..", import.meta.url).pathname;
const read = (p) => readFileSync(join(root, p), "utf8");

test("county choropleth controls and legend are removed while boundary overlay remains", () => {
  const filter = read("src/components/filters/FilterSidebar.tsx");
  const map = read("src/components/map/MapView.tsx");
  assert.doesNotMatch(filter, /County metric selector|ACS layer off|County ACS comparison|choropleth/i);
  assert.doesNotMatch(map, /MapLegend|county-comparison-card|County colors|visibleMin|containingCountyRank/);
  assert.match(filter, /County boundaries/);
  assert.match(map, /county-boundary-outline/);
  assert.match(map, /facility-marker/);
  assert.match(map, /planning-location-marker/);
  assert.match(map, /<Circle\s/);
});

test("exports preserve ACS records and remove display-derived metadata", () => {
  const source = read("src/lib/export.ts");
  assert.match(source, /containingCounty/);
  assert.match(source, /intersectingCounties/);
  assert.match(source, /ACS_METRIC_ORDER/);
  for (const obsolete of ["visibleComparisonRank", "visibleComparisonCount", "displayClass", "choroplethMode", "colorClass", "legendRange", "visibleMin", "visibleMax", "Visualization mode"]) {
    assert.doesNotMatch(source, new RegExp(obsolete));
  }
});

