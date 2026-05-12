import { describe, expect, it } from 'vitest';
import { DESKTOP_AZERTY_WINDOWS } from './desktop-azerty-windows.js';
import { DESKTOP_AZERTY_MACOS } from './desktop-azerty-macos.js';
import { createKeyId } from '../../public/index.js';

describe('DESKTOP_AZERTY_WINDOWS', () => {
  it('has id desktop-azerty-windows', () => {
    expect(DESKTOP_AZERTY_WINDOWS.id).toBe('desktop-azerty-windows');
  });

  it('has 3 layers each with 5 rows', () => {
    for (const layer of DESKTOP_AZERTY_WINDOWS.layers) {
      expect(layer.rows).toHaveLength(5);
    }
  });

  it('base bottom row contains key-win', () => {
    const baseLayer = DESKTOP_AZERTY_WINDOWS.layers.find((l) => l.name === 'base')!;
    const bottomRow = baseLayer.rows[4];
    const keyIds = bottomRow.slots.map((s) => s.keyId);
    expect(keyIds).toContain(createKeyId('key-win'));
  });
});

describe('DESKTOP_AZERTY_MACOS', () => {
  it('has id desktop-azerty-macos', () => {
    expect(DESKTOP_AZERTY_MACOS.id).toBe('desktop-azerty-macos');
  });

  it('has 3 layers each with 5 rows', () => {
    for (const layer of DESKTOP_AZERTY_MACOS.layers) {
      expect(layer.rows).toHaveLength(5);
    }
  });

  it('base bottom row contains key-cmd and key-option', () => {
    const baseLayer = DESKTOP_AZERTY_MACOS.layers.find((l) => l.name === 'base')!;
    const bottomRow = baseLayer.rows[4];
    const keyIds = bottomRow.slots.map((s) => s.keyId);
    expect(keyIds).toContain(createKeyId('key-cmd'));
    expect(keyIds).toContain(createKeyId('key-option'));
    expect(keyIds).not.toContain(createKeyId('key-win'));
  });

  it('shift bottom row contains key-cmd-shift and key-option-shift', () => {
    const shiftLayer = DESKTOP_AZERTY_MACOS.layers.find((l) => l.name === 'shift')!;
    const bottomRow = shiftLayer.rows[4];
    const keyIds = bottomRow.slots.map((s) => s.keyId);
    expect(keyIds).toContain(createKeyId('key-cmd-shift'));
    expect(keyIds).toContain(createKeyId('key-option-shift'));
  });

  it('altGr bottom row uses base modifier key IDs (not altgr-suffixed)', () => {
    const altGrLayer = DESKTOP_AZERTY_MACOS.layers.find((l) => l.name === 'altGr')!;
    const keyIds = altGrLayer.rows[4].slots.map((s) => s.keyId);
    expect(keyIds).toContain(createKeyId('key-cmd'));
    expect(keyIds).not.toContain(createKeyId('key-cmd-altgr'));
  });

  it('rows 0-3 are identical to Windows layout', () => {
    for (let l = 0; l < DESKTOP_AZERTY_WINDOWS.layers.length; l++) {
      for (let r = 0; r < 4; r++) {
        expect(DESKTOP_AZERTY_MACOS.layers[l].rows[r]).toEqual(
          DESKTOP_AZERTY_WINDOWS.layers[l].rows[r]
        );
      }
    }
  });
});
