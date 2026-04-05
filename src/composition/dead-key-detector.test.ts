import { describe, it, expect } from 'vitest';
import { detectDeadKey } from './dead-key-detector.js';
import type { CompositionRule } from '../data/language.types.js';

function makeMap(rules: CompositionRule[]): Map<string, CompositionRule[]> {
  const m = new Map<string, CompositionRule[]>();
  for (const r of rules) {
    const existing = m.get(r.trigger) ?? [];
    existing.push(r);
    m.set(r.trigger, existing);
  }
  return m;
}

const toneRules: CompositionRule[] = [
  { trigger: '´', base: 'a', result: 'á', mode: 'tone' },
  { trigger: '´', base: 'e', result: 'é', mode: 'tone' },
  { trigger: '`', base: 'a', result: 'à', mode: 'tone' },
];
const nasalRules: CompositionRule[] = [{ trigger: '~', base: 'a', result: 'ã', mode: 'nasal' }];

describe('detectDeadKey', () => {
  it('returns tone info when char is a tone trigger', () => {
    const map = makeMap(toneRules);
    expect(detectDeadKey('´', map)).toEqual({ trigger: '´', mode: 'tone' });
  });

  it('returns nasal info when char is a nasal trigger', () => {
    const map = makeMap(nasalRules);
    expect(detectDeadKey('~', map)).toEqual({ trigger: '~', mode: 'nasal' });
  });

  it('returns null for a regular character', () => {
    const map = makeMap(toneRules);
    expect(detectDeadKey('a', map)).toBeNull();
  });

  it('returns null for an empty compositionMap', () => {
    expect(detectDeadKey('´', new Map())).toBeNull();
  });

  it('handles multiple tone triggers independently', () => {
    const map = makeMap(toneRules);
    expect(detectDeadKey('`', map)).toEqual({ trigger: '`', mode: 'tone' });
  });
});
