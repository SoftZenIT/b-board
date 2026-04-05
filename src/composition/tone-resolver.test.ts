import { describe, it, expect } from 'vitest';
import { resolveTone } from './tone-resolver.js';
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

const rules: CompositionRule[] = [
  { trigger: '´', base: 'a', result: 'á', mode: 'tone' },
  { trigger: '´', base: 'e', result: 'é', mode: 'tone' },
  { trigger: '´', base: 'ẹ', result: 'ẹ́', mode: 'tone' },
  { trigger: '`', base: 'a', result: 'à', mode: 'tone' },
  { trigger: '`', base: 'e', result: 'è', mode: 'tone' },
];

describe('resolveTone', () => {
  it('resolves acute + a to á', () => {
    expect(resolveTone('´', 'a', makeMap(rules))).toBe('á');
  });

  it('resolves grave + a to à', () => {
    expect(resolveTone('`', 'a', makeMap(rules))).toBe('à');
  });

  it('resolves combining diacritic base (ẹ → ẹ́)', () => {
    expect(resolveTone('´', 'ẹ', makeMap(rules))).toBe('ẹ́');
  });

  it('returns null for unknown base', () => {
    expect(resolveTone('´', 'z', makeMap(rules))).toBeNull();
  });

  it('returns null for unknown trigger', () => {
    expect(resolveTone('~', 'a', makeMap(rules))).toBeNull();
  });
});
