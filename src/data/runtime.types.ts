import type { CompositionMode, KeyId, LayerId } from '../public/types.js'
import type { CompositionRule, LanguageProfile } from './language.types.js'
import type { LayoutShape } from './layout.types.js'

/**
 * The resolved output for a single key at a specific layer.
 * @example
 * const out = createKeyOutput('á', toneRule)
 */
export interface KeyOutput {
  /** The character this key produces at this layer. */
  readonly char: string
  /** The composition rule attached to this key at this layer, if any. */
  readonly composition?: CompositionRule
}

/**
 * Represents a key's full behavior across all layers and interactions.
 * @example
 * const rk = createResolvedKey('key-a', { base: outA, shift: outShiftA })
 */
export interface ResolvedKey {
  /** The unique key identifier. */
  readonly keyId: KeyId
  /** Map of LayerId to its specific output. */
  readonly layers: Record<LayerId, KeyOutput>
  /** Array of characters for the long-press menu. */
  readonly longPress: readonly string[]
}

/**
 * A fully resolved keyboard — layout + language + key-to-output map.
 * Built at runtime by the data loader once a language + layout pair is selected.
 * @example
 * const resolved = createResolvedLayout(shape, profile, keyMap, compositionMap)
 */
export interface ResolvedLayout {
  /** The layout shape (structure). */
  readonly layout: LayoutShape
  /** The active language profile. */
  readonly language: LanguageProfile
  /** Maps each KeyId to its multi-layer resolved behavior. */
  readonly keyMap: Map<KeyId, ResolvedKey>
  /** Maps each trigger character to all composition rules for that trigger. */
  readonly compositionMap: Map<string, CompositionRule[]>
}

/**
 * Live state of the composition engine between keystrokes.
 * @example
 * const state = createCompositionState('tone-armed', '´', true)
 */
export interface CompositionState {
  /** Current composition mode. */
  readonly mode: CompositionMode
  /** Characters accumulated so far in the composition buffer. */
  readonly buffer: string
  /** Whether a dead key has been pressed and is waiting for a base key. */
  readonly armed: boolean
}

/**
 * A single operation to apply to the host input element.
 * @example
 * const op = createInputOperation('insert', 'á')
 */
export interface InputOperation {
  /** What to do: insert text or delete selection. */
  readonly type: 'insert' | 'delete'
  /** The text payload (empty string for delete). */
  readonly data: string
  /** Optional cursor/selection position hint. */
  readonly selectionStart?: number
}

/** Creates a {@link KeyOutput}. */
export function createKeyOutput(char: string, composition?: CompositionRule): KeyOutput {
  return composition !== undefined ? { char, composition } : { char }
}

/** Creates a {@link ResolvedKey}. */
export function createResolvedKey(
  keyId: KeyId,
  layers: Record<LayerId, KeyOutput>,
  longPress: string[] = [],
): ResolvedKey {
  return { keyId, layers, longPress }
}

/** Creates a {@link CompositionState}. */
export function createCompositionState(
  mode: CompositionMode,
  buffer: string,
  armed: boolean,
): CompositionState {
  return { mode, buffer, armed }
}

/** Creates an {@link InputOperation}. */
export function createInputOperation(
  type: 'insert' | 'delete',
  data: string,
  selectionStart?: number,
): InputOperation {
  return selectionStart !== undefined ? { type, data, selectionStart } : { type, data }
}

/** Creates a {@link ResolvedLayout}. */
export function createResolvedLayout(
  layout: LayoutShape,
  language: LanguageProfile,
  keyMap: Map<KeyId, ResolvedKey>,
  compositionMap: Map<string, CompositionRule[]>,
): ResolvedLayout {
  return { layout, language, keyMap, compositionMap }
}
