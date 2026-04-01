import { describe, it, expect, beforeEach } from 'vitest';
import { createSubstates } from './substates.js';
import { INITIAL_SUBSTATES } from './substate.types.js';

describe('createSubstates', () => {
  let ss: ReturnType<typeof createSubstates>;

  beforeEach(() => {
    ss = createSubstates();
  });

  it('get() returns initial values', () => {
    const state = ss.get();
    expect(state.attachment).toBe('detached');
    expect(state.focus).toBe('blurred');
    expect(state.surface).toBe('hidden');
    expect(state.interaction).toBe('idle');
    expect(state.composition).toBe('inactive');
  });

  it('get() returns a frozen object', () => {
    const state = ss.get();
    expect(Object.isFrozen(state)).toBe(true);
  });

  it('mutating the returned object does NOT change internal state', () => {
    const state = ss.get() as Record<string, unknown>;
    // attempt mutation — should throw in strict mode or be silently ignored
    try {
      state['attachment'] = 'attached';
    } catch {
      /* frozen */
    }
    expect(ss.get().attachment).toBe('detached');
  });

  it('get() returns a copy — two calls return different object references', () => {
    const first = ss.get();
    const second = ss.get();
    expect(first).not.toBe(second);
  });

  it('set() with one key merges correctly, leaving other keys unchanged', () => {
    ss.set({ attachment: 'attached' });
    const state = ss.get();
    expect(state.attachment).toBe('attached');
    expect(state.focus).toBe('blurred');
    expect(state.surface).toBe('hidden');
    expect(state.interaction).toBe('idle');
    expect(state.composition).toBe('inactive');
  });

  it('set() with all keys sets all dimensions', () => {
    ss.set({
      attachment: 'attached',
      focus: 'focused',
      surface: 'visible',
      interaction: 'active',
      composition: 'composing',
    });
    const state = ss.get();
    expect(state.attachment).toBe('attached');
    expect(state.focus).toBe('focused');
    expect(state.surface).toBe('visible');
    expect(state.interaction).toBe('active');
    expect(state.composition).toBe('composing');
  });

  it('set() with empty object is a no-op', () => {
    ss.set({});
    const state = ss.get();
    expect(state).toMatchObject(INITIAL_SUBSTATES);
  });

  it('reset() after set() restores all initial values', () => {
    ss.set({ attachment: 'attached', focus: 'focused', surface: 'visible' });
    ss.reset();
    const state = ss.get();
    expect(state.attachment).toBe('detached');
    expect(state.focus).toBe('blurred');
    expect(state.surface).toBe('hidden');
    expect(state.interaction).toBe('idle');
    expect(state.composition).toBe('inactive');
  });

  it('set() then reset() then set() works correctly — reset is clean', () => {
    ss.set({ attachment: 'attached', focus: 'focused' });
    ss.reset();
    ss.set({ surface: 'visible' });
    const state = ss.get();
    expect(state.attachment).toBe('detached');
    expect(state.focus).toBe('blurred');
    expect(state.surface).toBe('visible');
    expect(state.interaction).toBe('idle');
    expect(state.composition).toBe('inactive');
  });

  it('get() returns a snapshot — mutating it does NOT affect subsequent get() calls', () => {
    const snapshot = ss.get() as Record<string, unknown>;
    try {
      snapshot['focus'] = 'focused';
    } catch {
      /* frozen */
    }
    expect(ss.get().focus).toBe('blurred');
  });
});
