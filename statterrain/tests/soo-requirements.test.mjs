import test from "node:test";
import assert from "node:assert/strict";
import { SOO_REGISTRY_VERSION, getTraceabilitySummary, selectRelevantRequirements, sooRequirements, validateSooRequirements } from "../src/config/sooRequirements.ts";
test("SOO requirements registry is valid and complete", () => {
  assert.deepEqual(validateSooRequirements(), []);
  assert.equal(sooRequirements.length, 30);
  assert.equal(SOO_REGISTRY_VERSION, "v0.3.9.1 prototype");
  assert.equal(sooRequirements.find((r) => r.id === "ST-SOO-006")?.status, "data-dependent");
  assert.equal(sooRequirements.find((r) => r.id === "ST-SOO-021")?.status, "out-of-scope");
  assert.equal(sooRequirements.find((r) => r.id === "ST-SOO-027")?.status, "data-dependent");
});
test("summary and current-analysis relevance are calculated", () => {
  const summary = getTraceabilitySummary();
  assert.equal(summary.total, sooRequirements.length);
  assert.ok(summary.byStatus.supported > 0);
  assert.ok(summary.ahaDependent.includes("ST-SOO-027"));
  const relevant = selectRelevantRequirements({ hasHospitals: true, hasCountyContext: true, hasNationalBenchmark: true, hasEvidence: true });
  assert.ok(relevant.relevantRequirementIds.includes("ST-SOO-004"));
  assert.ok(relevant.futureDependencyIds.includes("ST-SOO-006"));
});
