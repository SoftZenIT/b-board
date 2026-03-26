import Ajv, { type ErrorObject } from 'ajv'
import type { LayoutShape } from './layout.types.js'
import type { LanguageProfile } from './language.types.js'
import type { CompositionRulesCatalog, RegistryData } from './registry.types.js'

// Schemas are handcrafted from the TypeScript interfaces.
// Use `npm run bootstrap:schemas` only as a one-time starting template —
// the committed schemas are the authoritative source of truth and contain
// hand-tuned constraints (minimum, pattern, enum) that the generator does not reproduce.
import layoutShapeSchema from '../../data/schemas/layout-shape.schema.json' with { type: 'json' }
import languageProfileSchema from '../../data/schemas/language-profile.schema.json' with { type: 'json' }
import registrySchema from '../../data/schemas/registry.schema.json' with { type: 'json' }
import compositionRulesSchema from '../../data/schemas/composition-rules.schema.json' with { type: 'json' }

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
const validateCompositionRulesCatalog = ajv.compile(compositionRulesSchema)

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

/**
 * Validates raw data against the {@link CompositionRulesCatalog} schema.
 * @throws {ValidationError} with a multi-error report if invalid.
 */
export function validateCompositionRules(data: unknown): CompositionRulesCatalog {
  if (!validateCompositionRulesCatalog(data)) {
    throw new ValidationError(buildErrorMessage(validateCompositionRulesCatalog.errors ?? [], 'CompositionRulesCatalog'))
  }
  return data as unknown as CompositionRulesCatalog
}
