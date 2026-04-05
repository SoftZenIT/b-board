import { describe, it, expect } from 'vitest';
import { createCompositionStateMachine } from './state-machine.js';

describe('createCompositionStateMachine', () => {
  it('starts in none state with no armed trigger', () => {
    const sm = createCompositionStateMachine();
    expect(sm.getMode()).toBe('none');
    expect(sm.getArmedTrigger()).toBeNull();
  });

  it('arms with tone mode', () => {
    const sm = createCompositionStateMachine();
    sm.arm('´', 'tone-armed');
    expect(sm.getMode()).toBe('tone-armed');
    expect(sm.getArmedTrigger()).toBe('´');
  });

  it('arms with nasal mode', () => {
    const sm = createCompositionStateMachine();
    sm.arm('~', 'nasal-armed');
    expect(sm.getMode()).toBe('nasal-armed');
    expect(sm.getArmedTrigger()).toBe('~');
  });

  it('resolves back to none', () => {
    const sm = createCompositionStateMachine();
    sm.arm('´', 'tone-armed');
    sm.resolve();
    expect(sm.getMode()).toBe('none');
    expect(sm.getArmedTrigger()).toBeNull();
  });

  it('cancels back to none', () => {
    const sm = createCompositionStateMachine();
    sm.arm('`', 'tone-armed');
    sm.cancel();
    expect(sm.getMode()).toBe('none');
    expect(sm.getArmedTrigger()).toBeNull();
  });

  it('re-arms with a new trigger when already armed', () => {
    const sm = createCompositionStateMachine();
    sm.arm('´', 'tone-armed');
    sm.arm('`', 'tone-armed');
    expect(sm.getArmedTrigger()).toBe('`');
  });

  it('cancel from none is a no-op', () => {
    const sm = createCompositionStateMachine();
    expect(() => sm.cancel()).not.toThrow();
    expect(sm.getMode()).toBe('none');
  });
});
