#!/usr/bin/env tsx
/**
 * Validates all JSON data files in data/languages/ and data/layouts/ against their schemas.
 * Exits with code 1 if any file is invalid.
 *
 * Usage: npm run validate:data
 */
import { readFileSync, readdirSync, existsSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { validateLayoutShape, validateLanguageProfile, validateRegistry } from '../src/data/validator.js'

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')

let errors = 0
let checked = 0

function validateFile(filePath: string, label: string, validator: (data: unknown) => unknown): void {
  try {
    const raw = readFileSync(filePath, 'utf-8')
    const data: unknown = JSON.parse(raw)
    validator(data)
    console.log(`  ✓  ${label}`)
  } catch (err) {
    const message = (err as Error).message
    // Indent each line for readability
    const indented = message.split('\n').map(l => `     ${l}`).join('\n')
    console.error(`  ❌ ${label}`)
    console.error(indented)
    errors++
  }
  checked++
}

function validateDir(dir: string, validator: (data: unknown) => unknown): void {
  if (!existsSync(dir)) return
  const files = readdirSync(dir).filter(f => f.endsWith('.json'))
  for (const file of files) {
    validateFile(join(dir, file), `${dir.replace(ROOT, '.')}/${file}`, validator)
  }
}

console.log('Validating BBOARD data files...\n')

// Registry
const registryPath = join(ROOT, 'data', 'registry.json')
if (existsSync(registryPath)) {
  validateFile(registryPath, './data/registry.json', validateRegistry)
}

// Language profiles
validateDir(join(ROOT, 'data', 'languages'), validateLanguageProfile)

// Layout shapes
validateDir(join(ROOT, 'data', 'layouts'), validateLayoutShape)

// Summary
const status = errors === 0 ? '✓' : '❌'
console.log(`\n${status}  ${checked} file(s) checked — ${errors} error(s)`)

if (errors > 0) process.exit(1)
