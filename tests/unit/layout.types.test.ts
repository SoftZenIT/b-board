import {
  createLayoutSlot,
  createLayoutRow,
  createLayoutLayer,
  createLayoutShape,
} from '@/data/layout.types.js'
import { createKeyId } from '@/public/types.js'

describe('createLayoutSlot', () => {
  it('creates a slot with required fields', () => {
    const slot = createLayoutSlot(createKeyId('key-a'), 1)
    expect(slot.keyId).toBe('key-a')
    expect(slot.width).toBe(1)
    expect(slot.label).toBeUndefined()
  })
  it('creates a slot with optional label', () => {
    const slot = createLayoutSlot(createKeyId('key-shift'), 1.5, 'Shift')
    expect(slot.label).toBe('Shift')
    expect(slot.width).toBe(1.5)
  })
})

describe('createLayoutRow', () => {
  it('creates a row from slots', () => {
    const slot = createLayoutSlot(createKeyId('key-a'), 1)
    const row = createLayoutRow([slot])
    expect(row.slots).toHaveLength(1)
    expect(row.height).toBeUndefined()
  })
  it('accepts optional height', () => {
    const row = createLayoutRow([], 56)
    expect(row.height).toBe(56)
  })
})

describe('createLayoutLayer', () => {
  it('creates a layer with id and rows', () => {
    const layer = createLayoutLayer('base', [])
    expect(layer.name).toBe('base')
    expect(layer.rows).toEqual([])
  })
})

describe('createLayoutShape', () => {
  it('creates a desktop layout shape', () => {
    const shape = createLayoutShape('desktop-azerty', 'desktop', [], 'light')
    expect(shape.id).toBe('desktop-azerty')
    expect(shape.variant).toBe('desktop')
    expect(shape.layers).toEqual([])
    expect(shape.theme).toBe('light')
  })
  it('creates a mobile layout shape', () => {
    const shape = createLayoutShape('mobile-default', 'mobile', [], 'dark')
    expect(shape.variant).toBe('mobile')
  })
})
