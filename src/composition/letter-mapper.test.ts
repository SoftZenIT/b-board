import { describe, it, expect } from 'vitest';
import { mapLetter } from './letter-mapper.js';
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

const mixedRules: CompositionRule[] = [
  { trigger: '´', base: 'a', result: 'á', mode: 'tone' },
  { trigger: '~', base: 'a', result: 'ã', mode: 'nasal' },
];

describe('mapLetter', () => {
  it('delegates to tone resolver for tone mode', () => {
    const map = makeMap(mixedRules);
    expect(mapLetter('´', 'a', 'tone', map)).toBe('á');
  });

  it('delegates to nasal resolver for nasal mode', () => {
    const map = makeMap(mixedRules);
    expect(mapLetter('~', 'a', 'nasal', map)).toBe('ã');
  });

  it('returns null when no rule matches for tone', () => {
    const map = makeMap(mixedRules);
    expect(mapLetter('´', 'z', 'tone', map)).toBeNull();
  });

  it('returns null when no rule matches for nasal', () => {
    const map = makeMap(mixedRules);
    expect(mapLetter('~', 'z', 'nasal', map)).toBeNull();
  });
});
