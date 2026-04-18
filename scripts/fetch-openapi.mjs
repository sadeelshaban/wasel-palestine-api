/**
 * Writes delivery/api-dog/openapi.json from a running API (no DB required in this repo).
 * Usage: BASE_URL=http://localhost:3000 node scripts/fetch-openapi.mjs
 */
import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const base = (process.env.BASE_URL || 'http://localhost:3000').replace(/\/$/, '');
const url = `${base}/openapi.json`;
const outDir = join(process.cwd(), 'delivery', 'api-dog');
const outFile = join(outDir, 'openapi.json');

const res = await fetch(url);
if (!res.ok) {
  console.error(`Failed to fetch ${url}: HTTP ${res.status}`);
  process.exit(1);
}
const doc = await res.json();
mkdirSync(outDir, { recursive: true });
writeFileSync(outFile, JSON.stringify(doc, null, 2), 'utf-8');
console.log('Wrote', outFile);
