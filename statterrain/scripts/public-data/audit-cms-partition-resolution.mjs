import { readFileSync } from 'node:fs';
import { join } from 'node:path';
const root = process.cwd();
const manifest = JSON.parse(readFileSync(join(root, 'data/generated/cms-hospitals-national/manifest.json'), 'utf8'));
const bounds = readFileSync(join(root, 'src/lib/geography/stateBounds.ts'), 'utf8');
const names = readFileSync(join(root, 'src/lib/geography/stateCodes.ts'), 'utf8');
const selector = readFileSync(join(root, 'src/lib/geography/selectCmsHospitalPartitions.ts'), 'utf8');
const missing = [];
for (const code of manifest.statesPresent ?? []) {
  if (!bounds.includes(`${code}: {`)) missing.push(`${code}: missing state bounds`);
  if (!names.includes(`"${code}"`)) missing.push(`${code}: missing state-code metadata`);
}
for (const p of manifest.partitions ?? []) {
  if (!manifest.statesPresent.includes(p.state)) missing.push(`${p.state}: partition state absent from statesPresent`);
  if (!p.publicPath && !p.path) missing.push(`${p.state}: partition has no path`);
}
for (const required of ['resolveStateFromCoordinates','primary-state-plus-radius-bounds','unresolved']) if (!selector.includes(required)) missing.push(`selector missing ${required}`);
if (missing.length) { console.error('CMS partition resolution audit failed:'); for (const m of missing) console.error(`- ${m}`); process.exit(1); }
console.log(`CMS partition resolution audit passed for ${manifest.statesPresent.length} manifest states/territories.`);
