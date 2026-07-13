import test from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';

const packageJson = JSON.parse(readFileSync('package.json', 'utf8'));
const packageLock = JSON.parse(readFileSync('package-lock.json', 'utf8'));
const buildScript = readFileSync('scripts/public-data/build-county-boundaries.mjs', 'utf8');
const workflow = readFileSync('../.github/workflows/county-boundary-national-build.yml', 'utf8');

const nodeBuiltinPrefixes = ['node:'];
const declaredRuntimeDependencies = new Set(Object.keys(packageJson.dependencies || {}));
const externalRuntimeImports = [...buildScript.matchAll(/import\(['"]([^'"]+)['"]\)/g)]
  .map(([, specifier]) => specifier)
  .filter((specifier) => !nodeBuiltinPrefixes.some((prefix) => specifier.startsWith(prefix)) && !specifier.startsWith('.') && !specifier.startsWith('/'));

test('package manifest declares shapefile as a runtime dependency', () => {
  assert.equal(packageJson.dependencies.shapefile, '^0.6.6');
});

test('package lock contains shapefile and transitive runtime dependencies', () => {
  assert.equal(packageLock.packages[''].dependencies.shapefile, '^0.6.6');
  for (const packageName of ['shapefile', 'array-source', 'commander', 'path-source', 'slice-source', 'stream-source', 'text-encoding']) {
    assert.ok(packageLock.packages[`node_modules/${packageName}`], `expected package-lock entry for ${packageName}`);
  }
});

test('county boundary build script runtime imports are declared dependencies', () => {
  assert.deepEqual(externalRuntimeImports, ['shapefile']);
  for (const specifier of externalRuntimeImports) assert.ok(declaredRuntimeDependencies.has(specifier), `${specifier} must be in dependencies`);
});

test('workflow uses npm ci before build and never dynamically installs packages', () => {
  assert.ok(workflow.indexOf('run: npm ci') < workflow.indexOf('run: node scripts/public-data/build-county-boundaries.mjs --national --reject-incomplete'));
  assert.doesNotMatch(workflow, /npm\s+(install|i|add)\b/);
});

test('workflow includes shapefile import preflight after npm ci', () => {
  const npmCiIndex = workflow.indexOf('- name: npm ci');
  const preflightIndex = workflow.indexOf('- name: Verify county boundary runtime dependencies');
  const buildIndex = workflow.indexOf('- name: Generate boundaries');
  assert.ok(npmCiIndex >= 0 && preflightIndex > npmCiIndex && buildIndex > preflightIndex);
  assert.match(workflow, /node -e "import\('shapefile'\)\.then\(\(\)=>console\.log\('shapefile dependency available'\)\)"/);
});

test('node_modules is not tracked by git', () => {
  const trackedNodeModules = execFileSync('git', ['ls-files', 'node_modules', '*/node_modules/*'], { cwd: '..', encoding: 'utf8' }).trim();
  assert.equal(trackedNodeModules, '');
});
