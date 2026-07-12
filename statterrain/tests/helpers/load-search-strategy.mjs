import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';

export async function loadClassifier() {
  const root = process.cwd();
  const dir = join(root, '.tmp-tests');
  mkdirSync(dir, { recursive: true });
  const coords = readFileSync(join(root, 'src/lib/geocoding/coordinates.ts'), 'utf8').replaceAll('export function', 'function');
  const states = readFileSync(join(root, 'src/lib/geography/stateCodes.ts'), 'utf8').replaceAll('export const', 'const').replaceAll('export function', 'function');
  let strategy = readFileSync(join(root, 'src/lib/geocoding/searchStrategy.ts'), 'utf8');
  strategy = strategy.replace(/^import[^\n]+\n/gm, '').replace(/export type/g, 'type').replace(/export interface/g, 'interface').replace('export function classifyGeocodeSearchQuery', 'function classifyGeocodeSearchQuery');
  const file = join(dir, 'classifier.ts');
  writeFileSync(file, `${coords}\n${states}\n${strategy}\nexport { classifyGeocodeSearchQuery };`);
  return import(`file://${file}?t=${Date.now()}`);
}
