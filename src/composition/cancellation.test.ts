import { describe, it, expect } from 'vitest';
import { cancelComposition } from './cancellation.js';
import { createCompositionStateMachine } from './state-machine.js';

describe('cancelComposition', () => {
  it('resets an armed state machine to none', () => {
    const sm = createCompositionStateMachine();
    sm.arm('´', 'tone-armed');
    cancelComposition(sm);
    expect(sm.getMode()).toBe('none');
    expect(sm.getArmedTrigger()).toBeNull();
  });

  it('is a no-op on an already-idle state machine', () => {
    const sm = createCompositionStateMachine();
    expect(() => cancelComposition(sm)).not.toThrow();
    expect(sm.getMode()).toBe('none');
  });

  it('resets nasal-armed state', () => {
    const sm = createCompositionStateMachine();
    sm.arm('~', 'nasal-armed');
    cancelComposition(sm);
    expect(sm.getMode()).toBe('none');
  });
});
