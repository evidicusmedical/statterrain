import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";

const source = readFileSync("src/lib/acs/demographicPercentages.ts", "utf8");
const summary = readFileSync(
  "src/components/regional-summary/RegionalSummaryPanel.tsx",
  "utf8",
);
const exportSource = readFileSync("src/lib/export.ts", "utf8");
const ca = JSON.parse(
  readFileSync(
    "data/generated/acs-county-population-national/states/CA.json",
    "utf8",
  ),
);
const county = ca.records[0];

test("demographic percentage contract uses required denominators and universes", () => {
  assert.match(
    source,
    /population_under_18:[\s\S]*universe: TOTAL_POPULATION[\s\S]*denominatorMetric: "total_population"/,
  );
  assert.match(
    source,
    /population_65_and_older:[\s\S]*universe: TOTAL_POPULATION[\s\S]*denominatorMetric: "total_population"/,
  );
  assert.match(source, /poverty_population:[\s\S]*POVERTY_UNIVERSE/);
  assert.match(
    source,
    /uninsured_population:[\s\S]*CIVILIAN_NONINSTITUTIONALIZED/,
  );
  assert.match(
    source,
    /households_no_vehicle:[\s\S]*unit: "households"[\s\S]*OCCUPIED_HOUSEHOLDS/,
  );
  assert.match(
    source,
    /disability_population:[\s\S]*CIVILIAN_NONINSTITUTIONALIZED/,
  );
  assert.match(
    source,
    /limited_english_households:[\s\S]*unit: "households"[\s\S]*LIMITED_ENGLISH_UNIVERSE/,
  );
});

test("generated ACS records already contain numerator denominator variable and status fields", () => {
  for (const id of [
    "population_under_18",
    "population_65_and_older",
    "poverty_population",
    "uninsured_population",
    "households_no_vehicle",
    "disability_population",
    "limited_english_households",
  ]) {
    const m = county.metrics[id];
    assert.notEqual(m.numerator, null, id);
    assert.notEqual(m.denominator, null, id);
    assert.ok(
      Array.isArray(m.sourceVariables) && m.sourceVariables.length > 0,
      id,
    );
    assert.ok("status" in m, id);
  }
  assert.notEqual(
    county.metrics.poverty_population.denominator,
    county.metrics.total_population.estimate,
  );
  assert.notEqual(
    county.metrics.households_no_vehicle.denominator,
    county.metrics.total_population.estimate,
  );
});

test("percentage calculation and statuses preserve missing and invalid values", () => {
  assert.match(source, /percentage = \(numerator \/ denominator\) \* 100/);
  assert.doesNotMatch(source, /sqrt|Math\.sqrt|numeratorMoe|denominatorMoe/);
  assert.match(source, /percentageStatus = "invalid-denominator"/);
  assert.match(source, /percentageStatus = "not-calculable"/);
  assert.match(source, /m\.status === "missing"/);
  assert.match(source, /m\.status === "suppressed"/);
  assert.doesNotMatch(source, /\?\? 0/);
});

test("UI and exports include percentages, raw counts, units, MOE, and whole county limitation", () => {
  assert.match(summary, /Demographic and vulnerability indicators/);
  assert.match(
    summary,
    /All values in this section describe the whole containing county/,
  );
  assert.match(summary, /metric\.unit/);
  assert.match(summary, /formatDemographicPercentage\(metric\.percentage\)/);
  assert.match(summary, /fmt\(metric\)/);
  assert.match(summary, /Count MOE/);
  assert.match(source, /<0\.1%/);
  assert.match(source, /0\.0%/);
  assert.doesNotMatch(summary, /population inside the radius/);
});

test("Evidence and CSV expose demographic percentage fields with full precision", () => {
  for (const field of [
    "percentageMarginOfError",
    "percentageStatus",
    "percentageMethod",
    "percentageSourceVariable",
    "denominator",
    "universe",
    "unit",
    "ACS release",
    "estimate period",
    "source URL",
  ]) {
    assert.match(
      exportSource,
      new RegExp(field.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")),
    );
  }
  assert.match(exportSource, /demographicPercentageMetrics/);
  assert.doesNotMatch(exportSource, /toFixed\(1\).*percentage/);
});
