#!/usr/bin/env node
import { appendFileSync, existsSync, readFileSync } from 'node:fs';
import { truthfulSummary, readStatus, STATUS_PATH } from './acs-workflow-gates.mjs';

const args = process.argv.slice(2);
const arg = (name, fallback = '') => {
  const i = args.indexOf(name);
  return i >= 0 ? args[i + 1] : fallback;
};
const readJson = (path) => {
  if (!path || !existsSync(path)) return null;
  return JSON.parse(readFileSync(path, 'utf8'));
};
const scrub = (text) => text
  .replace(/key=[A-Za-z0-9._-]+/gi, 'key=[redacted]')
  .replace(/CENSUS_API_KEY\s*=\s*[^\s`'"&]+/gi, 'CENSUS_API_KEY=[redacted]');

export function buildAcsWorkflowSummary({ status, manifest = null, queryabilityReport = null, metadataReport = null }) {
  const finalState = status.pushStatus === 'PASS' && status.commitStatus === 'PASS'
    ? 'PROMOTED AND COMMITTED'
    : status.promotionStatus === 'PASS' && status.commitGateStatus === 'PASS'
      ? 'VALIDATED — COMMIT PENDING'
      : 'PROVISIONAL — NOT PROMOTED OR COMMITTED';
  const base = truthfulSummary({ status, manifest, provisional: finalState.startsWith('PROVISIONAL') });
  const query = queryabilityReport || {};
  const checks = metadataReport?.variableChecks || [];
  const failed = checks.filter((check) => check.validationStatus === 'FAIL');
  return scrub(`${base}
## ACS workflow final status
- Validated: ${status.artifactValidationStatus === 'PASS' ? 'PASS' : status.artifactValidationStatus || 'UNKNOWN'}
- Promoted: ${status.promotionStatus || 'UNKNOWN'}
- Commit eligible: ${status.commitGateStatus || (status.commitEligible ? 'PASS' : 'UNKNOWN')}
- Committed: ${status.commitStatus || 'UNKNOWN'}
- Pushed: ${status.pushStatus || 'UNKNOWN'}
- Commit SHA: ${status.committedSha || 'not committed'}
- Pushed branch: ${status.pushedBranch || 'not pushed'}
- Final workflow status: ${status.finalWorkflowStatus || finalState}
- Declaration: ${status.completionDeclaration || 'unknown'}

## ACS gate reports
- Metadata variables checked: ${checks.length || 'unknown'}
- Metadata variables failed: ${checks.length ? failed.length : 'unknown'}
- Live E variables verified: ${query.estimateVariablesVerified ?? 'unknown'}
- Live M variables verified: ${query.moeVariablesVerified ?? 'unknown'}
- Failed E/M pairs: ${(query.failedPairs || []).length}
- Variable chunks: ${(manifest?.variableChunks || []).length || 'unknown'}
- Chunk requests: ${manifest?.runSummary?.apiRequestCount ?? 'unknown'}
- Merge status: ${manifest?.runSummary?.chunkMergeStatus ?? 'unknown'}

${finalState}
`);
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const status = readJson(arg('--status-report', STATUS_PATH)) || readStatus();
  const summary = buildAcsWorkflowSummary({
    status,
    manifest: readJson(arg('--manifest')),
    queryabilityReport: readJson(arg('--queryability-report')),
    metadataReport: readJson(arg('--metadata-report')),
  });
  if (process.env.GITHUB_STEP_SUMMARY) appendFileSync(process.env.GITHUB_STEP_SUMMARY, summary);
  else console.log(summary);
}
