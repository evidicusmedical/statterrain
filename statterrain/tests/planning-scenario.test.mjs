import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
const source=readFileSync(new URL('../src/lib/scenarios/planningScenario.ts', import.meta.url),'utf8');
test('planning scenario schema contract',()=>{assert.match(source,/PLANNING_SCENARIO_SCHEMA_VERSION = "1\.0"/);assert.match(source,/scenarioStatuses/);assert.match(source,/createPlanningScenario/);assert.match(source,/validatePlanningScenario/);assert.match(source,/serializePlanningScenario/);assert.match(source,/latitude < -90/);assert.match(source,/selectedFacilities\.length>250/);});
