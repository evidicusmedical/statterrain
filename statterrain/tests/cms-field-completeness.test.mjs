import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, statSync } from 'node:fs';
import { spawnSync } from 'node:child_process';

const required = ['facilityName','cmsFacilityId','hospitalType','criticalAccessIndicator','ownershipType','emergencyServicesIndicator','addressLine1','addressLine2','city','state','zip','county','stateFips','countyFips','latitude','longitude','phone','website','sourceName','sourceDatasetId','sourceUrl','retrievedAt','sourceReleaseDate','validationStatus','geocodingStatus','geocodingConfidence','geographyJoinStatus','limitations','prohibitedUses'];

test('version is v0.3.4.2 and stale active versions are rejected',()=>{
 const product=readFileSync('src/config/product.ts','utf8');
 assert.match(product,/prototypeVersion: "v0\.3\.6\.4 prototype"/);
 for (const stale of ['v0.3.4 prototype','v0.3.3.3 prototype','v0.3.3.2 prototype','v0.3.3.1 prototype','v0.3.3 prototype']) assert.doesNotMatch(product,new RegExp(stale.replaceAll('.','\\.')));
});

test('field completeness report covers required fields and reconciles totals',()=>{
 const report=JSON.parse(readFileSync('data/reports/cms-hospital-field-completeness-v0.3.4.json','utf8'));
 const fields=new Map(report.fields.map(f=>[f.logicalField,f]));
 for (const field of required) assert.ok(fields.has(field), field);
 assert.equal(report.totals.totalNormalizedRecords, 5432);
 assert.equal(report.totals.mapReadyRecords, 4669);
 assert.equal(report.totals.deployedPartitionRecords, 4669);
 for (const f of report.fields) assert.equal(f.lostBetweenNormalizedAndPartition, Math.max(0, f.nonEmptyMapReadyCount - f.deployedPartitionNonEmptyCount));
 assert.equal(report.findings.phone.rawSourceNonEmptyCount, 5432);
 assert.equal(report.findings.phone.normalizedCount, 5432);
 assert.equal(report.findings.website.availableInCurrentCmsSource, false);
 assert.equal(fields.get('website').status, 'unavailable-in-current-cms-source');
});

test('audit script is non-destructive for generated partitions',()=>{
 const before=statSync('data/generated/cms-hospitals-national/manifest.json').mtimeMs;
 const result=spawnSync(process.execPath,['scripts/public-data/audit-cms-hospital-fields.mjs'],{encoding:'utf8'});
 assert.equal(result.status,0,result.stdout+result.stderr);
 const after=statSync('data/generated/cms-hospitals-national/manifest.json').mtimeMs;
 assert.equal(after,before);
});

test('builder maps current CMS source columns and identity-refresh mode',()=>{
 const builder=readFileSync('scripts/public-data/build-national-cms-hospitals.mjs','utf8');
 for (const token of ["'citytown'","'countyparish'","'telephone_number'","--build-mode=","identity-refresh","cms-hospitals-national-v0.3.4"]) assert.ok(builder.includes(token), token);
});
