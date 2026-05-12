#!/usr/bin/env node
import { execFileSync } from 'node:child_process';
import { writeFileSync } from 'node:fs';

const OUTPUT_FILE = process.env.PERF_OUTPUT ?? 'perf-results.json';

let raw;
try {
  raw = execFileSync('npx', ['size-limit', '--json'], { encoding: 'utf8' });
} catch (err) {
  process.stderr.write(`size-limit failed: ${err.message}\n`);
  process.exit(1);
}

const results = JSON.parse(raw);

writeFileSync(OUTPUT_FILE, JSON.stringify(results, null, 2));

let exceeded = false;
for (const entry of results) {
  const status = entry.passed ? 'PASS' : 'FAIL';
  process.stdout.write(`[${status}] ${entry.name}: ${entry.size} (limit: ${entry.sizeLimit})\n`);
  if (!entry.passed) exceeded = true;
}

if (exceeded) {
  process.stderr.write('Bundle size threshold exceeded.\n');
  process.exit(1);
}

process.stdout.write(`Results written to ${OUTPUT_FILE}\n`);
