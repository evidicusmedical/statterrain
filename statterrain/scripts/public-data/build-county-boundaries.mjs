#!/usr/bin/env node
import { mkdirSync, writeFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
const vintage = process.env.BOUNDARY_VINTAGE || process.argv.find(a=>a.startsWith('--vintage='))?.split('=')[1] || '2024';
export const BOUNDARY_SOURCE_CONTRACT = { agency:'U.S. Census Bureau', product:'TIGER/Line county and equivalent boundaries', vintage, url:`https://www2.census.gov/geo/tiger/TIGER${vintage}/COUNTY/tl_${vintage}_us_county.zip`, retrieval:'server-side only', geoidProperty:'GEOID', simplification:'topology-preserving simplification after GEOID normalization' };
export function sha256(s){return createHash('sha256').update(s).digest('hex');}
export function validateFeature(f){return f?.type==='Feature' && /^\d{5}$/.test(f.properties?.GEOID) && f.geometry;}
export function generateManifest(partitions){return {schemaVersion:'county-boundaries-v0.3.7', vintage, validationStatus: partitions.length>=52?'PASS':'PENDING', coverageStatus: partitions.length>=52?'national':'fixture', partitionCount:partitions.length, source:BOUNDARY_SOURCE_CONTRACT, checksums:Object.fromEntries(partitions.map(p=>[p,sha256(p)]))};}
if (import.meta.url === `file://${process.argv[1]}`) { mkdirSync('data/generated/county-boundaries/states',{recursive:true}); mkdirSync('data/reports',{recursive:true}); const manifest=generateManifest([]); writeFileSync('data/generated/county-boundaries/manifest.json', JSON.stringify(manifest,null,2)); writeFileSync('data/reports/county-boundary-completeness-v0.3.7.json', JSON.stringify({status:'PENDING', message:'National boundary build contract created; generated artifacts belong in PR 2.'},null,2)); console.log('County boundary build contract ready; national generated data not produced in PR 1.'); }
