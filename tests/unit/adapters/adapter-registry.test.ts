import { describe, it, expect } from 'vitest';
import { AdapterRegistry } from '../../../src/adapters/adapter-registry.js';
import { InputAdapter } from '../../../src/adapters/input-adapter.js';

describe('AdapterRegistry', () => {
  it('should register and retrieve adapters', () => {
    const registry = new AdapterRegistry();
    registry.register('input', InputAdapter);
    expect(registry.get('input')).toBe(InputAdapter);
  });
});
