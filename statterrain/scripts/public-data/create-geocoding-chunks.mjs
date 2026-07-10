import { readFile, writeFile, mkdir } from 'node:fs/promises';
import path from 'node:path';
const root=process.cwd();
const reportPath=process.argv[2] || path.join(root,'data/reports/address-geocoding-delta-v0.3.0.json');
const chunkSize=Number(process.argv[3] || 100);
const outPath=process.argv[4] || path.join(root,'data/reports/geocoding-chunk-plan-v0.3.0.json');
const report=JSON.parse(await readFile(reportPath,'utf8'));
const needed=(report.classifications||[]).filter(r=>['new-address-needs-geocoding','changed-address-needs-geocoding','missing-address-not-geocodable','needs-review'].includes(r.classification));
const chunks=[]; for(let i=0;i<needed.length;i+=chunkSize){chunks.push({chunkId:`${report.sourceId}-chunk-${String(chunks.length+1).padStart(3,'0')}`,startIndex:i,endIndex:Math.min(i+chunkSize,needed.length)-1,recordCount:Math.min(chunkSize,needed.length-i),status:'planned-only'});}
const plan={schemaVersion:'geocoding-chunk-plan-v0.3.0',generatedAt:'2026-07-10T00:00:00.000Z',sourceId:report.sourceId,chunkSize,totalRecordsNeedingGeocoding:needed.length,chunks,recommendedWorkflow:['Review delta report in PR.','Run bounded chunks manually in a future patch only after source artifact review.','Commit generated results for review; do not auto-merge.'],warnings:['Planning only: no network calls, no live Census calls, no scheduled cron, no PR creation.']};
await mkdir(path.dirname(outPath),{recursive:true}); await writeFile(outPath,JSON.stringify(plan,null,2)+'\n'); console.log(`Wrote ${path.relative(root,outPath)}`);
