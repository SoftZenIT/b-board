import { describe, it, expect } from 'vitest';
import { AdapterRegistry } from '../../../src/adapters/adapter-registry.js';
import { InputElementAdapter } from '../../../src/adapters/input-adapter.js';

describe('AdapterRegistry', () => {
  it('should register and retrieve adapters', () => {
    const registry = new AdapterRegistry();
    registry.register('input', InputElementAdapter);
    expect(registry.get('input')).toBe(InputElementAdapter);
  });
});
