import {
  isLanguageId,
  isKeyId,
  isLayoutVariantId,
  isThemeId,
  isTargetKind,
  isKeyActionType,
  isLayerId,
  isCompositionMode,
  createKeyId,
} from '@/public/types.js'

describe('isLanguageId', () => {
  it('accepts valid values', () => {
    expect(isLanguageId('yoruba')).toBe(true)
    expect(isLanguageId('fon-adja')).toBe(true)
    expect(isLanguageId('baatonum')).toBe(true)
    expect(isLanguageId('dendi')).toBe(true)
  })
  it('rejects invalid values', () => {
    expect(isLanguageId('french')).toBe(false)
    expect(isLanguageId('')).toBe(false)
    expect(isLanguageId(42)).toBe(false)
    expect(isLanguageId(null)).toBe(false)
    expect(isLanguageId(undefined)).toBe(false)
  })
})

describe('isKeyId', () => {
  it('accepts a branded KeyId', () => {
    const id = createKeyId('key-a')
    expect(isKeyId(id)).toBe(true)
  })
  it('treats any string as a valid KeyId at runtime', () => {
    // Brand is compile-time only; runtime guard checks typeof string
    expect(isKeyId('any-string')).toBe(true)
  })
  it('rejects non-strings', () => {
    expect(isKeyId(123)).toBe(false)
    expect(isKeyId(null)).toBe(false)
  })
})

describe('isLayoutVariantId', () => {
  it('accepts valid values', () => {
    expect(isLayoutVariantId('desktop-azerty')).toBe(true)
    expect(isLayoutVariantId('mobile-default')).toBe(true)
  })
  it('rejects invalid values', () => {
    expect(isLayoutVariantId('qwerty')).toBe(false)
    expect(isLayoutVariantId('')).toBe(false)
  })
})

describe('isThemeId', () => {
  it('accepts valid values', () => {
    expect(isThemeId('light')).toBe(true)
    expect(isThemeId('dark')).toBe(true)
    expect(isThemeId('auto')).toBe(true)
  })
  it('rejects invalid values', () => {
    expect(isThemeId('system')).toBe(false)
    expect(isThemeId('')).toBe(false)
  })
})

describe('isTargetKind', () => {
  it('accepts valid values', () => {
    expect(isTargetKind('input')).toBe(true)
    expect(isTargetKind('textarea')).toBe(true)
    expect(isTargetKind('contenteditable')).toBe(true)
    expect(isTargetKind('editor')).toBe(true)
  })
  it('rejects invalid values', () => {
    expect(isTargetKind('div')).toBe(false)
    expect(isTargetKind('')).toBe(false)
  })
})

describe('isKeyActionType', () => {
  it('accepts valid values', () => {
    for (const v of ['insert', 'delete', 'space', 'enter', 'compose', 'longpress']) {
      expect(isKeyActionType(v)).toBe(true)
    }
  })
  it('rejects invalid values', () => {
    expect(isKeyActionType('click')).toBe(false)
    expect(isKeyActionType('')).toBe(false)
  })
})

describe('isLayerId', () => {
  it('accepts valid values', () => {
    expect(isLayerId('base')).toBe(true)
    expect(isLayerId('shift')).toBe(true)
    expect(isLayerId('altGr')).toBe(true)
  })
  it('rejects invalid values', () => {
    expect(isLayerId('caps')).toBe(false)
    expect(isLayerId('')).toBe(false)
  })
})

describe('isCompositionMode', () => {
  it('accepts valid values', () => {
    expect(isCompositionMode('none')).toBe(true)
    expect(isCompositionMode('tone-armed')).toBe(true)
    expect(isCompositionMode('nasal-armed')).toBe(true)
  })
  it('rejects invalid values', () => {
    expect(isCompositionMode('active')).toBe(false)
    expect(isCompositionMode('')).toBe(false)
  })
})
