import {
  createKeyOutput,
  createResolvedKey,
  createCompositionState,
  createInputOperation,
  createResolvedLayout,
} from '@/data/runtime.types.js'
import { createKeyId } from '@/public/types.js'
import { createLayoutShape } from '@/data/layout.types.js'
import { createLanguageProfile } from '@/data/language.types.js'

describe('createKeyOutput', () => {
  it('creates a key output with char only', () => {
    const out = createKeyOutput('a')
    expect(out.char).toBe('a')
    expect(out.composition).toBeUndefined()
  })
  it('creates a key output with a composition rule', () => {
    // Import createCompositionRule inline to keep test self-contained
    const rule = { trigger: '´', base: 'a', result: 'á', mode: 'tone' as const }
    const out = createKeyOutput('á', rule)
    expect(out.char).toBe('á')
    expect(out.composition).toBe(rule)
  })
})

describe('createCompositionState', () => {
  it('creates idle state', () => {
    const state = createCompositionState('none', '', false)
    expect(state.mode).toBe('none')
    expect(state.buffer).toBe('')
    expect(state.armed).toBe(false)
  })
  it('creates armed tone state', () => {
    const state = createCompositionState('tone-armed', '´', true)
    expect(state.mode).toBe('tone-armed')
    expect(state.armed).toBe(true)
  })
})

describe('createInputOperation', () => {
  it('creates an insert operation', () => {
    const op = createInputOperation('insert', 'á')
    expect(op.type).toBe('insert')
    expect(op.data).toBe('á')
    expect(op.selectionStart).toBeUndefined()
  })
  it('creates a delete operation with selection', () => {
    const op = createInputOperation('delete', '', 3)
    expect(op.type).toBe('delete')
    expect(op.selectionStart).toBe(3)
  })
})

describe('createResolvedLayout', () => {
  it('creates a resolved layout', () => {
    const shape = createLayoutShape('desktop-azerty', 'desktop', [], 'light')
    const profile = createLanguageProfile('yoruba', 'Yoruba', 'Yorùbá', [], [])
    const keyId = createKeyId('key-a')
    const keyOutput = createKeyOutput('a')
    const resolvedKey = createResolvedKey(keyId, {
      base: keyOutput,
      shift: createKeyOutput('A'),
      altGr: createKeyOutput(''),
    })
    const keyMap = new Map([[keyId, resolvedKey]])
    const resolved = createResolvedLayout(shape, profile, keyMap, new Map())
    expect(resolved.layout).toBe(shape)
    expect(resolved.language).toBe(profile)
    expect(resolved.keyMap.size).toBe(1)
  })
})
