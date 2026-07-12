import test from 'node:test';
import assert from 'node:assert/strict';
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';
const root = process.cwd();
const skip = new Set(['node_modules','.next','.git','playwright-report','test-results']);
function files(dir){ return readdirSync(dir).flatMap(n=>{ if(skip.has(n)) return []; const p=join(dir,n); const st=statSync(p); return st.isDirectory()?files(p):[p]; });}

test('Census API key remains server/workflow secret only', () => {
  const all = files(root).filter(f=>/\.(ts|tsx|js|mjs|md|json|ya?ml|gitignore)$/.test(f) && !f.endsWith('tests/census-secret-safety.test.mjs'));
  for (const f of all) {
    const text = readFileSync(f,'utf8');
    assert.doesNotMatch(text, /NEXT_PUBLIC_CENSUS_API_KEY/, f);
    assert.doesNotMatch(text, /echo\s+["']?\$CENSUS_API_KEY/, f);
    if (/src\/.+\.(tsx|ts)$/.test(f)) assert.doesNotMatch(text, /process\.env\.CENSUS_API_KEY/, f);
    assert.doesNotMatch(text, /api\.census\.gov\/data\/[^\s"']*\?[^\s"']*key=[A-Za-z0-9]{20,}/, f);
  }
  const docs = readFileSync(join(root,'docs/CENSUS_API_ACCESS.md'),'utf8');
  assert.match(docs, /CENSUS_API_KEY/);
  assert.match(docs, /\$\{\{ secrets\.CENSUS_API_KEY \}\}/);
});
