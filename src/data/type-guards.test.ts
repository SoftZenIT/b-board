import { describe, it, expect } from 'vitest'
import {
  isLayoutShape,
  isLanguageProfile,
  isRegistryData,
  isCompositionRulesCatalog,
} from './type-guards.js'

const validLayout = {
  id: 'desktop-azerty',
  variant: 'desktop',
  layers: [{ name: 'base', rows: [{ slots: [{ keyId: 'key-a', width: 1 }] }] }],
  theme: 'light',
}

const validLanguage = {
  languageId: 'yoruba',
  name: 'Yoruba',
  nativeName: 'Yorùbá',
  characters: [{ keyId: 'key-a', baseChar: 'a' }],
  compositionRules: [],
}

const validRegistry = {
  version: '1.0.0',
  languages: [{ id: 'yoruba', path: 'data/languages/yoruba.json' }],
  layouts: [{ id: 'desktop-azerty', path: 'data/layouts/desktop-azerty.json' }],
}

const validCatalog = {
  version: '1.0.0',
  triggers: [{ trigger: '´', name: 'acute', mode: 'tone' }],
}

describe('isLayoutShape', () => {
  it('returns true for valid LayoutShape', () => {
    expect(isLayoutShape(validLayout)).toBe(true)
  })
  it('returns false for invalid data', () => {
    expect(isLayoutShape({ id: 'desktop-azerty' })).toBe(false)
  })
  it('returns false for null', () => {
    expect(isLayoutShape(null)).toBe(false)
  })
  it('returns false for a string', () => {
    expect(isLayoutShape('not-an-object')).toBe(false)
  })
})

describe('isLanguageProfile', () => {
  it('returns true for valid LanguageProfile', () => {
    expect(isLanguageProfile(validLanguage)).toBe(true)
  })
  it('returns false for missing required field', () => {
    expect(isLanguageProfile({ languageId: 'yoruba' })).toBe(false)
  })
  it('returns false for unknown languageId', () => {
    expect(isLanguageProfile({ ...validLanguage, languageId: 'french' })).toBe(false)
  })
})

describe('isRegistryData', () => {
  it('returns true for valid RegistryData', () => {
    expect(isRegistryData(validRegistry)).toBe(true)
  })
  it('returns false for invalid semver', () => {
    expect(isRegistryData({ ...validRegistry, version: 'bad' })).toBe(false)
  })
})

describe('isCompositionRulesCatalog', () => {
  it('returns true for valid catalog', () => {
    expect(isCompositionRulesCatalog(validCatalog)).toBe(true)
  })
  it('returns false for empty triggers', () => {
    expect(isCompositionRulesCatalog({ ...validCatalog, triggers: [] })).toBe(false)
  })
  it('never throws — always returns boolean', () => {
    expect(() => isCompositionRulesCatalog(undefined)).not.toThrow()
    expect(isCompositionRulesCatalog(undefined)).toBe(false)
  })
})
