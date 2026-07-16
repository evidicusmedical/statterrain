import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const summary = await readFile(new URL("../src/components/regional-summary/RegionalSummaryPanel.tsx", import.meta.url), "utf8");
const evidence = await readFile(new URL("../src/components/evidence/EvidenceBriefDrawer.tsx", import.meta.url), "utf8");
const page = await readFile(new URL("../src/app/page.tsx", import.meta.url), "utf8");

test("summary presents the required hierarchy and readable comparisons", () => {
  const labels = ["Planning area", "Hospitals", "Population context", "Demographic and vulnerability indicators", "Data sources", "Research limitations"];
  let previous = -1;
  for (const label of labels) { const index = summary.indexOf(`>${label}<`); assert.ok(index > previous, `${label} follows the previous section`); previous = index; }
  for (const label of ["County", "United States", "Difference", "percentage points", "View estimate details", "Margin of error"]) assert.match(summary, new RegExp(label));
  assert.ok(summary.indexOf("Under age 18") < summary.indexOf("Age 18 to 64"));
});

test("evidence has ordered human-readable sections and explicit exports", () => {
  const labels = ["Research area", "Facility results", "Population context", "Demographic context", "Data sources", "Methods", "Limitations", "Export options"];
  let previous = -1;
  for (const label of labels) { const index = evidence.indexOf(`>${label}<`); assert.ok(index > previous, `${label} follows the previous section`); previous = index; }
  for (const label of ["Download Evidence JSON", "Download hospital CSV", "Download county demographic CSV", "Download county demographic JSON"]) assert.match(evidence, new RegExp(label));
});

test("first-use guidance is dismissible and local", () => {
  assert.match(page, /How to use StatTerrain/);
  assert.match(page, /statterrain-how-to-use-dismissed/);
  assert.match(page, /Dismiss How to use StatTerrain/);
});
