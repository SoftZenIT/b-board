import Ajv, { type ErrorObject, type ValidateFunction } from 'ajv';
import type { LayoutShape } from './layout.types.js';
import type { LanguageProfile } from './language.types.js';
import type { CompositionRulesCatalog, RegistryData } from './registry.types.js';

// Schemas are handcrafted from the TypeScript interfaces.
// Use `npm run bootstrap:schemas` only as a one-time starting template —
// the committed schemas are the authoritative source of truth and contain
// hand-tuned constraints (minimum, pattern, enum, additionalProperties) that
// the generator does not reproduce.
import layoutShapeSchema from '../../data/schemas/layout-shape.schema.json' with { type: 'json' };
import languageProfileSchema from '../../data/schemas/language-profile.schema.json' with { type: 'json' };
import registrySchema from '../../data/schemas/registry.schema.json' with { type: 'json' };
import compositionRulesSchema from '../../data/schemas/composition-rules.schema.json' with { type: 'json' };

const ajv = new Ajv({ allErrors: true });

/** Thrown when AJV validation fails. Includes the full multi-error report. */
export class ValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ValidationError';
  }
}

function buildErrorMessage(errors: ErrorObject[], title: string): string {
  const lines = [`Invalid ${title}:`];
  for (const err of errors) {
    const path = err.instancePath || '(root)';
    lines.push(`  ${path}: ${err.message as string}`);
    if (err.keyword === 'enum' && err.params && 'allowedValues' in err.params) {
      lines.push(
        `    allowed: ${(err.params as { allowedValues: unknown[] }).allowedValues.join(', ')}`
      );
    }
  }
  return lines.join('\n');
}

function makeValidator<T>(compiled: ValidateFunction, title: string): (data: unknown) => T {
  return (data: unknown): T => {
    if (!compiled(data)) {
      throw new ValidationError(buildErrorMessage(compiled.errors as ErrorObject[], title));
    }
    return data as unknown as T;
  };
}

/**
 * Validates raw data against the {@link LayoutShape} schema.
 * @throws {ValidationError} with a multi-error report if invalid.
 */
export const validateLayoutShape = makeValidator<LayoutShape>(
  ajv.compile(layoutShapeSchema),
  'LayoutShape'
);

/**
 * Validates raw data against the {@link LanguageProfile} schema.
 * @throws {ValidationError} with a multi-error report if invalid.
 */
export const validateLanguageProfile = makeValidator<LanguageProfile>(
  ajv.compile(languageProfileSchema),
  'LanguageProfile'
);

/**
 * Validates raw data against the {@link RegistryData} schema.
 * @throws {ValidationError} with a multi-error report if invalid.
 */
export const validateRegistry = makeValidator<RegistryData>(
  ajv.compile(registrySchema),
  'RegistryData'
);

/**
 * Validates raw data against the {@link CompositionRulesCatalog} schema.
 * @throws {ValidationError} with a multi-error report if invalid.
 */
export const validateCompositionRules = makeValidator<CompositionRulesCatalog>(
  ajv.compile(compositionRulesSchema),
  'CompositionRulesCatalog'
);
