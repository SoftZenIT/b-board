import { validateLayoutShape, validateLanguageProfile, validateRegistry, validateCompositionRules } from '@/data/validator.js'

// ── LayoutShape ────────────────────────────────────────────────────────────────

const validLayout = {
  id: 'desktop-azerty',
  variant: 'desktop',
  layers: [
    {
      name: 'base',
      rows: [{ slots: [{ keyId: 'key-a', width: 1 }] }],
    },
  ],
  theme: 'light',
}

describe('validateLayoutShape', () => {
  it('accepts valid data and returns typed value', () => {
    const result = validateLayoutShape(validLayout)
    expect(result.id).toBe('desktop-azerty')
    expect(result.variant).toBe('desktop')
  })

  it('rejects missing required field', () => {
    const bad = { id: 'desktop-azerty', variant: 'desktop', layers: [] }
    expect(() => validateLayoutShape(bad)).toThrow(/theme/)
  })

  it('rejects invalid enum value for id', () => {
    const bad = { ...validLayout, id: 'qwerty-unknown' }
    expect(() => validateLayoutShape(bad)).toThrow()
  })

  it('rejects invalid variant', () => {
    const bad = { ...validLayout, variant: 'tablet' }
    expect(() => validateLayoutShape(bad)).toThrow()
  })

  it('rejects non-object input', () => {
    expect(() => validateLayoutShape('not an object')).toThrow()
    expect(() => validateLayoutShape(null)).toThrow()
  })
})

// ── LanguageProfile ────────────────────────────────────────────────────────────

const validLanguage = {
  languageId: 'yoruba',
  name: 'Yoruba',
  nativeName: 'Yorùbá',
  characters: [
    {
      keyId: 'key-a',
      baseChar: 'a',
      shiftChar: 'A',
    },
  ],
  compositionRules: [{ trigger: '´', base: 'a', result: 'á', mode: 'tone' }],
}

describe('validateLanguageProfile', () => {
  it('accepts valid data and returns typed value', () => {
    const result = validateLanguageProfile(validLanguage)
    expect(result.languageId).toBe('yoruba')
    expect(result.characters).toHaveLength(1)
  })

  it('rejects unknown languageId', () => {
    const bad = { ...validLanguage, languageId: 'french' }
    expect(() => validateLanguageProfile(bad)).toThrow()
  })

  it('rejects invalid composition rule mode', () => {
    const bad = {
      ...validLanguage,
      compositionRules: [{ trigger: '´', base: 'a', result: 'á', mode: 'click' }],
    }
    expect(() => validateLanguageProfile(bad)).toThrow()
  })

  it('rejects missing required character field', () => {
    const bad = {
      ...validLanguage,
      characters: [{ keyId: 'key-a' }], // missing baseChar
    }
    expect(() => validateLanguageProfile(bad)).toThrow()
  })

  it('rejects non-object input', () => {
    expect(() => validateLanguageProfile(42)).toThrow()
    expect(() => validateLanguageProfile(null)).toThrow()
  })
})

// ── RegistryData ───────────────────────────────────────────────────────────────

const validRegistry = {
  version: '1.0.0',
  languages: [{ id: 'yoruba', path: 'data/languages/yoruba.json' }],
  layouts: [{ id: 'desktop-azerty', path: 'data/layouts/desktop-azerty.json' }],
}

describe('validateRegistry', () => {
  it('accepts valid data and returns typed value', () => {
    const result = validateRegistry(validRegistry)
    expect(result.version).toBe('1.0.0')
    expect(result.languages).toHaveLength(1)
  })

  it('rejects invalid semver version', () => {
    const bad = { ...validRegistry, version: 'not-semver' }
    expect(() => validateRegistry(bad)).toThrow()
  })

  it('rejects unknown language id', () => {
    const bad = {
      ...validRegistry,
      languages: [{ id: 'igbo', path: 'data/languages/igbo.json' }],
    }
    expect(() => validateRegistry(bad)).toThrow()
  })

  it('error message includes json path', () => {
    const bad = { ...validRegistry, version: 'bad' }
    let message = ''
    try {
      validateRegistry(bad)
    } catch (e) {
      message = (e as Error).message
    }
    expect(message).toMatch(/version/)
  })

  it('collects multiple errors', () => {
    const bad = { version: 'bad', languages: 'not-array', layouts: 'not-array' }
    let message = ''
    try {
      validateRegistry(bad)
    } catch (e) {
      message = (e as Error).message
    }
    // Should report more than one error
    expect(message.split('\n').length).toBeGreaterThan(1)
  })
})

// ── CompositionRulesCatalog ────────────────────────────────────────────────────

const validCatalog = {
  version: '1.0.0',
  triggers: [
    { trigger: '´', name: 'acute', mode: 'tone', description: 'High tone mark.' },
    { trigger: '`', name: 'grave', mode: 'tone' },
    { trigger: '~', name: 'tilde', mode: 'nasal' },
  ],
}

describe('validateCompositionRules', () => {
  it('accepts valid catalog and returns typed value', () => {
    const result = validateCompositionRules(validCatalog)
    expect(result.version).toBe('1.0.0')
    expect(result.triggers).toHaveLength(3)
  })

  it('rejects invalid semver version', () => {
    const bad = { ...validCatalog, version: 'not-semver' }
    expect(() => validateCompositionRules(bad)).toThrow()
  })

  it('rejects invalid mode value', () => {
    const bad = {
      ...validCatalog,
      triggers: [{ trigger: '´', name: 'acute', mode: 'click' }],
    }
    expect(() => validateCompositionRules(bad)).toThrow()
  })

  it('rejects missing required trigger field', () => {
    const bad = {
      ...validCatalog,
      triggers: [{ name: 'acute', mode: 'tone' }], // missing trigger
    }
    expect(() => validateCompositionRules(bad)).toThrow()
  })

  it('rejects empty triggers array', () => {
    const bad = { ...validCatalog, triggers: [] }
    expect(() => validateCompositionRules(bad)).toThrow()
  })

  it('rejects non-object input', () => {
    expect(() => validateCompositionRules(null)).toThrow()
    expect(() => validateCompositionRules('bad')).toThrow()
  })
})
