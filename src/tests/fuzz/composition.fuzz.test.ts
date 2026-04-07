import { describe, it, expect } from 'vitest';
import fc from 'fast-check';
import { createCompositionProcessor } from '../../composition/index.js';
import { createCompositionStateMachine } from '../../composition/state-machine.js';
import { resolveTone } from '../../composition/tone-resolver.js';
import { resolveNasal } from '../../composition/nasal-resolver.js';
import {
  desktopResolvedLayout,
  buildCompositionMap,
  allCompositionRules,
} from '../fixtures/index.js';
import { createKeyId } from '../../public/index.js';

const compositionMap = buildCompositionMap(allCompositionRules());

describe('Composition Fuzz Tests', () => {
  it('process() never throws for arbitrary Unicode strings', () => {
    const layout = desktopResolvedLayout();
    fc.assert(
      fc.property(fc.string(), (char) => {
        const processor = createCompositionProcessor(layout);
        // Should never throw — either return null (dead key) or a string
        const result = processor.process(createKeyId('key-a'), char);
        expect(result === null || typeof result === 'string').toBe(true);
      }),
      { numRuns: 500 }
    );
  });

  it('state machine always reaches none after resolve or cancel', () => {
    const modes = ['tone-armed', 'nasal-armed'] as const;
    const actions = ['resolve', 'cancel'] as const;

    fc.assert(
      fc.property(
        fc.constantFrom(...modes),
        fc.string(),
        fc.constantFrom(...actions),
        (mode, trigger, action) => {
          const sm = createCompositionStateMachine();
          sm.arm(trigger, mode);
          expect(sm.getMode()).not.toBe('none');
          sm[action]();
          expect(sm.getMode()).toBe('none');
          expect(sm.getArmedTrigger()).toBeNull();
        }
      ),
      { numRuns: 200 }
    );
  });

  it('resolveTone returns string or null for any input pair', () => {
    fc.assert(
      fc.property(fc.string(), fc.string(), (trigger, base) => {
        const result = resolveTone(trigger, base, compositionMap);
        expect(result === null || typeof result === 'string').toBe(true);
      }),
      { numRuns: 500 }
    );
  });

  it('resolveNasal returns string or null for any input pair', () => {
    fc.assert(
      fc.property(fc.string(), fc.string(), (trigger, base) => {
        const result = resolveNasal(trigger, base, compositionMap);
        expect(result === null || typeof result === 'string').toBe(true);
      }),
      { numRuns: 500 }
    );
  });

  it('process() handles rapid dead key re-arming without crash', () => {
    const layout = desktopResolvedLayout();

    fc.assert(
      fc.property(fc.array(fc.string(), { minLength: 1, maxLength: 50 }), (chars) => {
        const processor = createCompositionProcessor(layout);
        for (const char of chars) {
          const result = processor.process(createKeyId('key-a'), char);
          expect(result === null || typeof result === 'string').toBe(true);
        }
      }),
      { numRuns: 100 }
    );
  });
});
