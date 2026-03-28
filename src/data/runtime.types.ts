import type { CompositionMode, KeyId } from '../public/types.js'
import type { CompositionRule, LanguageProfile } from './language.types.js'
import type { LayoutShape } from './layout.types.js'

/**
 * The resolved output for a single key at the current layer.
 * @example
 * const out = createKeyOutput('á', toneRule)
 */
export interface KeyOutput {
  /** The character this key produces. */
  char: string
  /** The composition rule attached, if any. */
  composition?: CompositionRule
}

/**
 * A fully resolved keyboard — layout + language + key-to-output map.
 * Built at runtime by the data loader once a language + layout pair is selected.
 * @example
 * const resolved = createResolvedLayout(shape, profile, keyMap, compositionMap)
 */
export interface ResolvedLayout {
  /** The layout shape (structure). */
  layout: LayoutShape
  /** The active language profile. */
  language: LanguageProfile
  /** Maps each KeyId to its current output character/rule. */
  keyMap: Map<KeyId, KeyOutput>
  /** Maps each trigger character to all composition rules for that trigger. */
  compositionMap: Map<string, CompositionRule[]>
}

/**
 * Live state of the composition engine between keystrokes.
 * @example
 * const state = createCompositionState('tone-armed', '´', true)
 */
export interface CompositionState {
  /** Current composition mode. */
  mode: CompositionMode
  /** Characters accumulated so far in the composition buffer. */
  buffer: string
  /** Whether a dead key has been pressed and is waiting for a base key. */
  armed: boolean
}

/**
 * A single operation to apply to the host input element.
 * @example
 * const op = createInputOperation('insert', 'á')
 */
export interface InputOperation {
  /** What to do: insert text or delete selection. */
  type: 'insert' | 'delete'
  /** The text payload (empty string for delete). */
  data: string
  /** Optional cursor/selection position hint. */
  selectionStart?: number
}

/** Creates a {@link KeyOutput}. */
export function createKeyOutput(char: string, composition?: CompositionRule): KeyOutput {
  return composition !== undefined ? { char, composition } : { char }
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
  keyMap: Map<KeyId, KeyOutput>,
  compositionMap: Map<string, CompositionRule[]>,
): ResolvedLayout {
  return { layout, language, keyMap, compositionMap }
}
