#!/usr/bin/env node
import { existsSync, readFileSync, appendFileSync } from 'node:fs';
import { initStatus, updateStatus, promoteStaging, canCommitGeneratedArtifacts, evaluateNationalCompletion, truthfulSummary, readStatus, stagingRoot } from './acs-workflow-gates.mjs';
const args=process.argv.slice(2); const cmd=args[0]; const val=(f,d='')=>{const i=args.indexOf(f); return i>=0?args[i+1]:d};
try{
if(cmd==='init'){initStatus({runId:val('--run-id'),workflowRunId:val('--workflow-run-id'),workflowRunAttempt:val('--workflow-run-attempt'),targetBranch:val('--target-branch'),buildMode:val('--build-mode'),requestedRelease:val('--release','2024')});}
else if(cmd==='update'){updateStatus({[val('--field')]:val('--value'),...(val('--failure-stage')?{failureStage:val('--failure-stage')}:{}),...(val('--failure-message')?{failureMessage:val('--failure-message')}: {})});}
else if(cmd==='promote'){promoteStaging();}
else if(cmd==='gate'){const s=readStatus(); const m=JSON.parse(readFileSync(val('--manifest',`${stagingRoot(s.runId)}/manifest.json`),'utf8')); const r=canCommitGeneratedArtifacts(s,m,{commitRequested:val('--commit','false')==='true'}); updateStatus({commitEligible:r.ok,commitGateStatus:r.ok?'PASS':'FAIL',completionDeclaration:evaluateNationalCompletion(s,m,{commitRequested:val('--commit','false')==='true'}).completionDeclaration}); if(!r.ok){console.error(`ACS commit blocked: ${r.reasons.join('; ')}`); process.exit(1);}}
else if(cmd==='summary'){const s=readStatus(); let m=null, provisional=false; const p=val('--manifest',`${stagingRoot(s.runId)}/manifest.json`); if(existsSync(p)){m=JSON.parse(readFileSync(p,'utf8')); provisional=p.includes('/data/work/')||p.startsWith('data/work/');} const text=truthfulSummary({status:s,manifest:m,provisional}); if(process.env.GITHUB_STEP_SUMMARY) appendFileSync(process.env.GITHUB_STEP_SUMMARY,text); else console.log(text);}
else throw new Error('unknown command');
}catch(e){console.error(`FAIL: ${e.message}`); process.exit(1);}
