import {
  createKeyId,
  createKeyEntry,
  createCompositionRule,
  createLanguageProfile,
  type LanguageProfile,
  type KeyCatalogEntry,
  type CompositionRule,
} from '../../public/index.js';

/**
 * Builder for LanguageProfile fixtures.
 * Provides sensible defaults while allowing per-field overrides.
 */
export function buildLanguageProfile(overrides: Partial<LanguageProfile> = {}): LanguageProfile {
  return createLanguageProfile(
    overrides.languageId ?? 'yoruba',
    overrides.name ?? 'Yoruba',
    overrides.nativeName ?? 'Yorùbá',
    overrides.characters ?? yorubaCharacters(),
    overrides.compositionRules ?? yorubaCompositionRules()
  );
}

/** Minimal Yoruba character set covering common keys with tones and sub-dots. */
export function yorubaCharacters(): KeyCatalogEntry[] {
  return [
    createKeyEntry(createKeyId('key-a'), 'a', 'A'),
    createKeyEntry(createKeyId('key-e'), 'e', 'E'),
    createKeyEntry(createKeyId('key-o'), 'o', 'O'),
    createKeyEntry(createKeyId('key-i'), 'i', 'I'),
    createKeyEntry(createKeyId('key-u'), 'u', 'U'),
    createKeyEntry(createKeyId('key-n'), 'n', 'N'),
    createKeyEntry(createKeyId('key-s'), 's', 'S', 'ṣ'),
    createKeyEntry(createKeyId('key-gb'), 'gb', 'GB'),
    createKeyEntry(createKeyId('key-acute'), '´', undefined, undefined, [
      createCompositionRule('´', 'a', 'á', 'tone'),
      createCompositionRule('´', 'e', 'é', 'tone'),
      createCompositionRule('´', 'o', 'ó', 'tone'),
      createCompositionRule('´', 'i', 'í', 'tone'),
      createCompositionRule('´', 'u', 'ú', 'tone'),
    ]),
    createKeyEntry(createKeyId('key-grave'), '`', undefined, undefined, [
      createCompositionRule('`', 'a', 'à', 'tone'),
      createCompositionRule('`', 'e', 'è', 'tone'),
      createCompositionRule('`', 'o', 'ò', 'tone'),
    ]),
  ];
}

/** Yoruba composition rules for tone marks. */
export function yorubaCompositionRules(): CompositionRule[] {
  return [
    createCompositionRule('´', 'a', 'á', 'tone'),
    createCompositionRule('´', 'e', 'é', 'tone'),
    createCompositionRule('´', 'o', 'ó', 'tone'),
    createCompositionRule('´', 'i', 'í', 'tone'),
    createCompositionRule('´', 'u', 'ú', 'tone'),
    createCompositionRule('`', 'a', 'à', 'tone'),
    createCompositionRule('`', 'e', 'è', 'tone'),
    createCompositionRule('`', 'o', 'ò', 'tone'),
  ];
}

/** Minimal Fon profile with nasal composition (uses 'fon-adja' LanguageId). */
export function buildFonProfile(overrides: Partial<LanguageProfile> = {}): LanguageProfile {
  return createLanguageProfile(
    overrides.languageId ?? 'fon-adja',
    overrides.name ?? 'Fon',
    overrides.nativeName ?? 'Fɔ̀ngbè',
    overrides.characters ?? fonCharacters(),
    overrides.compositionRules ?? fonCompositionRules()
  );
}

export function fonCharacters(): KeyCatalogEntry[] {
  return [
    createKeyEntry(createKeyId('key-a'), 'a', 'A'),
    createKeyEntry(createKeyId('key-e'), 'e', 'E'),
    createKeyEntry(createKeyId('key-o'), 'o', 'O'),
    createKeyEntry(createKeyId('key-n'), 'n', 'N'),
    createKeyEntry(createKeyId('key-tilde'), '~', undefined, undefined, [
      createCompositionRule('~', 'a', 'ã', 'nasal'),
      createCompositionRule('~', 'e', 'ẽ', 'nasal'),
      createCompositionRule('~', 'o', 'õ', 'nasal'),
    ]),
  ];
}

export function fonCompositionRules(): CompositionRule[] {
  return [
    createCompositionRule('~', 'a', 'ã', 'nasal'),
    createCompositionRule('~', 'e', 'ẽ', 'nasal'),
    createCompositionRule('~', 'o', 'õ', 'nasal'),
  ];
}

/** Empty profile for edge case testing (uses 'baatonum' LanguageId). */
export function buildEmptyProfile(overrides: Partial<LanguageProfile> = {}): LanguageProfile {
  return createLanguageProfile(
    overrides.languageId ?? 'baatonum',
    overrides.name ?? 'Empty',
    overrides.nativeName ?? 'Empty',
    overrides.characters ?? [],
    overrides.compositionRules ?? []
  );
}
