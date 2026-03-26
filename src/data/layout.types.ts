import type { KeyId, LayerId, LayoutVariantId, ThemeId } from '../public/types.js'

/**
 * A single key slot within a keyboard row.
 * @example
 * const slot = createLayoutSlot(createKeyId('key-a'), 1)
 */
export interface LayoutSlot {
  /** The key this slot renders. */
  keyId: KeyId
  /** Relative width multiplier (1 = standard key unit). */
  width: number
  /** Optional visible label override. */
  label?: string
}

/**
 * A horizontal row of key slots.
 * @example
 * const row = createLayoutRow([slotA, slotB])
 */
export interface LayoutRow {
  /** Ordered slots in the row, left to right. */
  slots: LayoutSlot[]
  /** Optional height in pixels. */
  height?: number
}

/**
 * A named keyboard layer (shift state) containing rows.
 * @example
 * const layer = createLayoutLayer('base', [row1, row2])
 */
export interface LayoutLayer {
  /** The shift state this layer represents. */
  name: LayerId
  /** Ordered rows, top to bottom. */
  rows: LayoutRow[]
}

/**
 * The full shape of a keyboard layout variant.
 * @example
 * const shape = createLayoutShape('desktop-azerty', 'desktop', [baseLayer], 'light')
 */
export interface LayoutShape {
  /** Unique identifier for this variant. */
  id: LayoutVariantId
  /** Platform type: desktop or mobile. */
  variant: 'desktop' | 'mobile'
  /** Ordered layers; typically base + shift (+ altGr on desktop). */
  layers: LayoutLayer[]
  /** Default theme applied to this layout. */
  theme: ThemeId
}

/** Creates a {@link LayoutSlot}. */
export function createLayoutSlot(keyId: KeyId, width: number, label?: string): LayoutSlot {
  return label !== undefined ? { keyId, width, label } : { keyId, width }
}

/** Creates a {@link LayoutRow}. */
export function createLayoutRow(slots: LayoutSlot[], height?: number): LayoutRow {
  return height !== undefined ? { slots, height } : { slots }
}

/** Creates a {@link LayoutLayer}. */
export function createLayoutLayer(name: LayerId, rows: LayoutRow[]): LayoutLayer {
  return { name, rows }
}

/** Creates a {@link LayoutShape}. */
export function createLayoutShape(
  id: LayoutVariantId,
  variant: 'desktop' | 'mobile',
  layers: LayoutLayer[],
  theme: ThemeId,
): LayoutShape {
  return { id, variant, layers, theme }
}
