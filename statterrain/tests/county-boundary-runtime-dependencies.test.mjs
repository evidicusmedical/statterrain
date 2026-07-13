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

test('package manifest declares shapefile and file-source runtime dependencies', () => {
  assert.equal(packageJson.dependencies.shapefile, '^0.6.6');
  assert.equal(packageJson.dependencies['file-source'], '^0.6.1');
});

test('package lock contains shapefile and complete runtime chain', () => {
  assert.equal(packageLock.packages[''].dependencies.shapefile, '^0.6.6');
  assert.equal(packageLock.packages[''].dependencies['file-source'], '^0.6.1');
  for (const packageName of ['shapefile', 'array-source', 'commander', 'path-source', 'file-source', 'slice-source', 'stream-source', 'text-encoding']) {
    assert.ok(packageLock.packages[`node_modules/${packageName}`], `expected package-lock entry for ${packageName}`);
  }
});

test('county boundary build script runtime imports are declared dependencies', () => {
  assert.deepEqual(externalRuntimeImports, ['shapefile']);
  for (const specifier of externalRuntimeImports) assert.ok(declaredRuntimeDependencies.has(specifier), `${specifier} must be in dependencies`);
});

test('shapefile runtime chain declares the proven file-source package', () => {
  assert.equal(packageLock.packages['node_modules/path-source'].version, '0.1.3');
  assert.equal(packageLock.packages['node_modules/file-source'].version, '0.6.1');
  assert.equal(packageLock.packages['node_modules/file-source'].dependencies['stream-source'], '0.3');
  assert.ok(declaredRuntimeDependencies.has('file-source'));
});

test('workflow uses npm ci before dependency preflight and never dynamically installs packages', () => {
  assert.ok(workflow.indexOf('run: npm ci') < workflow.indexOf('- name: Verify county boundary runtime dependencies'));
  assert.ok(workflow.indexOf('- name: Verify county boundary runtime dependencies') < workflow.indexOf('- name: Generate boundaries'));
  assert.doesNotMatch(workflow, /npm\s+(install|i|add)\b/);
});

test('workflow includes npm ls runtime-chain command and verifies shapefile.open', () => {
  assert.match(workflow, /npm ls shapefile path-source file-source/);
  assert.match(workflow, /typeof m\.open !== 'function'/);
  assert.match(workflow, /shapefile runtime chain available/);
});

test('node_modules is not tracked by git', () => {
  const trackedNodeModules = execFileSync('git', ['ls-files', 'node_modules', '*/node_modules/*'], { cwd: '..', encoding: 'utf8' }).trim();
  assert.equal(trackedNodeModules, '');
});
