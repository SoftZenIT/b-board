/**
 * Identifies a supported language.
 * @example const lang: LanguageId = 'yoruba'
 */
export type LanguageId = 'yoruba' | 'fon-adja' | 'baatonum' | 'dendi'

/** Type guard for {@link LanguageId}. */
export function isLanguageId(val: unknown): val is LanguageId {
  return val === 'yoruba' || val === 'fon-adja' || val === 'baatonum' || val === 'dendi'
}

// Branded string type — prevents accidental mixing of arbitrary strings with KeyIds at compile time.
declare const __keyIdBrand: unique symbol

/**
 * A unique identifier for a keyboard key.
 * Must be created via {@link createKeyId} to carry the brand.
 * @example const id: KeyId = createKeyId('key-a')
 */
export type KeyId = string & { readonly [__keyIdBrand]: void }

/**
 * Creates a branded {@link KeyId} from a plain string.
 * @example createKeyId('key-enter')
 */
export function createKeyId(raw: string): KeyId {
  return raw as KeyId
}

/**
 * Type guard for {@link KeyId}.
 * Note: The brand is compile-time only — at runtime this checks `typeof string`.
 */
export function isKeyId(val: unknown): val is KeyId {
  return typeof val === 'string'
}

/**
 * Identifies a keyboard layout variant.
 * @example const v: LayoutVariantId = 'desktop-azerty'
 */
export type LayoutVariantId = 'desktop-azerty' | 'mobile-default'

/** Type guard for {@link LayoutVariantId}. */
export function isLayoutVariantId(val: unknown): val is LayoutVariantId {
  return val === 'desktop-azerty' || val === 'mobile-default'
}

/**
 * Identifies a UI theme.
 * @example const t: ThemeId = 'dark'
 */
export type ThemeId = 'light' | 'dark' | 'auto'

/** Type guard for {@link ThemeId}. */
export function isThemeId(val: unknown): val is ThemeId {
  return val === 'light' || val === 'dark' || val === 'auto'
}

/**
 * The kind of DOM element the keyboard targets.
 * @example const k: TargetKind = 'input'
 */
export type TargetKind = 'input' | 'textarea' | 'contenteditable' | 'editor'

/** Type guard for {@link TargetKind}. */
export function isTargetKind(val: unknown): val is TargetKind {
  return val === 'input' || val === 'textarea' || val === 'contenteditable' || val === 'editor'
}

/**
 * The action a key press produces.
 * @example const a: KeyActionType = 'insert'
 */
export type KeyActionType = 'insert' | 'delete' | 'space' | 'enter' | 'compose' | 'longpress'

/** Type guard for {@link KeyActionType}. */
export function isKeyActionType(val: unknown): val is KeyActionType {
  return (
    val === 'insert' ||
    val === 'delete' ||
    val === 'space' ||
    val === 'enter' ||
    val === 'compose' ||
    val === 'longpress'
  )
}

/**
 * A keyboard layer (shift state).
 * @example const l: LayerId = 'shift'
 */
export type LayerId = 'base' | 'shift' | 'altGr'

/** Type guard for {@link LayerId}. */
export function isLayerId(val: unknown): val is LayerId {
  return val === 'base' || val === 'shift' || val === 'altGr'
}

/**
 * The current state of the composition engine.
 * @example const m: CompositionMode = 'tone-armed'
 */
export type CompositionMode = 'none' | 'tone-armed' | 'nasal-armed'

/** Type guard for {@link CompositionMode}. */
export function isCompositionMode(val: unknown): val is CompositionMode {
  return val === 'none' || val === 'tone-armed' || val === 'nasal-armed'
}
