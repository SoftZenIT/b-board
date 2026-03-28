import type { LayoutShape } from './layout.types.js'
import type { LanguageProfile } from './language.types.js'
import type { CompositionRulesCatalog } from './registry.types.js'

/**
 * Thrown when cross-file data consistency checks fail.
 * @example throw new IntegrityError('[IntegrityError] duplicate keyId')
 */
export class IntegrityError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'IntegrityError'
  }
}

/**
 * Checks that all keyIds in the layout are unique across all layers.
 * @throws {IntegrityError} if any keyId appears more than once.
 */
export function checkLayoutIntegrity(shape: LayoutShape): void {
  const seen = new Set<string>()
  for (const layer of shape.layers) {
    for (const row of layer.rows) {
      for (const slot of row.slots) {
        if (seen.has(slot.keyId)) {
          throw new IntegrityError(
            `[IntegrityError] Layout '${shape.id}' has duplicate keyId '${slot.keyId}'`,
          )
        }
        seen.add(slot.keyId)
      }
    }
  }
}

/**
 * Checks that all keyIds in the language profile exist in the layout, that
 * there are no duplicate trigger+base combinations, and no circular composition refs.
 * @param profile - The language profile to validate.
 * @param shape - The layout shape to validate against.
 * @throws {IntegrityError} on any violation.
 */
export function checkLanguageIntegrity(profile: LanguageProfile, shape: LayoutShape): void {
  // Build layout keyId set
  const layoutKeyIds = new Set<string>()
  for (const layer of shape.layers) {
    for (const row of layer.rows) {
      for (const slot of row.slots) {
        layoutKeyIds.add(slot.keyId)
      }
    }
  }

  // Check all character keyIds exist in layout
  for (const entry of profile.characters) {
    if (!layoutKeyIds.has(entry.keyId)) {
      throw new IntegrityError(
        `[IntegrityError] Language '${profile.languageId}' references unknown keyId '${entry.keyId}' not found in layout '${shape.id}'`,
      )
    }
  }

  // Check no duplicate trigger+base combos
  const ruleSeen = new Set<string>()
  for (const rule of profile.compositionRules) {
    const key = `${rule.trigger}+${rule.base}`
    if (ruleSeen.has(key)) {
      throw new IntegrityError(
        `[IntegrityError] Language '${profile.languageId}' has duplicate composition rule for trigger '${rule.trigger}' + base '${rule.base}'`,
      )
    }
    ruleSeen.add(key)
  }

  // Check no circular refs: a rule's result must not be another rule's trigger
  const triggers = new Set(profile.compositionRules.map((r) => r.trigger))
  for (const rule of profile.compositionRules) {
    if (triggers.has(rule.result)) {
      throw new IntegrityError(
        `[IntegrityError] Language '${profile.languageId}' has circular composition: result '${rule.result}' is also a trigger`,
      )
    }
  }
}

/**
 * Checks that the composition catalog has no duplicate trigger values.
 * @throws {IntegrityError} if any trigger appears more than once.
 */
export function checkCompositionIntegrity(catalog: CompositionRulesCatalog): void {
  const seen = new Set<string>()
  for (const entry of catalog.triggers) {
    if (seen.has(entry.trigger)) {
      throw new IntegrityError(
        `[IntegrityError] Composition catalog has duplicate trigger '${entry.trigger}'`,
      )
    }
    seen.add(entry.trigger)
  }
}
