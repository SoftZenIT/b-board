import { describe, expect, it } from 'vitest';
import { createDesktopState } from './desktop-state.js';

describe('createDesktopState', () => {
  it('should track held keys per instance without mutating previous sets', () => {
    const state = createDesktopState();
    state.pressPhysicalCode('KeyA');
    expect(state.snapshot().heldPhysicalKeys.has('KeyA')).toBe(true);
    state.releasePhysicalCode('KeyA');
    expect(state.snapshot().heldPhysicalKeys.has('KeyA')).toBe(false);
  });

  it('should default to base layer', () => {
    const state = createDesktopState();
    expect(state.snapshot().activeLayer).toBe('base');
  });

  it('should update focused key', () => {
    const state = createDesktopState();
    state.setFocusedKey('key-a' as never);
    expect(state.snapshot().focusedKeyId).toBe('key-a');
    state.setFocusedKey(null);
    expect(state.snapshot().focusedKeyId).toBeNull();
  });

  it('should clear held physical keys', () => {
    const state = createDesktopState();
    state.pressPhysicalCode('ShiftLeft');
    state.pressPhysicalCode('KeyA');
    expect(state.snapshot().heldPhysicalKeys.size).toBe(2);
    state.clearHeldPhysicalKeys();
    expect(state.snapshot().heldPhysicalKeys.size).toBe(0);
  });

  it('should safely clear held physical keys when already empty', () => {
    const state = createDesktopState();
    expect(() => state.clearHeldPhysicalKeys()).not.toThrow();
    expect(state.snapshot().heldPhysicalKeys.size).toBe(0);
  });
});
