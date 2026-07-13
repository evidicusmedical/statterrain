import test from 'node:test';import assert from 'node:assert/strict';import {readFileSync} from 'node:fs';
const y=readFileSync('../.github/workflows/county-boundary-national-build.yml','utf8');
const summary=readFileSync('scripts/public-data/write-county-boundary-workflow-summary.mjs','utf8');

test('workflow has exact manual trigger schema and no automatic triggers',()=>{
  assert.equal((y.match(/^name: County Boundary National Build$/gm)||[]).length,1);
  assert.match(y,/^on:\n  workflow_dispatch:/m);
  assert.doesNotMatch(y,/^  push:/m);
  assert.doesNotMatch(y,/^  pull_request:/m);
  assert.match(y,/contents: write/);
});

test('workflow avoids risky expressions and undefined outputs',()=>{
  assert.doesNotMatch(y,/!inputs/);
  assert.doesNotMatch(y,/inputs\.commit_generated_artifacts\s*&&/);
  assert.doesNotMatch(y,/steps\.[^.]+\.outputs\./);
  assert.doesNotMatch(y,/\$\{\{[^}]+\}\}[^\n]*`|`[^\n]*\$\{\{[^}]+\}\}/);
  assert.doesNotMatch(y,/node - <<'NODE' >> "\$GITHUB_STEP_SUMMARY"/);
});

test('workflow guards inputs with shell environment variables',()=>{
  assert.match(y,/TARGET_BRANCH: \$\{\{ inputs\.target_branch \}\}/);
  assert.match(y,/BOUNDARY_VINTAGE: \$\{\{ inputs\.boundary_vintage \}\}/);
  assert.match(y,/COMMIT_GENERATED_ARTIFACTS: \$\{\{ inputs\.commit_generated_artifacts \}\}/);
  assert.match(y,/AUTO_MERGE: \$\{\{ inputs\.auto_merge \}\}/);
  assert.match(y,/if \[ "\$AUTO_MERGE" != "false" \]; then/);
  assert.match(y,/if \[ "\$TARGET_BRANCH" = "main" \] \|\| \[ "\$TARGET_BRANCH" = "master" \]; then/);
});

test('application run steps use explicit statterrain working directory',()=>{
  assert.doesNotMatch(y,/defaults:\n\s+run:\n\s+working-directory:/);
  for (const name of ['npm ci','Verify county boundary runtime dependencies','Generate boundaries','Validate manifest and report','Commit and push when requested','Write final summary']) {
    const step = y.slice(y.indexOf(`- name: ${name}`), y.indexOf('\n\n', y.indexOf(`- name: ${name}`)));
    assert.match(step,/working-directory: statterrain/);
  }
});

test('summary script uses environment values and completion declaration',()=>{
  assert.match(y,/node scripts\/public-data\/write-county-boundary-workflow-summary\.mjs/);
  assert.match(summary,/process\.env\.BOUNDARY_VINTAGE/);
  assert.match(summary,/process\.env\.COMMIT_STATUS/);
  assert.match(summary,/process\.env\.PUSH_STATUS/);
  assert.match(summary,/COMPLETE — COUNTY BOUNDARY WORKFLOW VALID AND MANUALLY RUNNABLE/);
});
