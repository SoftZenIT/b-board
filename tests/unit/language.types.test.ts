import {
  createCompositionRule,
  createKeyEntry,
  createLanguageProfile,
} from '@/data/language.types.js'
import { createKeyId } from '@/public/types.js'

describe('createCompositionRule', () => {
  it('creates a tone composition rule', () => {
    const rule = createCompositionRule('´', 'a', 'á', 'tone')
    expect(rule.trigger).toBe('´')
    expect(rule.base).toBe('a')
    expect(rule.result).toBe('á')
    expect(rule.mode).toBe('tone')
  })
  it('creates a nasal composition rule', () => {
    const rule = createCompositionRule('~', 'o', 'õ', 'nasal')
    expect(rule.mode).toBe('nasal')
  })
})

describe('createKeyEntry', () => {
  it('creates a minimal key catalog entry', () => {
    const entry = createKeyEntry(createKeyId('key-a'), 'a')
    expect(entry.keyId).toBe('key-a')
    expect(entry.baseChar).toBe('a')
    expect(entry.shiftChar).toBeUndefined()
    expect(entry.composition).toBeUndefined()
  })
  it('creates a full key catalog entry', () => {
    const rule = createCompositionRule('´', 'a', 'á', 'tone')
    const entry = createKeyEntry(createKeyId('key-a'), 'a', 'A', undefined, [rule])
    expect(entry.shiftChar).toBe('A')
    expect(entry.composition).toHaveLength(1)
  })
})

describe('createLanguageProfile', () => {
  it('creates a language profile', () => {
    const profile = createLanguageProfile('yoruba', 'Yoruba', 'Yorùbá', [], [])
    expect(profile.languageId).toBe('yoruba')
    expect(profile.name).toBe('Yoruba')
    expect(profile.nativeName).toBe('Yorùbá')
    expect(profile.characters).toEqual([])
    expect(profile.compositionRules).toEqual([])
  })
})
