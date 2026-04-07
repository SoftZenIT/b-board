import { describe, it, expect } from 'vitest';
import fc from 'fast-check';
import { buildCompositionMap } from '../fixtures/index.js';
import { resolveTone } from '../../composition/tone-resolver.js';
import { resolveNasal } from '../../composition/nasal-resolver.js';
import type { CompositionRule } from '../../public/index.js';

describe('Data Integrity Fuzz Tests', () => {
  it('buildCompositionMap handles arbitrary rule arrays', () => {
    const ruleArb = fc.record({
      trigger: fc.string(),
      base: fc.string(),
      result: fc.string(),
      mode: fc.constantFrom('tone' as const, 'nasal' as const),
    });

    fc.assert(
      fc.property(fc.array(ruleArb, { maxLength: 100 }), (rules) => {
        const map = buildCompositionMap(rules);
        expect(map).toBeInstanceOf(Map);
        // Every rule's trigger should be a key in the map
        for (const rule of rules) {
          expect(map.has(rule.trigger)).toBe(true);
        }
      }),
      { numRuns: 200 }
    );
  });

  it('resolveTone never crashes with random rules and random input', () => {
    const ruleArb: fc.Arbitrary<CompositionRule> = fc.record({
      trigger: fc.string(),
      base: fc.string(),
      result: fc.string(),
      mode: fc.constant('tone' as const),
    });

    fc.assert(
      fc.property(
        fc.array(ruleArb, { maxLength: 50 }),
        fc.string(),
        fc.string(),
        (rules, trigger, base) => {
          const map = buildCompositionMap(rules);
          const result = resolveTone(trigger, base, map);
          expect(result === null || typeof result === 'string').toBe(true);
        }
      ),
      { numRuns: 300 }
    );
  });

  it('resolveNasal never crashes with random rules and random input', () => {
    const ruleArb: fc.Arbitrary<CompositionRule> = fc.record({
      trigger: fc.string(),
      base: fc.string(),
      result: fc.string(),
      mode: fc.constant('nasal' as const),
    });

    fc.assert(
      fc.property(
        fc.array(ruleArb, { maxLength: 50 }),
        fc.string(),
        fc.string(),
        (rules, trigger, base) => {
          const map = buildCompositionMap(rules);
          const result = resolveNasal(trigger, base, map);
          expect(result === null || typeof result === 'string').toBe(true);
        }
      ),
      { numRuns: 300 }
    );
  });

  it('composition map groups rules correctly for any input', () => {
    const ruleArb: fc.Arbitrary<CompositionRule> = fc.record({
      trigger: fc.string({ minLength: 1, maxLength: 3 }),
      base: fc.string({ minLength: 1, maxLength: 3 }),
      result: fc.string({ minLength: 1, maxLength: 3 }),
      mode: fc.constantFrom('tone' as const, 'nasal' as const),
    });

    fc.assert(
      fc.property(fc.array(ruleArb, { maxLength: 200 }), (rules) => {
        const map = buildCompositionMap(rules);
        // Total rules in map should equal input rules count
        let total = 0;
        for (const entries of map.values()) {
          total += entries.length;
        }
        expect(total).toBe(rules.length);
      }),
      { numRuns: 100 }
    );
  });
});
