import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const panel = readFileSync('src/components/regional-summary/RegionalSummaryPanel.tsx','utf8');
const provenance = readFileSync('src/lib/provenance.ts','utf8');
const coverage = readFileSync('src/lib/coverage/coverageStatus.ts','utf8');
const evidence = readFileSync('src/lib/export.ts','utf8');

test('summary removes obsolete verbose CMS and scaffold messaging',()=>{
  for (const stale of ['CMS hospitals loaded for selected radius','Synthetic demo data is not representative','Showing CMS hospital public-data records within the selected radius','CMS dialysis source scaffold','fixture-only/not geocoded','national facility coverage is not complete','source-aligned controls','map-ready source active','generated artifact status']) {
    assert.doesNotMatch(panel+coverage, new RegExp(stale.replace(/[.*+?^${}()|[\]\\]/g,'\\$&'),'i'));
  }
});

test('public summary and source panel omit dialysis wording',()=>{
  assert.doesNotMatch(panel,/dialysis/i);
});

test('source-aware hospital provenance classifications are implemented',()=>{
  assert.match(provenance,/"cms-only"/);
  assert.match(provenance,/"synthetic-only"/);
  assert.match(provenance,/"mixed"/);
  assert.match(provenance,/"none"/);
  assert.match(panel,/These are synthetic demonstration records and do not represent real facilities at this location/);
  assert.match(panel,/Results include both CMS public records and synthetic demonstration records/);
  assert.match(panel,/No matching mapped records does not establish that no hospital exists in the area/);
});

test('hospital count and concise source sections are visible',()=>{
  assert.match(panel,/Hospitals within radius/);
  assert.match(panel,/Hospital data source/);
  assert.match(panel,/Data sources/);
  assert.ok(panel.indexOf('Data sources') < panel.indexOf('Research limitations'));
});

test('canonical CMS and ACS metadata feed source links and labels',()=>{
  assert.match(provenance,/source-registry\.json/);
  assert.match(panel,/hospitalSourceMetadata\.datasetTitle/);
  assert.match(panel,/acsSourceMetadata\.releaseLabel/);
  assert.match(panel,/2024 ACS 5-year/);
  assert.match(panel,/2020-2024/);
  assert.match(panel,/target="_blank"/);
  assert.match(panel,/rel="noopener noreferrer"/);
});

test('freshness terminology avoids live/current claims',()=>{
  for (const stale of ['Live data','Real-time data','Current hospital status','Current county population','Data current as of']) assert.doesNotMatch(panel, new RegExp(stale,'i'));
  assert.match(panel,/Dataset release/);
  assert.match(panel,/Retrieved by StatTerrain/);
  assert.match(panel,/Estimate period/);
});

test('limitations retain whole-county and straight-line caveats',()=>{
  assert.match(panel,/whole containing county/);
  assert.match(panel,/straight-line distance is not travel time or routing/);
});

test('evidence and exports retain provenance metadata',()=>{
  for (const token of ['hospitalSourceType','hospitalDatasetTitle','hospitalDatasetRelease','hospitalRetrievedAt','hospitalOfficialUrl','acsDatasetTitle','acsRelease','acsEstimatePeriod','acsRetrievedAt','acsOfficialUrl','boundarySource','boundaryVintage','coverageStatus','provenanceClassification','humanReadable']) assert.match(evidence,new RegExp(token));
});
