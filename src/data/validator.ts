import Ajv, { type ErrorObject } from 'ajv'
import type { LayoutShape } from './layout.types.js'
import type { LanguageProfile } from './language.types.js'
import type { RegistryData } from './registry.types.js'

// Schemas are handcrafted from the TypeScript interfaces and regenerated via
// `npm run generate:schemas` when interfaces change.
import layoutShapeSchema from '../../data/schemas/layout-shape.schema.json' with { type: 'json' }
import languageProfileSchema from '../../data/schemas/language-profile.schema.json' with { type: 'json' }
import registrySchema from '../../data/schemas/registry.schema.json' with { type: 'json' }

const ajv = new Ajv({ allErrors: true })

/** Thrown when AJV validation fails. Includes the full multi-error report. */
export class ValidationError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'ValidationError'
  }
}

function buildErrorMessage(errors: ErrorObject[], title: string): string {
  const lines = [`Invalid ${title}:`]
  for (const err of errors) {
    const path = err.instancePath || '(root)'
    lines.push(`  ${path}: ${err.message ?? 'unknown error'}`)
    if (err.keyword === 'enum' && err.params && 'allowedValues' in err.params) {
      lines.push(`    allowed: ${(err.params as { allowedValues: unknown[] }).allowedValues.join(', ')}`)
    }
  }
  return lines.join('\n')
}

const validateLayout = ajv.compile(layoutShapeSchema)
const validateLanguage = ajv.compile(languageProfileSchema)
const validateReg = ajv.compile(registrySchema)

/**
 * Validates raw data against the {@link LayoutShape} schema.
 * @throws {ValidationError} with a multi-error report if invalid.
 */
export function validateLayoutShape(data: unknown): LayoutShape {
  if (!validateLayout(data)) {
    throw new ValidationError(buildErrorMessage(validateLayout.errors ?? [], 'LayoutShape'))
  }
  return data as unknown as LayoutShape
}

/**
 * Validates raw data against the {@link LanguageProfile} schema.
 * @throws {ValidationError} with a multi-error report if invalid.
 */
export function validateLanguageProfile(data: unknown): LanguageProfile {
  if (!validateLanguage(data)) {
    throw new ValidationError(buildErrorMessage(validateLanguage.errors ?? [], 'LanguageProfile'))
  }
  return data as unknown as LanguageProfile
}

/**
 * Validates raw data against the {@link RegistryData} schema.
 * @throws {ValidationError} with a multi-error report if invalid.
 */
export function validateRegistry(data: unknown): RegistryData {
  if (!validateReg(data)) {
    throw new ValidationError(buildErrorMessage(validateReg.errors ?? [], 'RegistryData'))
  }
  return data as unknown as RegistryData
}
