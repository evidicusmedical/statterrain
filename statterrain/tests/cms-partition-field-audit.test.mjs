import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

const root = process.cwd();
const partition = JSON.parse(readFileSync(join(root, 'data/generated/cms-hospitals-national/states/CT.json'), 'utf8'));
const normalized = JSON.parse(readFileSync(join(root, 'data/normalized/cms-hospitals/cms-hospitals-normalized-v0.3.2.json'), 'utf8'));
const partitionKeys = new Set(Object.keys(partition.records[0] ?? {}));
const normalizedKeys = new Set(Object.keys(normalized.records[0] ?? {}));

const audit = {
  facilityName: 'present in deployed partition',
  sourceFacilityId: 'present in deployed partition',
  facilityType: 'present in deployed partition',
  hospitalType: 'present in deployed partition',
  criticalAccessIndicator: 'present in deployed partition',
  ownershipType: 'present in deployed partition',
  emergencyServicesIndicator: 'present in deployed partition',
  address: 'present in deployed partition',
  addressLine1: 'present in normalized data but omitted from partition',
  addressLine2: 'present in normalized data but omitted from partition',
  city: 'present in deployed partition',
  state: 'present in deployed partition',
  zip: 'present in deployed partition',
  phone: 'present in deployed partition',
  website: 'unavailable in current CMS source mapping',
  sourceName: 'present in normalized data but omitted from partition',
  sourceUrl: 'present in normalized data but omitted from partition',
  retrievedAt: 'present in deployed partition',
  validationStatus: 'present in deployed partition',
  geocodingConfidence: 'present in deployed partition',
};

test('deployed CMS partition field audit records current identity and contact availability', () => {
  for (const key of ['name','sourceFacilityId','facilityType','hospitalType','criticalAccessIndicator','ownershipType','emergencyServicesIndicator','address','city','state','zip','phone','retrievedAt','validationStatus','geocodingConfidence']) {
    assert.equal(partitionKeys.has(key), true, key);
  }
  for (const key of ['addressLine1','addressLine2','sourceName','sourceUrl']) {
    assert.equal(normalizedKeys.has(key), true, key);
    assert.equal(partitionKeys.has(key), false, key);
  }
  assert.equal(partitionKeys.has('website'), false);
  assert.equal(normalizedKeys.has('website'), false);
  assert.deepEqual(audit.website, 'unavailable in current CMS source mapping');
});
