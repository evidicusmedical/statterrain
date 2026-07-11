import { readFileSync, writeFileSync, readdirSync, existsSync } from 'node:fs';
import { resolve, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { dirname } from 'node:path';
import { cmsHospitalFieldCatalog } from './cms-hospital-field-catalog.mjs';
const root=resolve(dirname(fileURLToPath(import.meta.url)),'../..');
const readJson=p=>JSON.parse(readFileSync(resolve(root,p),'utf8'));
const pct=(n,d)=>d?Number((n/d*100).toFixed(2)):0;
const present=v=>!(v==null||v===''||v==='unavailable'||(Array.isArray(v)&&v.length===0));
const firstExisting=(paths)=>paths.find(p=>existsSync(resolve(root,p)));
const normalizedPath=firstExisting(['data/normalized/cms-hospitals/cms-hospitals-normalized-v0.3.2.json']);
const rawPath=firstExisting(['data/raw/cms-hospitals/cms-hospitals-raw-v0.3.2.json']);
const manifestPath='data/generated/cms-hospitals-national/manifest.json';
const normalized=normalizedPath?readJson(normalizedPath):{metadata:{},records:[]};
const manifest=readJson(manifestPath);
const raw=rawPath?readJson(rawPath):[];
const stateDir=resolve(root,'data/generated/cms-hospitals-national/states');
const partitions=readdirSync(stateDir).filter(f=>f.endsWith('.json')).flatMap(f=>readJson(join('data/generated/cms-hospitals-national/states',f)).records??[]);
const mapReady=normalized.records.filter(r=>r.mapReady);
const rawColumns=new Set([...(normalized.metadata?.sourceFields??[]), ...Object.keys(raw[0]??{})]);
function nonEmpty(records, field){ if(!field) return 0; return records.filter(r=>present(r[field])).length; }
function rawCount(entry){ const cols=entry.cmsSourceColumns??[]; if(!cols.length) return null; return raw.filter(row=>cols.some(c=>present(row[c]))).length; }
function status(entry, nCount, pCount){
 if(entry.logicalField==='website') return 'unavailable-in-current-cms-source';
 const sourceCols=entry.cmsSourceColumns??[]; const sourcePresent=sourceCols.length?sourceCols.some(c=>rawColumns.has(c)):entry.sourceBacked;
 if(!sourcePresent && !entry.sourceBacked) return 'unavailable-in-current-cms-source';
 if(entry.safeToDisplay===false) return 'unsafe-to-display';
 if(nCount>0 && pCount===0 && entry.partitionField) return 'source-present-partition-missing';
 if(nCount>0 && entry.currentRendered===false) return 'source-present-ui-missing';
 if(nCount>0 && entry.currentExported===false) return 'source-present-export-missing';
 if(nCount===normalized.records.length && (pCount===partitions.length || !entry.partitionField)) return 'complete';
 return 'partially-complete';
}
const fields=cmsHospitalFieldCatalog.map(entry=>{
 const n=nonEmpty(normalized.records, entry.normalizedField);
 const m=nonEmpty(mapReady, entry.normalizedField);
 const p=nonEmpty(partitions, entry.partitionField);
 return { ...entry, sourceColumnMappingVerified:(entry.cmsSourceColumns??[]).every(c=>rawColumns.has(c)) || !(entry.cmsSourceColumns??[]).length, rawSourceNonEmptyCount:rawCount(entry), totalNormalizedRecords:normalized.records.length, nonEmptyNormalizedCount:n, normalizedPercentage:pct(n, normalized.records.length), totalMapReadyRecords:mapReady.length, nonEmptyMapReadyCount:m, mapReadyPercentage:pct(m, mapReady.length), deployedPartitionTotal:partitions.length, deployedPartitionNonEmptyCount:p, deployedPartitionPercentage:pct(p, partitions.length), lostBetweenNormalizedAndPartition:Math.max(0,m-p), renderedInUiFixtureTests:entry.currentRendered&&m?m:0, exportedInFixtureTests:entry.currentExported&&m?m:0, sampleSourceIds:normalized.records.filter(r=>present(r[entry.normalizedField])).slice(0,5).map(r=>r.sourceFacilityId), status:status(entry,n,p) };
});
const emergencyValues=normalized.records.reduce((a,r)=>{const v=present(r.emergencyServicesIndicator)?r.emergencyServicesIndicator:'Not reported'; a[v]=(a[v]??0)+1; return a;},{});
const criticalAccessCount=normalized.records.filter(r=>r.hospitalType==='Critical Access Hospitals').length;
const report={ generatedAt:new Date().toISOString(), version:'v0.3.4 prototype', source:{name:manifest.sourceName,datasetId:manifest.sourceDatasetId,url:'https://data.cms.gov/provider-data/api/1/datastore/query/xubh-q36u/0', rawPath, normalizedPath, manifestPath}, totals:{rawSourceRows:Array.isArray(raw)?raw.length:null,totalNormalizedRecords:normalized.records.length,mapReadyRecords:mapReady.length,deployedPartitionRecords:partitions.length,excludedRecords:manifest.excludedRecords,statesPresent:manifest.statesPresent?.length}, findings:{phone:{sourceColumn:'telephone_number',rawSourceNonEmptyCount:raw.filter(r=>present(r.telephone_number)).length,normalizedCount:nonEmpty(normalized.records,'phone'),mapReadyCount:nonEmpty(mapReady,'phone'),partitionCount:nonEmpty(partitions,'phone')},website:{availableInCurrentCmsSource:false,normalizedCount:nonEmpty(normalized.records,'website'),partitionCount:nonEmpty(partitions,'website'),status:'unavailable-in-current-cms-source',message:'Website URL is not provided by the current CMS Hospital General Information source mapping.'},hospitalType:{normalizedCount:nonEmpty(normalized.records,'hospitalType'),partitionCount:nonEmpty(partitions,'hospitalType')},ownershipType:{normalizedCount:nonEmpty(normalized.records,'ownershipType'),partitionCount:nonEmpty(partitions,'ownershipType')},emergencyServices:{values:emergencyValues,normalizedCount:nonEmpty(normalized.records,'emergencyServicesIndicator'),partitionCount:nonEmpty(partitions,'emergencyServicesIndicator'),limitation:'CMS emergency-services designation is not live operational status.'},criticalAccess:{mapping:'CMS hospital_type exactly Critical Access Hospitals => criticalAccessIndicator source-mapped-from-hospital-type',normalizedCount:criticalAccessCount,partitionCount:partitions.filter(r=>r.criticalAccessIndicator==='source-mapped-from-hospital-type').length}}, fields };
writeFileSync(resolve(root,'data/reports/cms-hospital-field-completeness-v0.3.4.json'),JSON.stringify(report,null,2)+'\n');
const lines=['# CMS Hospital Field Completeness (v0.3.4)','',`Generated: ${report.generatedAt}`,'',`Totals: normalized ${report.totals.totalNormalizedRecords}; map-ready ${report.totals.mapReadyRecords}; deployed partitions ${report.totals.deployedPartitionRecords}.`,'','Website URL is not provided by the current CMS Hospital General Information source mapping.','','| Field | CMS source column(s) | Normalized | Map-ready | Partition | Lost | Status |','| --- | --- | ---: | ---: | ---: | ---: | --- |'];
for(const f of fields) lines.push(`| ${f.displayLabel} | ${(f.cmsSourceColumns??[]).join(', ')||'pipeline metadata / unavailable'} | ${f.nonEmptyNormalizedCount} (${f.normalizedPercentage}%) | ${f.nonEmptyMapReadyCount} (${f.mapReadyPercentage}%) | ${f.deployedPartitionNonEmptyCount} (${f.deployedPartitionPercentage}%) | ${f.lostBetweenNormalizedAndPartition} | ${f.status} |`);
writeFileSync(resolve(root,'docs/CMS_HOSPITAL_FIELD_COMPLETENESS.md'),lines.join('\n')+'\n');
console.log(JSON.stringify({report:'data/reports/cms-hospital-field-completeness-v0.3.4.json',markdown:'docs/CMS_HOSPITAL_FIELD_COMPLETENESS.md',totals:report.totals,phone:report.findings.phone,website:report.findings.website},null,2));
