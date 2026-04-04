import { describe, expect, it } from 'vitest';
import { createKeyId } from '../../public/index.js';
import { mapPhysicalCodeToLogicalKey } from './physical-key-map.js';

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
