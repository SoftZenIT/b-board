// Each union type is derived from an `as const` tuple so the type and its runtime
// guard stay in sync — adding a value to the tuple automatically updates both.

const LANGUAGE_IDS = ['yoruba', 'fon-adja', 'baatonum', 'dendi'] as const;
/**
 * Identifies a supported language.
 * @example const lang: LanguageId = 'yoruba'
 */
export type LanguageId = (typeof LANGUAGE_IDS)[number];

/** Type guard for {@link LanguageId}. */
export function isLanguageId(val: unknown): val is LanguageId {
  return (LANGUAGE_IDS as readonly unknown[]).includes(val);
}

// Branded string type — prevents accidental mixing of arbitrary strings with KeyIds at compile time.
declare const __keyIdBrand: unique symbol;

/**
 * A unique identifier for a keyboard key.
 * Must be created via {@link createKeyId} to carry the brand.
 * @example const id: KeyId = createKeyId('key-a')
 */
export type KeyId = string & { readonly [__keyIdBrand]: void };

/**
 * Creates a branded {@link KeyId} from a plain string.
 * @example createKeyId('key-enter')
 */
export function createKeyId(raw: string): KeyId {
  return raw as KeyId;
}

/**
 * Type guard for {@link KeyId}.
 * Note: The brand is compile-time only — at runtime this checks `typeof string`.
 */
export function isKeyId(val: unknown): val is KeyId {
  return typeof val === 'string';
}

const LAYOUT_VARIANT_IDS = ['desktop-azerty', 'mobile-default'] as const;
/**
 * Identifies a keyboard layout variant.
 * @example const v: LayoutVariantId = 'desktop-azerty'
 */
export type LayoutVariantId = (typeof LAYOUT_VARIANT_IDS)[number];

/** Type guard for {@link LayoutVariantId}. */
export function isLayoutVariantId(val: unknown): val is LayoutVariantId {
  return (LAYOUT_VARIANT_IDS as readonly unknown[]).includes(val);
}

const THEME_IDS = ['light', 'dark', 'auto'] as const;
/**
 * Identifies a UI theme.
 * @example const t: ThemeId = 'dark'
 */
export type ThemeId = (typeof THEME_IDS)[number];

/** Type guard for {@link ThemeId}. */
export function isThemeId(val: unknown): val is ThemeId {
  return (THEME_IDS as readonly unknown[]).includes(val);
}

export const MODIFIER_DISPLAY_MODES = ['transition', 'hint'] as const;
export type ModifierDisplayMode = (typeof MODIFIER_DISPLAY_MODES)[number];
export function isModifierDisplayMode(val: unknown): val is ModifierDisplayMode {
  return (MODIFIER_DISPLAY_MODES as readonly unknown[]).includes(val);
}

const TARGET_KINDS = ['input', 'textarea', 'contenteditable', 'editor'] as const;
/**
 * The kind of DOM element the keyboard targets.
 * @example const k: TargetKind = 'input'
 */
export type TargetKind = (typeof TARGET_KINDS)[number];

/** Type guard for {@link TargetKind}. */
export function isTargetKind(val: unknown): val is TargetKind {
  return (TARGET_KINDS as readonly unknown[]).includes(val);
}

const KEY_ACTION_TYPES = ['insert', 'delete', 'space', 'enter', 'compose', 'longpress'] as const;
/**
 * The action a key press produces.
 * @example const a: KeyActionType = 'insert'
 */
export type KeyActionType = (typeof KEY_ACTION_TYPES)[number];

/** Type guard for {@link KeyActionType}. */
export function isKeyActionType(val: unknown): val is KeyActionType {
  return (KEY_ACTION_TYPES as readonly unknown[]).includes(val);
}

const LAYER_IDS = ['base', 'shift', 'altGr'] as const;
/**
 * A keyboard layer (shift state).
 * @example const l: LayerId = 'shift'
 */
export type LayerId = (typeof LAYER_IDS)[number];

/** Type guard for {@link LayerId}. */
export function isLayerId(val: unknown): val is LayerId {
  return (LAYER_IDS as readonly unknown[]).includes(val);
}

const COMPOSITION_MODES = ['none', 'tone-armed', 'nasal-armed'] as const;
/**
 * The current state of the composition engine.
 * @example const m: CompositionMode = 'tone-armed'
 */
export type CompositionMode = (typeof COMPOSITION_MODES)[number];

/** Type guard for {@link CompositionMode}. */
export function isCompositionMode(val: unknown): val is CompositionMode {
  return (COMPOSITION_MODES as readonly unknown[]).includes(val);
}
