import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const route = readFileSync(new URL('../src/app/api/geocode/route.ts', import.meta.url), 'utf8');
test('geocode route is same-origin normalizer with timeout and no raw proxy', () => {
  assert.match(route, /onelineaddress/);
  assert.match(route, /AbortController/);
  assert.match(route, /Cache-Control.*no-store/s);
  assert.match(route, /status: "found"|"found"/);
  assert.doesNotMatch(route, /searchParams\.get\(["']url/);
});
