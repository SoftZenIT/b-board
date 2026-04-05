import { describe, expect, it } from 'vitest';
import { createKeyId } from '../../public/index.js';
import {
  mapPhysicalCodeToLogicalKey,
  PHYSICAL_MODIFIER_CODES,
  MODIFIER_KEY_IDS,
  computePhysicalLayer,
} from './physical-key-map.js';

describe('mapPhysicalCodeToLogicalKey', () => {
  it('should map AZERTY physical codes to logical desktop key ids', () => {
    // AZERTY row 0: Q position = A key, W position = Z key
    expect(mapPhysicalCodeToLogicalKey('KeyQ')).toBe(createKeyId('key-a'));
    expect(mapPhysicalCodeToLogicalKey('KeyW')).toBe(createKeyId('key-z'));
    // AZERTY row 1: A position = Q key, Semicolon position = M key
    expect(mapPhysicalCodeToLogicalKey('KeyA')).toBe(createKeyId('key-q'));
    expect(mapPhysicalCodeToLogicalKey('Semicolon')).toBe(createKeyId('key-m'));
    // Action keys
    expect(mapPhysicalCodeToLogicalKey('Enter')).toBe(createKeyId('key-enter'));
    expect(mapPhysicalCodeToLogicalKey('Backspace')).toBe(createKeyId('key-backspace'));
    expect(mapPhysicalCodeToLogicalKey('Space')).toBe(createKeyId('key-space'));
  });

  it('should return null for unknown codes', () => {
    expect(mapPhysicalCodeToLogicalKey('F12')).toBeNull();
  });
});

describe('computePhysicalLayer', () => {
  it('should return "base" with empty set', () => {
    expect(computePhysicalLayer(new Set())).toBe('base');
  });

  it('should return "shift" when ShiftLeft is held', () => {
    expect(computePhysicalLayer(new Set(['ShiftLeft']))).toBe('shift');
  });

  it('should return "shift" when ShiftRight is held', () => {
    expect(computePhysicalLayer(new Set(['ShiftRight']))).toBe('shift');
  });

  it('should return "altGr" when AltRight is held', () => {
    expect(computePhysicalLayer(new Set(['AltRight']))).toBe('altGr');
  });

  it('should return "shift" when both ShiftLeft and AltRight are held (Shift wins)', () => {
    expect(computePhysicalLayer(new Set(['ShiftLeft', 'AltRight']))).toBe('shift');
  });
});

describe('MODIFIER_KEY_IDS', () => {
  it('should contain key-shift', () => {
    expect(MODIFIER_KEY_IDS.has(createKeyId('key-shift'))).toBe(true);
  });

  it('should contain key-altgr', () => {
    expect(MODIFIER_KEY_IDS.has(createKeyId('key-altgr'))).toBe(true);
  });

  it('should not contain character keys like key-a', () => {
    expect(MODIFIER_KEY_IDS.has(createKeyId('key-a'))).toBe(false);
  });
});

describe('PHYSICAL_MODIFIER_CODES', () => {
  it('should contain ShiftLeft and AltRight', () => {
    expect(PHYSICAL_MODIFIER_CODES.has('ShiftLeft')).toBe(true);
    expect(PHYSICAL_MODIFIER_CODES.has('AltRight')).toBe(true);
  });

  it('should not contain character keys like KeyQ', () => {
    expect(PHYSICAL_MODIFIER_CODES.has('KeyQ')).toBe(false);
  });
});
