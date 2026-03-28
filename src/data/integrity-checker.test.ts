import { describe, it, expect } from 'vitest'
import { IntegrityError, checkLayoutIntegrity, checkLanguageIntegrity, checkCompositionIntegrity } from './integrity-checker.js'
import type { LayoutShape } from './layout.types.js'
import type { LanguageProfile } from './language.types.js'
import type { CompositionRulesCatalog } from './registry.types.js'

// ── Fixtures ────────────────────────────────────────────────────────────────

const validShape: LayoutShape = {
  id: 'desktop-azerty',
  variant: 'desktop',
  layers: [
    {
      name: 'base',
      rows: [
        { slots: [{ keyId: 'key-a' as any, width: 1 }, { keyId: 'key-b' as any, width: 1 }] },
      ],
    },
  ],
  theme: 'light',
}

const validProfile: LanguageProfile = {
  languageId: 'yoruba',
  name: 'Yoruba',
  nativeName: 'Yorùbá',
  characters: [
    { keyId: 'key-a' as any, baseChar: 'a' },
    { keyId: 'key-b' as any, baseChar: 'b' },
  ],
  compositionRules: [
    { trigger: '´', base: 'a', result: 'á', mode: 'tone' },
    { trigger: '´', base: 'e', result: 'é', mode: 'tone' },
  ],
}

const validCatalog: CompositionRulesCatalog = {
  version: '1.0.0',
  triggers: [
    { trigger: '´', name: 'acute', mode: 'tone' },
    { trigger: '`', name: 'grave', mode: 'tone' },
  ],
}

// ── checkLayoutIntegrity ─────────────────────────────────────────────────────

describe('checkLayoutIntegrity', () => {
  it('passes for a layout with unique keyIds', () => {
    expect(() => checkLayoutIntegrity(validShape)).not.toThrow()
  })

  it('throws IntegrityError for duplicate keyId within same layer', () => {
    const bad: LayoutShape = {
      ...validShape,
      layers: [
        {
          name: 'base',
          rows: [
            { slots: [{ keyId: 'key-a' as any, width: 1 }, { keyId: 'key-a' as any, width: 1 }] },
          ],
        },
      ],
    }
    expect(() => checkLayoutIntegrity(bad)).toThrow(IntegrityError)
    expect(() => checkLayoutIntegrity(bad)).toThrow(/duplicate keyId 'key-a'/)
  })

  it('throws IntegrityError for duplicate keyId across layers', () => {
    const bad: LayoutShape = {
      ...validShape,
      layers: [
        { name: 'base', rows: [{ slots: [{ keyId: 'key-a' as any, width: 1 }] }] },
        { name: 'shift', rows: [{ slots: [{ keyId: 'key-a' as any, width: 1 }] }] },
      ],
    }
    expect(() => checkLayoutIntegrity(bad)).toThrow(IntegrityError)
  })
})

// ── checkLanguageIntegrity ───────────────────────────────────────────────────

describe('checkLanguageIntegrity', () => {
  it('passes when all character keyIds exist in layout', () => {
    expect(() => checkLanguageIntegrity(validProfile, validShape)).not.toThrow()
  })

  it('throws IntegrityError when profile references unknown keyId', () => {
    const bad: LanguageProfile = {
      ...validProfile,
      characters: [{ keyId: 'key-z' as any, baseChar: 'z' }],
    }
    expect(() => checkLanguageIntegrity(bad, validShape)).toThrow(IntegrityError)
    expect(() => checkLanguageIntegrity(bad, validShape)).toThrow(/unknown keyId 'key-z'/)
  })

  it('throws IntegrityError for duplicate trigger+base in compositionRules', () => {
    const bad: LanguageProfile = {
      ...validProfile,
      compositionRules: [
        { trigger: '´', base: 'a', result: 'á', mode: 'tone' },
        { trigger: '´', base: 'a', result: 'à', mode: 'tone' }, // duplicate ´+a
      ],
    }
    expect(() => checkLanguageIntegrity(bad, validShape)).toThrow(IntegrityError)
    expect(() => checkLanguageIntegrity(bad, validShape)).toThrow(/duplicate.*´.*a/)
  })

  it('throws IntegrityError when a composition result is also a trigger (circular)', () => {
    const bad: LanguageProfile = {
      ...validProfile,
      compositionRules: [
        { trigger: '´', base: 'a', result: 'á', mode: 'tone' },
        { trigger: 'á', base: 'e', result: '´', mode: 'tone' }, // á is both trigger and result of ´
      ],
    }
    expect(() => checkLanguageIntegrity(bad, validShape)).toThrow(IntegrityError)
    expect(() => checkLanguageIntegrity(bad, validShape)).toThrow(/circular/)
  })
})

// ── checkCompositionIntegrity ─────────────────────────────────────────────────

describe('checkCompositionIntegrity', () => {
  it('passes for a catalog with unique triggers', () => {
    expect(() => checkCompositionIntegrity(validCatalog)).not.toThrow()
  })

  it('throws IntegrityError for duplicate trigger in catalog', () => {
    const bad: CompositionRulesCatalog = {
      ...validCatalog,
      triggers: [
        { trigger: '´', name: 'acute', mode: 'tone' },
        { trigger: '´', name: 'acute-alt', mode: 'tone' },
      ],
    }
    expect(() => checkCompositionIntegrity(bad)).toThrow(IntegrityError)
    expect(() => checkCompositionIntegrity(bad)).toThrow(/duplicate trigger '´'/)
  })
})
