import { createKeyId } from '../../public/index.js';
import { createLayoutSlot, createLayoutRow, type LayoutRow } from '../layout.types.js';
import type { LayoutShape } from '../layout.types.js';
import { DESKTOP_AZERTY_WINDOWS } from './desktop-azerty-windows.js';

const LAYER_SUFFIX: Record<string, string> = {
  base: '',
  shift: 'shift',
  altGr: '', // modifier keys are not affected by AltGr — use base IDs
};

function macBottomRow(layerName: string): LayoutRow {
  const sfx = LAYER_SUFFIX[layerName] ?? layerName;
  const k = (base: string) => createKeyId(sfx ? `${base}-${sfx}` : base);
  return createLayoutRow([
    createLayoutSlot(k('key-ctrl'), 1.5, 'Ctrl'),
    createLayoutSlot(k('key-option'), 1.5, '⌥'),
    createLayoutSlot(k('key-cmd'), 1.5, '⌘'),
    createLayoutSlot(k('key-space'), 6.0, ' '),
    createLayoutSlot(k('key-cmd-right'), 1.5, '⌘'),
    createLayoutSlot(k('key-option-right'), 1.5, '⌥'),
    createLayoutSlot(k('key-ctrl-right'), 1.5, 'Ctrl'),
  ]);
}

export const DESKTOP_AZERTY_MACOS: LayoutShape = {
  ...DESKTOP_AZERTY_WINDOWS,
  id: 'desktop-azerty-macos',
  layers: DESKTOP_AZERTY_WINDOWS.layers.map((layer) => ({
    ...layer,
    rows: [...layer.rows.slice(0, 4), macBottomRow(layer.name)],
  })),
};
