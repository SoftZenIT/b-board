import { describe, it, expect } from 'vitest';
import { createLayoutResolver } from './layout-resolver.js';
import { createKeyId } from '../public/types.js';
import type { LayoutShape } from './layout.types.js';
import type { LanguageProfile, KeyCatalogEntry } from './language.types.js';
import type { CompositionRulesCatalog } from './registry.types.js';

const keyA = createKeyId('key-a');
const keyB = createKeyId('key-b');
const keyBackspace = createKeyId('key-backspace');
const key1 = createKeyId('key-1');

const shape: LayoutShape = {
  id: 'desktop-azerty',
  variant: 'desktop',
  layers: [
    {
      name: 'base',
      rows: [
        {
          slots: [
            { keyId: keyA, width: 1 },
            { keyId: keyB, width: 1 },
          ],
        },
      ],
    },
  ],
  theme: 'light',
};

const profile: LanguageProfile = {
  languageId: 'yoruba',
  name: 'Yoruba',
  nativeName: 'Yorùbá',
  characters: [
    { keyId: keyA, baseChar: 'a', shiftChar: 'A' },
    { keyId: keyB, baseChar: 'b' },
  ],
  compositionRules: [
    { trigger: '´', base: 'a', result: 'á', mode: 'tone' },
    { trigger: '´', base: 'e', result: 'é', mode: 'tone' },
    { trigger: '`', base: 'a', result: 'à', mode: 'tone' },
  ],
};

const shapeWithExtras: LayoutShape = {
  id: 'desktop-azerty',
  variant: 'desktop',
  layers: [
    {
      name: 'base',
      rows: [
        {
          slots: [
            { keyId: keyA, width: 1 },
            { keyId: keyB, width: 1 },
            { keyId: keyBackspace, width: 1 },
            { keyId: key1, width: 1 },
          ],
        },
      ],
    },
  ],
  theme: 'light',
};

const universalEntries: KeyCatalogEntry[] = [
  { keyId: keyBackspace, baseChar: '\b' },
  { keyId: key1, baseChar: '1', shiftChar: '!' },
];

const catalog: CompositionRulesCatalog = {
  version: '1.0.0',
  triggers: [
    { trigger: '´', name: 'acute', mode: 'tone' },
    { trigger: '`', name: 'grave', mode: 'tone' },
  ],
};

describe('createLayoutResolver — resolve', () => {
  it('builds a keyMap mapping each keyId to its multi-layer resolved behavior', () => {
    const resolver = createLayoutResolver();
    const resolved = resolver.resolve(shape, profile, catalog, 'desktop-azerty', 'yoruba');

    const resA = resolved.keyMap.get(keyA);
    expect(resA?.layers.base.char).toBe('a');
    expect(resA?.layers.shift.char).toBe('A');

    const resB = resolved.keyMap.get(keyB);
    expect(resB?.layers.base.char).toBe('b');
    expect(resB?.layers.shift.char).toBe('B'); // auto-uppercase if shiftChar missing
  });

  it('keyMap contains all keys from the layout', () => {
    const resolver = createLayoutResolver();
    const resolved = resolver.resolve(shape, profile, catalog, 'desktop-azerty', 'yoruba');
    expect(resolved.keyMap.size).toBe(2);
  });

  it('builds compositionMap grouping rules by trigger', () => {
    const resolver = createLayoutResolver();
    const resolved = resolver.resolve(shape, profile, catalog, 'desktop-azerty', 'yoruba');
    const acuteRules = resolved.compositionMap.get('´');
    expect(acuteRules).toHaveLength(2);
    expect(acuteRules?.map((r) => r.result)).toContain('á');
    expect(acuteRules?.map((r) => r.result)).toContain('é');
  });

  it('compositionMap contains all unique triggers from profile', () => {
    const resolver = createLayoutResolver();
    const resolved = resolver.resolve(shape, profile, catalog, 'desktop-azerty', 'yoruba');
    expect(resolved.compositionMap.has('´')).toBe(true);
    expect(resolved.compositionMap.has('`')).toBe(true);
    expect(resolved.compositionMap.size).toBe(2);
  });

  it('resolved layout has correct layout and language references', () => {
    const resolver = createLayoutResolver();
    const resolved = resolver.resolve(shape, profile, catalog, 'desktop-azerty', 'yoruba');
    expect(resolved.layout).toBe(shape);
    expect(resolved.language).toBe(profile);
  });

  it('returns cached result on second call with same ids', () => {
    const resolver = createLayoutResolver();
    const first = resolver.resolve(shape, profile, catalog, 'desktop-azerty', 'yoruba');
    const second = resolver.resolve(shape, profile, catalog, 'desktop-azerty', 'yoruba');
    expect(first).toBe(second); // same object reference
  });

  it('does not share cache across different language+layout combinations', () => {
    const profile2: LanguageProfile = { ...profile, languageId: 'fon-adja' };
    const resolver = createLayoutResolver();
    const r1 = resolver.resolve(shape, profile, catalog, 'desktop-azerty', 'yoruba');
    const r2 = resolver.resolve(shape, profile2, catalog, 'desktop-azerty', 'fon-adja');
    expect(r1).not.toBe(r2);
  });

  it('resolution completes within 50ms', () => {
    const resolver = createLayoutResolver();
    const start = Date.now();
    resolver.resolve(shape, profile, catalog, 'desktop-azerty', 'yoruba');
    expect(Date.now() - start).toBeLessThan(50);
  });
});

describe('createLayoutResolver — cache management', () => {
  it('getCacheSize returns 0 initially', () => {
    const resolver = createLayoutResolver();
    expect(resolver.getCacheSize()).toBe(0);
  });

  it('getCacheSize increments after each unique resolution', () => {
    const profile2: LanguageProfile = { ...profile, languageId: 'fon-adja' };
    const resolver = createLayoutResolver();
    resolver.resolve(shape, profile, catalog, 'desktop-azerty', 'yoruba');
    expect(resolver.getCacheSize()).toBe(1);
    resolver.resolve(shape, profile2, catalog, 'desktop-azerty', 'fon-adja');
    expect(resolver.getCacheSize()).toBe(2);
  });

  it('clearCache resets the cache', () => {
    const resolver = createLayoutResolver();
    resolver.resolve(shape, profile, catalog, 'desktop-azerty', 'yoruba');
    resolver.clearCache();
    expect(resolver.getCacheSize()).toBe(0);
  });

  it('evicts oldest entry when maxCacheSize is exceeded', () => {
    const resolver = createLayoutResolver({ maxCacheSize: 2 });
    const p1: LanguageProfile = { ...profile, languageId: 'yoruba' };
    const p2: LanguageProfile = { ...profile, languageId: 'fon-adja' };
    const p3: LanguageProfile = { ...profile, languageId: 'baatonum' };

    const r1 = resolver.resolve(shape, p1, catalog, 'desktop-azerty', 'yoruba');
    resolver.resolve(shape, p2, catalog, 'desktop-azerty', 'fon-adja');
    // At capacity — adding p3 should evict p1 (oldest)
    resolver.resolve(shape, p3, catalog, 'desktop-azerty', 'baatonum');

    expect(resolver.getCacheSize()).toBe(2);
    // p1 was evicted — resolving again produces a NEW object
    const r1Again = resolver.resolve(shape, p1, catalog, 'desktop-azerty', 'yoruba');
    expect(r1Again).not.toBe(r1);
  });
});

describe('createLayoutResolver — universal entries', () => {
  it('merges universal entries into keyMap for keys present in layout', () => {
    const resolver = createLayoutResolver({ universalEntries });
    const resolved = resolver.resolve(
      shapeWithExtras,
      profile,
      catalog,
      'desktop-azerty',
      'yoruba'
    );

    const backspace = resolved.keyMap.get(keyBackspace);
    expect(backspace?.layers.base.char).toBe('\b');

    const digit1 = resolved.keyMap.get(key1);
    expect(digit1?.layers.base.char).toBe('1');
    expect(digit1?.layers.shift.char).toBe('!');
  });

  it('skips universal entries whose keyId is not in the layout shape', () => {
    const keyMissing = createKeyId('key-9999');
    const universalWithMissing: KeyCatalogEntry[] = [{ keyId: keyMissing, baseChar: 'x' }];
    const resolver = createLayoutResolver({ universalEntries: universalWithMissing });
    const resolved = resolver.resolve(
      shapeWithExtras,
      profile,
      catalog,
      'desktop-azerty',
      'yoruba'
    );
    expect(resolved.keyMap.has(keyMissing)).toBe(false);
  });

  it('language entries take precedence over universal entries for same keyId', () => {
    const conflicting: KeyCatalogEntry[] = [{ keyId: keyA, baseChar: 'UNIVERSAL' }];
    const resolver = createLayoutResolver({ universalEntries: conflicting });
    const resolved = resolver.resolve(
      shapeWithExtras,
      profile,
      catalog,
      'desktop-azerty',
      'yoruba'
    );
    expect(resolved.keyMap.get(keyA)?.layers.base.char).toBe('a'); // language wins
  });

  it('works without universalEntries (backward-compatible)', () => {
    const resolver = createLayoutResolver();
    const resolved = resolver.resolve(
      shapeWithExtras,
      profile,
      catalog,
      'desktop-azerty',
      'yoruba'
    );
    expect(resolved.keyMap.has(keyBackspace)).toBe(false);
  });

  it('two resolvers with different universalEntries produce different results', () => {
    const resolver1 = createLayoutResolver({ universalEntries: universalEntries });
    const resolver2 = createLayoutResolver({ universalEntries: [] });
    const r1 = resolver1.resolve(shapeWithExtras, profile, catalog, 'desktop-azerty', 'yoruba');
    const r2 = resolver2.resolve(shapeWithExtras, profile, catalog, 'desktop-azerty', 'yoruba');
    expect(r1.keyMap.has(keyBackspace)).toBe(true);
    expect(r2.keyMap.has(keyBackspace)).toBe(false);
  });
});

describe('yoruba.json longPress data', () => {
  it('key-a has longPress alternates', async () => {
    const { default: raw } = await import('../../data/languages/yoruba.json');
    const entry = (raw as any).characters.find((c: any) => c.keyId === 'key-a');
    expect(entry?.longPress).toEqual(['à', 'á']);
  });

  it('key-e has longPress alternates including ẹ', async () => {
    const { default: raw } = await import('../../data/languages/yoruba.json');
    const entry = (raw as any).characters.find((c: any) => c.keyId === 'key-e');
    expect(entry?.longPress).toEqual(['è', 'é', 'ẹ']);
  });
});
