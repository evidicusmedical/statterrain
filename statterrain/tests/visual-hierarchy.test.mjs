import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const summary = readFileSync("src/components/regional-summary/RegionalSummaryPanel.tsx", "utf8");
const presentation = readFileSync("src/lib/acs/estimatePresentation.ts", "utf8");

test("county-first comparison classes retain explicit accessible labels", () => {
  assert.match(summary, /label="County"/);
  assert.match(summary, /label="United States"/);
  assert.match(summary, /label="Difference"/);
  assert.match(summary, /countyValue/);
  assert.match(summary, /secondaryValue/);
  assert.match(presentation, /countyValue: "font-semibold/);
  assert.match(presentation, /secondaryValue: "font-normal/);
  assert.match(presentation, /supporting: "font-normal/);
  assert.match(summary, /\{fmt\(metric\)\} \{metric\.unit\}/);
});
