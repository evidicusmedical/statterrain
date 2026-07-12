import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
const workflow = readFileSync('../.github/workflows/acs-county-population-national-build.yml','utf8');
const index = (name) => workflow.indexOf(`- name: ${name}`);

test('workflow contains no node -e command with shell-interpolated template syntax', () => {
  assert.doesNotMatch(workflow, /node\s+-e[\s\S]*\$\{/);
});

test('summary failure cannot block commit', () => {
  assert.match(workflow, /Write final ACS workflow summary[\s\S]*continue-on-error: true/);
  assert.ok(index('Commit generated artifacts') < index('Write final ACS workflow summary'));
});

test('commit and push occur before final summary', () => {
  assert.ok(index('Commit generated artifacts') < index('Push target branch'));
  assert.ok(index('Push target branch') < index('Write final ACS workflow summary'));
});
