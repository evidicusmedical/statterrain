import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const helper = readFileSync('src/lib/facilityIdentity.ts','utf8');
const detail = readFileSync('src/components/facilities/FacilityDetailPanel.tsx','utf8');
const exportLib = readFileSync('src/lib/export.ts','utf8');
const loader = readFileSync('src/lib/public-data/loadNationalCmsHospitals.ts','utf8');

function phoneHref(value){
  const trimmed = value?.trim(); if(!trimmed || !/[0-9]/.test(trimmed) || /[<>]/.test(trimmed)) return null;
  const m = trimmed.match(/(?:ext\.?|extension|x)\s*(\d{1,8})\s*$/i); const ext=m?.[1];
  const base=trimmed.replace(/(?:ext\.?|extension|x)\s*(\d{1,8})\s*$/i,''); const intl=base.trim().startsWith('+'); const digits=base.replace(/\D/g,'');
  if(digits.length===10) return `tel:${digits}${ext?`;ext=${ext}`:''}`;
  if(digits.length===11 && digits.startsWith('1')) return `tel:${digits}${ext?`;ext=${ext}`:''}`;
  if(intl && digits.length>=8 && digits.length<=15) return `tel:+${digits}${ext?`;ext=${ext}`:''}`;
  return null;
}

test('phone helper supports safe CMS phone display and tel links',()=>{
 assert.equal(phoneHref('3347938701'),'tel:3347938701');
 assert.equal(phoneHref('(334) 793-8701'),'tel:3347938701');
 assert.equal(phoneHref('334 793 8701'),'tel:3347938701');
 assert.equal(phoneHref('(334) 793-8701 ext 123'),'tel:3347938701;ext=123');
 assert.equal(phoneHref(''),null);
 assert.equal(phoneHref('call hospital'),null);
 assert.equal(phoneHref('+44 20 7946 0958'),'tel:+442079460958');
 assert.equal(phoneHref('12345'),null);
 assert.equal(phoneHref('12345678901234567890'),null);
 assert.match(helper,/buildSafeTelephoneHref/);
});

test('facility details render source-backed identity contact and hide unsafe website values',()=>{
 assert.match(detail,/CMS facility ID/);
 assert.match(detail,/Hospital type/);
 assert.match(detail,/Ownership/);
 assert.match(detail,/CMS emergency-services designation is not live operational status/);
 assert.match(detail,/normalizeFacilityWebsite/);
 assert.match(detail,/rel="noopener noreferrer"/);
 assert.doesNotMatch(detail,/facility\.name.*website|website.*facility\.name/);
});

test('loader and exports preserve source-backed contact and identity fields',()=>{
 for (const token of ['phone: asText(record.phone)','hospitalType: asText(record.hospitalType)','ownershipType: asText(record.ownershipType)','emergencyServicesIndicator: asText(record.emergencyServicesIndicator)','countyName: asText(record.countyName)']) assert.ok(loader.includes(token), token);
 for (const token of ['Phone:','Website: [Visit facility website]','CMS facility ID','Hospital type','Ownership','not live operational status']) assert.ok(exportLib.includes(token), token);
});
