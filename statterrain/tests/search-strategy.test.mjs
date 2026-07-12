import test from 'node:test';
import assert from 'node:assert/strict';
import { loadClassifier } from './helpers/load-search-strategy.mjs';

test('classifies supported search strategies deterministically', async () => {
  const { classifyGeocodeSearchQuery } = await loadClassifier();
  const cases = [
    ['20500', 'zip'], ['20500-0003', 'zip'], ['Washington, DC', 'city-state'], ['Toledo, Ohio', 'city-state'],
    ['1600 Pennsylvania Avenue NW, Washington, DC', 'street-address'], ['38.8977, -77.0365', 'coordinates'], ['999, 999', 'invalid-coordinates'], ['Springfield', 'unsupported']
  ];
  for (const [input, expected] of cases) assert.equal(classifyGeocodeSearchQuery(input).strategy, expected, input);
  assert.equal(classifyGeocodeSearchQuery('Springfield').message, 'Include a state with the city name.');
});
