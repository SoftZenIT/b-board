#!/usr/bin/env tsx
/**
 * Generates JSON Schema files from TypeScript interfaces.
 * Uses ts-json-schema-generator with tsconfig.schema.json.
 *
 * Usage: npm run generate:schemas
 *
 * Output: data/schemas/{type}.schema.json
 */
import { execFileSync } from 'node:child_process'
import { mkdirSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')
const SCHEMAS_DIR = join(ROOT, 'data', 'schemas')
const TSCONFIG = join(ROOT, 'tsconfig.schema.json')
const BIN = join(ROOT, 'node_modules', '.bin', 'ts-json-schema-generator')

mkdirSync(SCHEMAS_DIR, { recursive: true })

const targets = [
  {
    path: 'src/data/language.types.ts',
    type: 'LanguageProfile',
    out: 'language-profile.schema.json',
  },
  {
    path: 'src/data/layout.types.ts',
    type: 'LayoutShape',
    out: 'layout-shape.schema.json',
  },
  {
    path: 'src/data/registry.types.ts',
    type: 'RegistryData',
    out: 'registry.schema.json',
  },
]

let failed = 0
for (const { path, type, out } of targets) {
  const outPath = join(SCHEMAS_DIR, out)
  process.stdout.write(`Generating schema for ${type}... `)
  try {
    execFileSync(BIN, [
      '--path', path,
      '--type', type,
      '--tsconfig', TSCONFIG,
      '--out', outPath,
      '--expose', 'none',
      '--no-type-check',
    ], { cwd: ROOT, stdio: 'pipe' })
    console.log(`✓  → data/schemas/${out}`)
  } catch (err) {
    console.error(`✗`)
    console.error(String(err))
    failed++
  }
}

if (failed > 0) {
  console.error(`\n${failed} schema(s) failed to generate.`)
  process.exit(1)
}

console.log(`\n✓ All schemas generated in data/schemas/`)
