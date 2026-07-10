import { createHash } from "node:crypto";
import { copyFileSync, existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve, relative } from "node:path";
import { fileURLToPath } from "node:url";
const __dirname = dirname(fileURLToPath(import.meta.url));
const args = process.argv.slice(2);
const opt = (name, fallback=null) => { const i=args.indexOf(name); return i>=0 ? (args[i+1] ?? fallback) : fallback; };
const appRoot = resolve(opt("--root", resolve(__dirname, "../..")));
const modeArg = opt("--mode", "auto");
const verbose = args.includes("--verbose");
const rel = p => relative(appRoot, p).replaceAll("\\", "/");
const path = p => resolve(appRoot, p);
const readJson = p => JSON.parse(readFileSync(path(p), "utf8"));
const sha = text => createHash("sha256").update(text).digest("hex");
const reportPath = "data/reports/cms-hospitals-national-validation-v0.3.2.4.json";
const legacyVersion = "v0.2.3";
const forbidden = [/patient/i, /claim/i, /phi/i, /bed/i, /diversion/i, /routing/i, /triage/i, /transferRecommendation/i, /dispatch/i, /clinicalDecision/i, /medicalControl/i];
const NATIONAL = {
  manifest: "data/generated/cms-hospitals-national/manifest.json",
  summary: "data/generated/cms-hospitals-national/summary.json",
  excluded: "data/generated/cms-hospitals-national/excluded-records.json",
  unmatched: "data/generated/cms-hospitals-national/unmatched-records.json",
  normalized: "data/normalized/cms-hospitals/cms-hospitals-normalized-v0.3.2.json",
  generated: "data/generated/cms-hospitals.generated.json",
  geocodingInput: "data/generated/geocoding-inputs/cms-hospitals-national-geocoding-input-v0.3.2.json",
  geocodingCache: "data/generated/geocoding-cache/cms-hospitals-geocoding-cache.json",
  geocodingRun: "data/reports/cms-hospitals-geocoding-run-v0.3.2.json",
  geography: "data/generated/geocoding-results/cms-hospitals-geography-join-v0.3.2.json",
  qa: "data/reports/cms-hospitals-national-quality-v0.3.2.json",
  pull: "data/reports/cms-hospitals-national-pull-v0.3.2.json",
  coverage: "data/generated/source-coverage-manifest.json",
  artifact: "data/generated/artifact-manifest.json"
};
function baseReport(mode){return {schemaVersion:"cms-hospitals-validation-v0.3.2.4",validationMode:mode,status:"fail",validatedAt:new Date().toISOString(),rulesRun:0,rulesPassed:0,rulesFailed:0,warnings:[],errors:[],affectedRecordCount:0,examples:[],artifactPaths:NATIONAL,counts:{},safeToActivate:false,completionDeclaration:"COMPLETE — NATIONAL VALIDATOR AND ARTIFACT RECOVERY HOTFIX READY"};}
function issue(list, id, rule, artifactPath, {recordId=null, expected=null, actual=null, affected=1, remediation="Inspect the named artifact, regenerate from official CMS data if needed, and do not activate unsafe map output."}={}){list.push({ruleId:id,rule,artifactPath,recordId,expected,actual,affectedRecordCount:affected,remediation});}
const finalStatuses = new Set(["completed","skipped","no-op","failed"]);
const acceptableGeo = new Set(["joined","validated"]);
const acceptableGeocode = new Set(["matched"]);
function validLat(v){return typeof v==="number" && Number.isFinite(v) && v>=-90 && v<=90;}
function validLon(v){return typeof v==="number" && Number.isFinite(v) && v>=-180 && v<=180;}
function recId(r){return r?.sourceFacilityId ?? r?.id ?? r?.sourceRecordId ?? null;}
function validateNational(){
 const r=baseReport("national"); const errors=r.errors, warnings=r.warnings;
 if(!existsSync(path(NATIONAL.manifest))){issue(errors,"CMS-NAT-001","missing-national-manifest",NATIONAL.manifest,{expected:"readable manifest.json",actual:"missing",remediation:"Run the national CMS build or download failed-run artifacts before national validation."}); writeReport(r); printReport(r); return r;}
 const manifest=readJson(NATIONAL.manifest); r.counts={normalizedCount:manifest.totalNormalizedRecords,mapReadyCount:manifest.mapReadyRecords,excludedCount:manifest.excludedRecords,unmatchedCount:manifest.unmatchedRecords,partitionCount:manifest.partitions?.length??0};
 const required = Object.entries(NATIONAL).filter(([k])=>!['coverage','artifact'].includes(k)); for(const [,p] of required) if(!existsSync(path(p))) issue(errors,"CMS-NAT-002","missing-required-artifact",p,{expected:"file exists",actual:"missing"});
 if(manifest.sourceName!=="CMS Hospital General Information") issue(errors,"CMS-NAT-003","unexpected-source-name",NATIONAL.manifest,{expected:"CMS Hospital General Information",actual:manifest.sourceName});
 if(manifest.sourceDatasetId!=="xubh-q36u") issue(errors,"CMS-NAT-004","unexpected-dataset-id",NATIONAL.manifest,{expected:"xubh-q36u",actual:manifest.sourceDatasetId});
 if(manifest.sourceId!=="cms-hospital-general-information") issue(errors,"CMS-NAT-005","missing-cms-source-id",NATIONAL.manifest,{expected:"cms-hospital-general-information",actual:manifest.sourceId});
 if(!(manifest.totalNormalizedRecords>0)) issue(errors,"CMS-NAT-006","nonpositive-normalized-count",NATIONAL.manifest,{expected:"> 0",actual:manifest.totalNormalizedRecords});
 if(!manifest.retrievedAt || !manifest.generatedAt) issue(errors,"CMS-NAT-007","missing-retrieval-metadata",NATIONAL.manifest,{expected:"retrievedAt and generatedAt",actual:{retrievedAt:manifest.retrievedAt,generatedAt:manifest.generatedAt}});
 let generated={records:[],metadata:{}}; if(existsSync(path(NATIONAL.generated))) generated=readJson(NATIONAL.generated);
 if(generated.metadata?.dataMode!=="real-public-data" || generated.metadata?.fixtureMode===true) issue(errors,"CMS-NAT-008","national-output-must-be-real-public-data",NATIONAL.generated,{expected:"real-public-data and fixtureMode false",actual:{dataMode:generated.metadata?.dataMode,fixtureMode:generated.metadata?.fixtureMode}});
 const records = Array.isArray(generated.records)?generated.records:[]; if(generated.metadata?.recordCount!==records.length) issue(errors,"CMS-NAT-009","generated-record-count-mismatch",NATIONAL.generated,{expected:records.length,actual:generated.metadata?.recordCount});
 const seen=new Set(); for(const [i,rec] of records.entries()){
   const id=recId(rec); if(!id) issue(errors,"CMS-NAT-010","map-ready-missing-source-facility-id",NATIONAL.generated,{recordId:`index:${i}`,expected:"sourceFacilityId",actual:null}); else if(seen.has(id)) issue(errors,"CMS-NAT-011","duplicate-map-ready-source-facility-id",NATIONAL.generated,{recordId:id,expected:"unique",actual:"duplicate"}); seen.add(id);
   if(!rec.facilityName && !rec.name) issue(errors,"CMS-NAT-012","map-ready-missing-facility-name",NATIONAL.generated,{recordId:id,expected:"facilityName/name",actual:null});
   if(!validLat(rec.latitude)) issue(errors,"CMS-NAT-013","invalid-latitude",NATIONAL.generated,{recordId:id,expected:"finite latitude -90..90",actual:rec.latitude});
   if(!validLon(rec.longitude)) issue(errors,"CMS-NAT-014","invalid-longitude",NATIONAL.generated,{recordId:id,expected:"finite longitude -180..180",actual:rec.longitude});
   if(rec.latitude===0 && rec.longitude===0) issue(errors,"CMS-NAT-015","zero-zero-coordinate",NATIONAL.generated,{recordId:id,expected:"not 0,0",actual:"0,0"});
   if(!acceptableGeocode.has(rec.geocodingStatus ?? "matched")) issue(errors,"CMS-NAT-016","unacceptable-geocoding-status",NATIONAL.generated,{recordId:id,expected:[...acceptableGeocode],actual:rec.geocodingStatus});
   if(!acceptableGeo.has(rec.geographyJoinStatus ?? rec.validationStatus)) issue(errors,"CMS-NAT-017","unacceptable-geography-status",NATIONAL.generated,{recordId:id,expected:[...acceptableGeo],actual:rec.geographyJoinStatus ?? rec.validationStatus});
   if(rec.dataMode && rec.dataMode!=="real-public-data") issue(errors,"CMS-NAT-018","fixture-record-in-national-artifact",NATIONAL.generated,{recordId:id,expected:"real-public-data",actual:rec.dataMode});
   if(!Array.isArray(rec.limitations)||!rec.limitations.length||!Array.isArray(rec.prohibitedUses)||!rec.prohibitedUses.length) issue(errors,"CMS-NAT-019","missing-limitations-or-prohibited-uses",NATIONAL.generated,{recordId:id,expected:"non-empty limitations and prohibitedUses",actual:{limitations:rec.limitations,prohibitedUses:rec.prohibitedUses}});
   for(const key of Object.keys(rec)) for(const pattern of forbidden) if(pattern.test(key)) issue(errors,"CMS-NAT-020","forbidden-operational-or-phi-field",NATIONAL.generated,{recordId:id,expected:"no patient/claims/PHI/live operational fields",actual:key});
 }
 if(existsSync(path(NATIONAL.pull))){const pull=readJson(NATIONAL.pull); if(pull.paginationComplete!==true) issue(errors,"CMS-NAT-021","pagination-incomplete",NATIONAL.pull,{expected:true,actual:pull.paginationComplete}); if(!(pull.pagesCompleted>0)) issue(errors,"CMS-NAT-022","pagination-pages-missing",NATIONAL.pull,{expected:"> 0",actual:pull.pagesCompleted});}
 if(existsSync(path(NATIONAL.geocodingRun))){const run=readJson(NATIONAL.geocodingRun); if(run.allPlannedChunksCompleted!==true) issue(errors,"CMS-NAT-023","unexecuted-geocoding-chunk",NATIONAL.geocodingRun,{expected:true,actual:run.allPlannedChunksCompleted}); if(run.chunksCompleted!==run.chunksPlanned) issue(errors,"CMS-NAT-024","chunk-total-mismatch",NATIONAL.geocodingRun,{expected:run.chunksPlanned,actual:run.chunksCompleted});}
 if(existsSync(path(NATIONAL.geocodingCache))){const cache=readJson(NATIONAL.geocodingCache); if(!Array.isArray(cache.entries)||!cache.entries.length) issue(errors,"CMS-NAT-025","empty-geocoding-cache",NATIONAL.geocodingCache,{expected:"processed cache entries",actual:cache.entries?.length??0});}
 const excludedIds = new Set(existsSync(path(NATIONAL.excluded)) ? (readJson(NATIONAL.excluded).records??[]).map(recId).filter(Boolean) : []); const unmatchedIds = new Set(existsSync(path(NATIONAL.unmatched)) ? (readJson(NATIONAL.unmatched).records??[]).map(recId).filter(Boolean) : []);
 let partitionTotal=0; const inPartitions=new Map(); for(const p of manifest.partitions??[]){ if(!existsSync(path(p.path))){issue(errors,"CMS-NAT-026","missing-partition",p.path,{expected:"partition file exists",actual:"missing"}); continue;} const text=readFileSync(path(p.path),"utf8"); const actualSha=sha(text); if(p.checksumSha256!==actualSha) issue(errors,"CMS-NAT-027","partition-checksum-mismatch",p.path,{expected:p.checksumSha256,actual:actualSha}); const part=JSON.parse(text); const partRecords=part.records??[]; if(part.recordCount!==partRecords.length) issue(errors,"CMS-NAT-028","partition-record-count-mismatch",p.path,{expected:partRecords.length,actual:part.recordCount}); partitionTotal+=partRecords.length; for(const rec of partRecords){const id=recId(rec); if(inPartitions.has(id)) issue(errors,"CMS-NAT-029","duplicate-map-ready-record-across-partitions",p.path,{recordId:id,expected:"appears once",actual:`also in ${inPartitions.get(id)}`}); inPartitions.set(id,p.path); if(unmatchedIds.has(id)) issue(errors,"CMS-NAT-030","unmatched-record-in-partition",p.path,{recordId:id,expected:"not partitioned",actual:"present"}); if(excludedIds.has(id)) issue(errors,"CMS-NAT-031","excluded-record-in-partition",p.path,{recordId:id,expected:"not partitioned",actual:"present"});}}
 if(partitionTotal!==manifest.mapReadyRecords) issue(errors,"CMS-NAT-032","partition-total-mismatch",NATIONAL.manifest,{expected:manifest.mapReadyRecords,actual:partitionTotal,affected:Math.abs((manifest.mapReadyRecords??0)-partitionTotal)});
 if(manifest.totalNormalizedRecords != null && manifest.mapReadyRecords != null && manifest.excludedRecords != null && manifest.totalNormalizedRecords !== manifest.mapReadyRecords + manifest.excludedRecords) issue(warnings,"CMS-NAT-033","normalized-mapready-excluded-count-equation-warning",NATIONAL.manifest,{expected:"normalized = mapReady + excluded when categories are exhaustive",actual:{normalized:manifest.totalNormalizedRecords,mapReady:manifest.mapReadyRecords,excluded:manifest.excludedRecords},remediation:"Confirm builder category contract before treating this as fatal."});
 r.status=errors.length?"fail":(warnings.length?"warn":"pass"); r.safeToActivate=r.status==="pass"; writeReport(r); printReport(r); return r;
}
function validatePreview(){
 const generatedPath="data/generated/cms-hospitals.generated.json"; const validationPath=`data/reports/cms-hospitals-validation-${legacyVersion}.json`; const lkgPath=path("data/last-known-good/cms-hospitals.generated.json"); const r={schemaVersion:"cms-hospitals-validation-v0.3.2.4",validationMode:"preview",status:"fail",validatedAt:new Date().toISOString(),errors:[],warnings:[],recordCount:0,fallback:{lastKnownGoodExists:existsSync(lkgPath),lastKnownGoodUpdated:false}};
 if(!existsSync(path(generatedPath))){r.status="fail"; r.errors.push({ruleId:"CMS-PREV-001",rule:"missing-preview-generated-artifact",artifactPath:generatedPath,expected:"file exists",actual:"missing",remediation:"Run the legacy CMS hospital preview pull or use --mode national for national artifacts."}); mkdirSync(dirname(path(validationPath)),{recursive:true}); writeFileSync(path(validationPath),JSON.stringify(r,null,2)+"\n"); console.log("CMS hospital preview validation: FAIL"); return r;}
 const generated=readJson(generatedPath), meta=generated.metadata, records=generated.records; r.recordCount=Array.isArray(records)?records.length:0; if(meta?.usedInCurrentApp!==false) r.errors.push({ruleId:"CMS-PREV-002",rule:"preview-must-not-power-current-app",artifactPath:generatedPath,expected:false,actual:meta?.usedInCurrentApp}); if(meta?.previewLabelRequired!==true) r.errors.push({ruleId:"CMS-PREV-003",rule:"preview-label-required",artifactPath:generatedPath,expected:true,actual:meta?.previewLabelRequired}); if(r.recordCount>5) r.warnings.push({ruleId:"CMS-PREV-004",rule:"preview-record-count-greater-than-five",artifactPath:generatedPath,expected:"bounded preview",actual:r.recordCount}); r.status=r.errors.length?"fail":"warn"; mkdirSync(dirname(path(validationPath)),{recursive:true}); writeFileSync(path(validationPath),JSON.stringify(r,null,2)+"\n"); console.log(`CMS hospital preview validation: ${r.status.toUpperCase()}`); return r;
}
function writeReport(r){r.rulesFailed=r.errors.length; r.rulesRun=r.errors.length+r.warnings.length+1; r.rulesPassed=r.rulesRun-r.rulesFailed; r.affectedRecordCount=[...r.errors,...r.warnings].reduce((n,e)=>n+(e.affectedRecordCount||0),0); r.examples=r.errors.slice(0,10); mkdirSync(dirname(path(reportPath)),{recursive:true}); writeFileSync(path(reportPath),JSON.stringify(r,null,2)+"\n");}
function printReport(r){console.log(`CMS hospital ${r.validationMode} validation: ${r.status.toUpperCase()}`); console.log(`Artifact: ${NATIONAL.manifest}`); console.log(`Rules failed: ${r.errors.length}`); console.log(`Records affected: ${r.affectedRecordCount}`); for(const e of r.errors.slice(0, verbose?50:10)){console.log(`\n[${e.ruleId}] ${e.rule}`); console.log(`Artifact: ${e.artifactPath}`); if(e.recordId) console.log(`Record ID: ${e.recordId}`); console.log(`Expected: ${JSON.stringify(e.expected)}`); console.log(`Actual: ${JSON.stringify(e.actual)}`); console.log(`Records affected: ${e.affectedRecordCount}`); console.log(`Remediation: ${e.remediation}`);} }
function inspect(){const p=path(reportPath); if(!existsSync(p)){console.error(`No validation report found at ${reportPath}`); process.exit(1);} console.log(readFileSync(p,"utf8"));}
if(args.includes("--inspect")) inspect();
if(!["auto","preview","national"].includes(modeArg)){console.error("Use --mode auto, --mode preview, or --mode national"); process.exit(2);} const selected=modeArg==="auto" ? (existsSync(path(NATIONAL.manifest)) ? "national" : "preview") : modeArg; const result=selected==="national"?validateNational():validatePreview(); process.exit(result.status==="fail"?1:0);
