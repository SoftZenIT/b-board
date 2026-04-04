import { describe, expect, it } from 'vitest';
import { createKeyId } from '../../public/index.js';
import { mapPhysicalCodeToLogicalKey } from './physical-key-map.js';

describe('mapPhysicalCodeToLogicalKey', () => {
  it('should map browser codes to logical desktop key ids', () => {
    expect(mapPhysicalCodeToLogicalKey('KeyA')).toBe(createKeyId('key-a'));
    expect(mapPhysicalCodeToLogicalKey('Enter')).toBe(createKeyId('key-enter'));
  });

  it('should return null for unknown codes', () => {
    expect(mapPhysicalCodeToLogicalKey('F12')).toBeNull();
  });
});
