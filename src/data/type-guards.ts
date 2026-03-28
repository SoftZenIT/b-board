import {
  validateLayoutShape,
  validateLanguageProfile,
  validateRegistry,
  validateCompositionRules,
} from './validator.js'
import type { LayoutShape } from './layout.types.js'
import type { LanguageProfile } from './language.types.js'
import type { RegistryData, CompositionRulesCatalog } from './registry.types.js'

/** Returns `true` if `data` is a valid {@link LayoutShape}. Never throws. */
export function isLayoutShape(data: unknown): data is LayoutShape {
  try {
    validateLayoutShape(data)
    return true
  } catch {
    return false
  }
}

/** Returns `true` if `data` is a valid {@link LanguageProfile}. Never throws. */
export function isLanguageProfile(data: unknown): data is LanguageProfile {
  try {
    validateLanguageProfile(data)
    return true
  } catch {
    return false
  }
}

/** Returns `true` if `data` is a valid {@link RegistryData}. Never throws. */
export function isRegistryData(data: unknown): data is RegistryData {
  try {
    validateRegistry(data)
    return true
  } catch {
    return false
  }
}

/** Returns `true` if `data` is a valid {@link CompositionRulesCatalog}. Never throws. */
export function isCompositionRulesCatalog(data: unknown): data is CompositionRulesCatalog {
  try {
    validateCompositionRules(data)
    return true
  } catch {
    return false
  }
}
