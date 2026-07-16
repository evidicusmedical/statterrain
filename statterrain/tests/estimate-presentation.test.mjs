import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const summary = readFileSync("src/components/regional-summary/RegionalSummaryPanel.tsx", "utf8");
const presentation = readFileSync("src/lib/acs/estimatePresentation.ts", "utf8");
const exported = readFileSync("src/lib/export.ts", "utf8");

test("public estimate disclosures use plain language while exports retain technical fields", () => {
  for (const text of ["About this estimate", "United States comparison"]) assert.match(summary, new RegExp(text));
  assert.match(presentation, /Group measured/);
  for (const text of ["Universe and margins", "County universe", "Benchmark universe"]) assert.doesNotMatch(summary, new RegExp(text));
  assert.match(presentation, /Math\.round\(value\)\.toLocaleString/);
  assert.match(presentation, /percentage points/);
  assert.match(presentation, /county-unavailable|benchmark-unavailable|universe-mismatch/);
  assert.match(exported, /benchmarkUniverse|universe|comparisonStatus|percentageMarginOfError/);
});

test("matching definitions are summarized once and derived age details remain clear", () => {
  assert.match(presentation, /same \$\{kind\} definition/);
  assert.match(presentation, /different \$\{kind\} definitions/);
  assert.match(summary, /Not available for this derived age group/);
  assert.match(summary, /Calculated from total population minus under age 18 minus age 65 and older/);
  assert.match(summary, /Working-age context/);
});
