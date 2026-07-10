import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {fetchAllCmsHospitalRecords,resolveCmsPageSize,assertPaginationComplete} from '../scripts/public-data/build-national-cms-hospitals.mjs';

const row=id=>({'Facility ID':String(id),'Facility Name':`Hospital ${id}`});
const res=(body,status=200)=>({ok:status>=200&&status<300,status,async text(){return typeof body==='string'?body:JSON.stringify(body);}});
function fetcher(sequence){const calls=[];let i=0;return {calls,fn:async url=>{calls.push(new URL(url));const next=sequence[Math.min(i++,sequence.length-1)];if(next instanceof Error) throw next;return res(next.body??next,next.status??200);}};}

test('one short page completes successfully',async()=>{const f=fetcher([{results:[row(1)],total:1}]);const out=await fetchAllCmsHospitalRecords({fetchImpl:f.fn,pageSize:10});assert.equal(out.rows.length,1);assert.equal(out.report.paginationComplete,true);assert.equal(out.report.stopCondition,'short-page');});
test('multiple full pages followed by a short page complete successfully',async()=>{const f=fetcher([{results:[row(1),row(2)]},{results:[row(3),row(4)]},{results:[row(5)]}]);const out=await fetchAllCmsHospitalRecords({fetchImpl:f.fn,pageSize:2});assert.deepEqual(out.report.offsetsRequested,[0,2,4]);assert.equal(out.rows.length,5);assert.equal(out.report.pagesCompleted,3);});
test('multiple full pages followed by an empty page complete successfully',async()=>{const f=fetcher([{results:[row(1),row(2)]},{results:[]}]);const out=await fetchAllCmsHospitalRecords({fetchImpl:f.fn,pageSize:2});assert.equal(out.report.stopCondition,'empty-page');assert.equal(out.report.paginationComplete,true);});
test('offset advances by returned row count',async()=>{const f=fetcher([{results:[row(1),row(2),row(3)]},{results:[row(4)]}]);await fetchAllCmsHospitalRecords({fetchImpl:f.fn,pageSize:3});assert.deepEqual(f.calls.map(u=>u.searchParams.get('offset')),['0','3']);});
test('duplicate records across pages are detected',async()=>{const f=fetcher([{results:[row(1),row(2)]},{results:[row(2),row(3)]},{results:[]}]);const out=await fetchAllCmsHospitalRecords({fetchImpl:f.fn,pageSize:2});assert.equal(out.report.exactRepeatedRows,1);assert.equal(out.report.uniqueSourceIds,3);});
test('repeated identical pages trigger a loop error',async()=>{const f=fetcher([{results:[row(1),row(2)]},{results:[row(1),row(2)]}]);await assert.rejects(()=>fetchAllCmsHospitalRecords({fetchImpl:f.fn,pageSize:2}),/repeated page content/);});
test('non-advancing offset triggers an error',async()=>{const f=fetcher([{results:[row(1)]}]);await assert.rejects(()=>fetchAllCmsHospitalRecords({fetchImpl:f.fn,pageSize:1,maxPages:1}),/maximum page safety limit/);});
test('missing response record array triggers an error',async()=>{const f=fetcher([{data:[row(1)]}]);await assert.rejects(()=>fetchAllCmsHospitalRecords({fetchImpl:f.fn,pageSize:1}),/missing expected record array key/);});
test('HTTP 400 includes status/body excerpt in error',async()=>{const f=fetcher([{status:400,body:{message:"JSON Schema validation failed. limit: '50000'"}}]);await assert.rejects(()=>fetchAllCmsHospitalRecords({fetchImpl:f.fn,pageSize:1}),/400.*limit/);});
test('transient failure retries and then succeeds',async()=>{let n=0;const fn=async url=>{n++; if(n===1) throw new Error('temporary'); return res({results:[row(1)]});};const out=await fetchAllCmsHospitalRecords({fetchImpl:fn,pageSize:2,retries:2});assert.equal(out.rows.length,1);});
test('persistent failure stops after bounded retries',async()=>{let n=0;const fn=async()=>{n++;throw new Error('down');};await assert.rejects(()=>fetchAllCmsHospitalRecords({fetchImpl:fn,pageSize:2,retries:3}),/down/);assert.equal(n,3);});
test('invalid page-size override is rejected',()=>{assert.throws(()=>resolveCmsPageSize('50000'),/Invalid CMS_HOSPITAL_PAGE_SIZE/);assert.throws(()=>resolveCmsPageSize('0'),/Invalid/);});
test('limit=50000 does not appear in active national pull code',()=>{const code=readFileSync(new URL('../scripts/public-data/build-national-cms-hospitals.mjs',import.meta.url),'utf8');assert.equal(code.includes('limit=50000'),false);});
test('pagination report marks complete only after a valid stop condition',async()=>{const f=fetcher([{results:[row(1)]}]);const out=await fetchAllCmsHospitalRecords({fetchImpl:f.fn,pageSize:2});assert.equal(out.report.paginationComplete,true);assert.equal(out.report.stopCondition,'short-page');});
test('downstream build cannot proceed on incomplete pagination',()=>{assert.throws(()=>assertPaginationComplete({paginationComplete:false}),/cannot proceed/);});

test('probe mode writes JSON-only stdout from mocked CMS fetch', async () => {
  const {writeCmsProbeJson} = await import('../scripts/public-data/build-national-cms-hospitals.mjs');
  let stdout = '';
  const mockRows = Array.from({length: 10}, (_, i) => row(i + 1));
  const fetchImpl = async () => res({count: 5432, query: {limit: 10, offset: 0}, results: mockRows, schema: {fields: []}}, 200);
  await writeCmsProbeJson({fetchImpl, stdout: {write(chunk) { stdout += chunk; }}});
  assert.equal(stdout.startsWith('>'), false);
  assert.equal(stdout.includes('data:probe-cms-hospital-api'), false);
  const parsed = JSON.parse(stdout);
  assert.equal(parsed.status, 200);
  assert.equal(parsed.recordArrayKey, 'results');
  assert.equal(parsed.rowCount, 10);
  assert.deepEqual(parsed.topLevelKeys, ['count', 'query', 'results', 'schema']);
});
