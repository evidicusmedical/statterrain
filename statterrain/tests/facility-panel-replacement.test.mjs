import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";

const root = new URL("..", import.meta.url).pathname;
const page = readFileSync(join(root, "src/app/page.tsx"), "utf8");
const details = readFileSync(join(root, "src/components/facilities/FacilityDetailPanel.tsx"), "utf8");

test("single-panel replacement model preserves summary preference", () => {
  assert.match(page, /summaryPreference/);
  assert.match(page, /activePanel/);
  assert.match(page, /if \(state\.selectedFacility\) return "facility"/);
  assert.match(page, /summaryPreference === "shown" \? "summary" : "none"/);
  assert.match(page, /data-testid="right-side-panel"/);
  assert.doesNotMatch(page, /FacilityDetailPanel facility=\{state\.selectedFacility\} \/>\s*<\/section>/);
  assert.match(page, /state\.clearSelectedFacility\(\)/);
  assert.match(page, /summaryPreference === "shown" \? "summary" : "map"/);
});

test("facility details are accessible and do not include unsupported capability paragraph", () => {
  assert.match(details, /Facility Details/);
  assert.match(details, /tabIndex=\{-1\}/);
  assert.match(details, /Close details/);
  assert.match(details, /event\.key === "Escape"/);
  assert.doesNotMatch(details, /Unsupported capability filters are hidden until validated public source mappings are available/);
  assert.doesNotMatch(details, /Trauma, stroke, STEMI\/PCI, bed availability, diversion/);
  assert.match(details, /Missing public data must not be treated as absence of capability/);
});
