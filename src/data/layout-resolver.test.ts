import { describe, it, expect } from 'vitest'
import { createLayoutResolver } from './layout-resolver.js'
import { createKeyId } from '../public/types.js'
import type { LayoutShape } from './layout.types.js'
import type { LanguageProfile } from './language.types.js'
import type { CompositionRulesCatalog } from './registry.types.js'

const keyA = createKeyId('key-a')
const keyB = createKeyId('key-b')

const shape: LayoutShape = {
  id: 'desktop-azerty',
  variant: 'desktop',
  layers: [
    {
      name: 'base',
      rows: [{ slots: [{ keyId: keyA, width: 1 }, { keyId: keyB, width: 1 }] }],
    },
  ],
  theme: 'light',
}

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
}

const catalog: CompositionRulesCatalog = {
  version: '1.0.0',
  triggers: [
    { trigger: '´', name: 'acute', mode: 'tone' },
    { trigger: '`', name: 'grave', mode: 'tone' },
  ],
}

describe('createLayoutResolver — resolve', () => {
  it('builds a keyMap mapping each keyId to its base character', () => {
    const resolver = createLayoutResolver()
    const resolved = resolver.resolve(shape, profile, catalog, 'desktop-azerty', 'yoruba')
    expect(resolved.keyMap.get(keyA)?.char).toBe('a')
    expect(resolved.keyMap.get(keyB)?.char).toBe('b')
  })

  it('keyMap contains all keys from the layout', () => {
    const resolver = createLayoutResolver()
    const resolved = resolver.resolve(shape, profile, catalog, 'desktop-azerty', 'yoruba')
    expect(resolved.keyMap.size).toBe(2)
  })

  it('builds compositionMap grouping rules by trigger', () => {
    const resolver = createLayoutResolver()
    const resolved = resolver.resolve(shape, profile, catalog, 'desktop-azerty', 'yoruba')
    const acuteRules = resolved.compositionMap.get('´')
    expect(acuteRules).toHaveLength(2)
    expect(acuteRules?.map((r) => r.result)).toContain('á')
    expect(acuteRules?.map((r) => r.result)).toContain('é')
  })

  it('compositionMap contains all unique triggers from profile', () => {
    const resolver = createLayoutResolver()
    const resolved = resolver.resolve(shape, profile, catalog, 'desktop-azerty', 'yoruba')
    expect(resolved.compositionMap.has('´')).toBe(true)
    expect(resolved.compositionMap.has('`')).toBe(true)
    expect(resolved.compositionMap.size).toBe(2)
  })

  it('resolved layout has correct layout and language references', () => {
    const resolver = createLayoutResolver()
    const resolved = resolver.resolve(shape, profile, catalog, 'desktop-azerty', 'yoruba')
    expect(resolved.layout).toBe(shape)
    expect(resolved.language).toBe(profile)
  })

  it('returns cached result on second call with same ids', () => {
    const resolver = createLayoutResolver()
    const first = resolver.resolve(shape, profile, catalog, 'desktop-azerty', 'yoruba')
    const second = resolver.resolve(shape, profile, catalog, 'desktop-azerty', 'yoruba')
    expect(first).toBe(second) // same object reference
  })

  it('does not share cache across different language+layout combinations', () => {
    const profile2: LanguageProfile = { ...profile, languageId: 'fon-adja' }
    const resolver = createLayoutResolver()
    const r1 = resolver.resolve(shape, profile, catalog, 'desktop-azerty', 'yoruba')
    const r2 = resolver.resolve(shape, profile2, catalog, 'desktop-azerty', 'fon-adja')
    expect(r1).not.toBe(r2)
  })

  it('resolution completes within 50ms', () => {
    const resolver = createLayoutResolver()
    const start = Date.now()
    resolver.resolve(shape, profile, catalog, 'desktop-azerty', 'yoruba')
    expect(Date.now() - start).toBeLessThan(50)
  })
})

describe('createLayoutResolver — cache management', () => {
  it('getCacheSize returns 0 initially', () => {
    const resolver = createLayoutResolver()
    expect(resolver.getCacheSize()).toBe(0)
  })

  it('getCacheSize increments after each unique resolution', () => {
    const profile2: LanguageProfile = { ...profile, languageId: 'fon-adja' }
    const resolver = createLayoutResolver()
    resolver.resolve(shape, profile, catalog, 'desktop-azerty', 'yoruba')
    expect(resolver.getCacheSize()).toBe(1)
    resolver.resolve(shape, profile2, catalog, 'desktop-azerty', 'fon-adja')
    expect(resolver.getCacheSize()).toBe(2)
  })

  it('clearCache resets the cache', () => {
    const resolver = createLayoutResolver()
    resolver.resolve(shape, profile, catalog, 'desktop-azerty', 'yoruba')
    resolver.clearCache()
    expect(resolver.getCacheSize()).toBe(0)
  })

  it('evicts oldest entry when maxCacheSize is exceeded', () => {
    const resolver = createLayoutResolver({ maxCacheSize: 2 })
    const p1: LanguageProfile = { ...profile, languageId: 'yoruba' }
    const p2: LanguageProfile = { ...profile, languageId: 'fon-adja' }
    const p3: LanguageProfile = { ...profile, languageId: 'baatonum' }

    const r1 = resolver.resolve(shape, p1, catalog, 'desktop-azerty', 'yoruba')
    resolver.resolve(shape, p2, catalog, 'desktop-azerty', 'fon-adja')
    // At capacity — adding p3 should evict p1 (oldest)
    resolver.resolve(shape, p3, catalog, 'desktop-azerty', 'baatonum')

    expect(resolver.getCacheSize()).toBe(2)
    // p1 was evicted — resolving again produces a NEW object
    const r1Again = resolver.resolve(shape, p1, catalog, 'desktop-azerty', 'yoruba')
    expect(r1Again).not.toBe(r1)
  })
})
