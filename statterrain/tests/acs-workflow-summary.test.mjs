import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, writeFileSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { execFileSync } from 'node:child_process';
import { buildAcsWorkflowSummary } from '../scripts/public-data/write-acs-workflow-summary.mjs';

const nationalManifest = { runId:'r1', countyRecordCount:3222, partitions:Object.fromEntries(Array.from({length:52},(_,i)=>[`S${i}`,{}])), runSummary:{ statesCompleted:Array.from({length:52},(_,i)=>`S${i}`), statesFailed:[], duplicateGeoids:0, uniqueGeoids:3222, expectedGeographyContractStatus:'PASS', apiRequestCount:120, chunkMergeStatus:'PASS' }, variableChunks:[{}] };
const passStatus = { runId:'r1', requestedRelease:'2024', buildMode:'national', targetBranch:'v0.3.6-acs-county-population-generated-data', metadataValidationStatus:'PASS', probeStatus:'PASS', buildStatus:'PASS', artifactValidationStatus:'PASS', promotionStatus:'PASS', commitGateStatus:'PASS', commitEligible:true, commitStatus:'PASS', pushStatus:'PASS', committedSha:'abc1234', pushedBranch:'v0.3.6-acs-county-population-generated-data', finalWorkflowStatus:'PROMOTED AND COMMITTED', completionDeclaration:'COMPLETE — NATIONAL ACS COUNTY POPULATION BASELINE BUILT' };

test('summary writer handles valid reports and includes pushed branch and SHA', () => {
  const text = buildAcsWorkflowSummary({ status: passStatus, manifest: nationalManifest, queryabilityReport:{ estimateVariablesVerified:12, moeVariablesVerified:12, failedPairs:[] }, metadataReport:{ variableChecks:[{validationStatus:'PASS'}] } });
  assert.match(text, /PROMOTED AND COMMITTED/);
  assert.match(text, /abc1234/);
  assert.match(text, /v0\.3\.6-acs-county-population-generated-data/);
  assert.match(text, /COMPLETE — NATIONAL ACS COUNTY POPULATION BASELINE BUILT/);
});

test('summary writer handles missing optional reports', () => {
  const text = buildAcsWorkflowSummary({ status: passStatus, manifest: nationalManifest });
  assert.match(text, /Metadata variables checked: unknown/);
  assert.match(text, /Live E variables verified: unknown/);
});

test('summary writer appends markdown without exposing secrets or keyed URLs', () => {
  const dir = mkdtempSync(join(tmpdir(), 'acs-summary-'));
  const statusPath = join(dir, 'status.json');
  const manifestPath = join(dir, 'manifest.json');
  const out = join(dir, 'summary.md');
  writeFileSync(statusPath, JSON.stringify(passStatus));
  writeFileSync(manifestPath, JSON.stringify(nationalManifest));
  execFileSync(process.execPath, ['scripts/public-data/write-acs-workflow-summary.mjs', '--status-report', statusPath, '--manifest', manifestPath], { cwd: new URL('..', import.meta.url), env:{...process.env, GITHUB_STEP_SUMMARY:out, CENSUS_API_KEY:'SECRET12345678901234567890'} });
  const text = readFileSync(out, 'utf8');
  assert.doesNotMatch(text, /SECRET12345678901234567890|key=[A-Za-z0-9]{20,}/);
});
