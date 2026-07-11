#!/usr/bin/env node
import { cpSync, existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
const args = new Map(process.argv.slice(2).map(a => { const [k, v] = a.split('='); return [k, v ?? 'true']; }));
const sourceRoot = resolve(repoRoot, args.get('--source') ?? 'data/generated/cms-hospitals-national');
const destRoot = resolve(repoRoot, args.get('--dest') ?? 'public/generated/cms-hospitals-national');
const publicBase = '/generated/cms-hospitals-national';
const required = ['manifest.json', 'summary.json'];
for (const file of required) if (!existsSync(join(sourceRoot, file))) throw new Error(`Missing required CMS public asset source: ${join(sourceRoot, file)}`);
const manifest = JSON.parse(readFileSync(join(sourceRoot, 'manifest.json'), 'utf8'));
const partitions = [...(manifest.partitions ?? [])].sort((a, b) => String(a.state).localeCompare(String(b.state)));
if (!partitions.length) throw new Error('National CMS hospital manifest has no partitions to sync.');
rmSync(destRoot, { recursive: true, force: true });
mkdirSync(join(destRoot, 'states'), { recursive: true });
for (const file of required) cpSync(join(sourceRoot, file), join(destRoot, file));
let copied = 0;
for (const p of partitions) {
  const state = String(p.state ?? '').toUpperCase();
  if (!/^[A-Z]{2}$/.test(state)) throw new Error(`Invalid CMS partition state in manifest: ${p.state}`);
  const src = join(sourceRoot, 'states', `${state}.json`);
  if (!existsSync(src)) throw new Error(`Missing required CMS partition: ${src}`);
  cpSync(src, join(destRoot, 'states', `${state}.json`));
  copied += 1;
}
const browserManifest = {
  ...manifest,
  publicBasePath: publicBase,
  partitions: partitions.map(p => ({ ...p, publicPath: `${publicBase}/states/${String(p.state).toUpperCase()}.json` })),
};
writeFileSync(join(destRoot, 'manifest.json'), `${JSON.stringify(browserManifest, null, 2)}\n`);
console.log(`Synced national CMS hospital public assets: ${copied} partitions copied to ${destRoot}`);
