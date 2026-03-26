import type { KeyId, LanguageId } from '../public/types.js'

/**
 * The kind of composition a rule applies — shared by {@link CompositionRule}
 * and {@link CompositionTriggerEntry} in the global catalog.
 */
export type CompositionRuleMode = 'tone' | 'nasal'

/**
 * A composition rule — maps a trigger + base to a composed result.
 * @example
 * const rule = createCompositionRule('´', 'a', 'á', 'tone')
 */
export interface CompositionRule {
  /** The dead key or modifier that arms composition. */
  trigger: string
  /** The base character to combine with. */
  base: string
  /** The resulting composed character. */
  result: string
  /** Whether this is a tone or nasal composition. */
  mode: CompositionRuleMode
}

/**
 * A single entry in a language's key catalog, mapping a key to its outputs.
 * @example
 * const entry = createKeyEntry(createKeyId('key-a'), 'a', 'A')
 */
export interface KeyCatalogEntry {
  /** The key this entry describes. */
  keyId: KeyId
  /** Character produced by the base layer. */
  baseChar: string
  /** Character produced by the shift layer. */
  shiftChar?: string
  /** Character produced by the AltGr layer. */
  altGrChar?: string
  /** Composition rules triggered from this key. */
  composition?: CompositionRule[]
}

/**
 * A full language profile including its key catalog and composition rules.
 * @example
 * const profile = createLanguageProfile('yoruba', 'Yoruba', 'Yorùbá', entries, rules)
 */
export interface LanguageProfile {
  /** Unique language identifier. */
  languageId: LanguageId
  /** English name of the language. */
  name: string
  /** Name in the language itself. */
  nativeName: string
  /** All keyed characters for this language. */
  characters: KeyCatalogEntry[]
  /** Composition rules (tone marks, nasal marks, dead keys). */
  compositionRules: CompositionRule[]
}

/** Creates a {@link CompositionRule}. */
export function createCompositionRule(
  trigger: string,
  base: string,
  result: string,
  mode: 'tone' | 'nasal',
): CompositionRule {
  return { trigger, base, result, mode }
}

/** Creates a {@link KeyCatalogEntry}. */
export function createKeyEntry(
  keyId: KeyId,
  baseChar: string,
  shiftChar?: string,
  altGrChar?: string,
  composition?: CompositionRule[],
): KeyCatalogEntry {
  const entry: KeyCatalogEntry = { keyId, baseChar }
  if (shiftChar !== undefined) entry.shiftChar = shiftChar
  if (altGrChar !== undefined) entry.altGrChar = altGrChar
  if (composition !== undefined) entry.composition = composition
  return entry
}

/** Creates a {@link LanguageProfile}. */
export function createLanguageProfile(
  languageId: LanguageId,
  name: string,
  nativeName: string,
  characters: KeyCatalogEntry[],
  compositionRules: CompositionRule[],
): LanguageProfile {
  return { languageId, name, nativeName, characters, compositionRules }
}
