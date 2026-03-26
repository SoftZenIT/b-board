import type { LanguageId, LayoutVariantId } from '../public/types.js'

/**
 * A single entry in the registry pointing to a data file.
 * @example
 * const entry: LanguageRegistryEntry = { id: 'yoruba', path: 'data/languages/yoruba.json' }
 */
export interface LanguageRegistryEntry {
  /** Language identifier. */
  id: LanguageId
  /** Relative path to the language JSON file. */
  path: string
}

/**
 * A single layout entry in the registry.
 * @example
 * const entry: LayoutRegistryEntry = { id: 'desktop-azerty', path: 'data/layouts/desktop-azerty.json' }
 */
export interface LayoutRegistryEntry {
  /** Layout variant identifier. */
  id: LayoutVariantId
  /** Relative path to the layout JSON file. */
  path: string
}

/**
 * Root index of all available language and layout data files.
 * Loaded once at startup to discover available data without loading all files.
 * @example
 * const registry: RegistryData = { version: '1.0.0', languages: [...], layouts: [...] }
 */
export interface RegistryData {
  /** Semantic version of the data set. */
  version: string
  /** All registered language profiles. */
  languages: LanguageRegistryEntry[]
  /** All registered layout variants. */
  layouts: LayoutRegistryEntry[]
}

/**
 * A single dead-key trigger entry in the global composition rules catalog.
 * @example
 * const t: CompositionTriggerEntry = { trigger: '´', name: 'acute', mode: 'tone' }
 */
export interface CompositionTriggerEntry {
  /** The dead-key character that arms composition. */
  trigger: string
  /** Human-readable name for the trigger (e.g. 'acute'). */
  name: string
  /** Whether this trigger produces a tone mark or a nasal mark. */
  mode: 'tone' | 'nasal'
  /** Optional description shown in documentation. */
  description?: string
}

/**
 * Global catalog of dead-key triggers used across all language profiles.
 * @example
 * const catalog: CompositionRulesCatalog = { version: '1.0.0', triggers: [...] }
 */
export interface CompositionRulesCatalog {
  /** Semantic version of the catalog. */
  version: string
  /** All registered dead-key triggers. */
  triggers: CompositionTriggerEntry[]
}
