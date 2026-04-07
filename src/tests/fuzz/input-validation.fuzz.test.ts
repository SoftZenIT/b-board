import { describe, it, expect } from 'vitest';
import fc from 'fast-check';
import { createCompositionStateMachine } from '../../composition/state-machine.js';

describe('Input Validation Fuzz Tests', () => {
  it('state machine handles arbitrary trigger strings without crash', () => {
    fc.assert(
      fc.property(fc.string(), (trigger) => {
        const sm = createCompositionStateMachine();
        sm.arm(trigger, 'tone-armed');
        expect(sm.getArmedTrigger()).toBe(trigger);
        sm.resolve();
        expect(sm.getMode()).toBe('none');
      }),
      { numRuns: 500 }
    );
  });

  it('state machine handles arbitrary transition sequences', () => {
    const modes = ['tone-armed', 'nasal-armed'] as const;
    const actions = ['resolve', 'cancel', 'arm'] as const;

    fc.assert(
      fc.property(
        fc.array(
          fc.record({
            action: fc.constantFrom(...actions),
            mode: fc.constantFrom(...modes),
            trigger: fc.string(),
          }),
          { minLength: 1, maxLength: 30 }
        ),
        (sequence) => {
          const sm = createCompositionStateMachine();
          for (const step of sequence) {
            if (step.action === 'arm') {
              sm.arm(step.trigger, step.mode);
            } else {
              sm[step.action]();
            }
            // Invariant: mode is always one of the valid states
            expect(['none', 'tone-armed', 'nasal-armed']).toContain(sm.getMode());
          }
        }
      ),
      { numRuns: 200 }
    );
  });

  it('state machine is always in consistent state after any sequence', () => {
    fc.assert(
      fc.property(fc.array(fc.boolean(), { minLength: 1, maxLength: 50 }), (decisions) => {
        const sm = createCompositionStateMachine();
        for (const doArm of decisions) {
          if (doArm) {
            sm.arm('x', 'tone-armed');
          } else {
            sm.cancel();
          }
        }
        const mode = sm.getMode();
        const trigger = sm.getArmedTrigger();
        // Consistency invariant: if mode is 'none', trigger must be null
        if (mode === 'none') {
          expect(trigger).toBeNull();
        } else {
          expect(trigger).not.toBeNull();
        }
      }),
      { numRuns: 300 }
    );
  });
});
