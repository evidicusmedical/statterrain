import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const page = readFileSync(new URL('../src/app/page.tsx', import.meta.url), 'utf8');
const state = readFileSync(new URL('../src/hooks/useAppState.ts', import.meta.url), 'utf8');
test('successful search uses canonical planning-location transaction and clears selected facility', () => {
  assert.match(page, /state\.setPlanningLocation\(result\.location\.planningLocation, result\.location\)/);
  assert.match(state, /setPlanningLocationState\(next\)/);
  assert.match(state, /setSelectedLocationState\(sourceLocation \?\? null\)/);
  assert.match(state, /setLocation\(appLocation\)/);
  assert.match(state, /setSelectedFacilityId\(null\)/);
});
