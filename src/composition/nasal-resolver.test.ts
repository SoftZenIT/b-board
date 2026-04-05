import { describe, it, expect } from 'vitest';
import { resolveNasal } from './nasal-resolver.js';
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
  { trigger: '~', base: 'a', result: 'ã', mode: 'nasal' },
  { trigger: '~', base: 'e', result: 'ẽ', mode: 'nasal' },
  { trigger: '~', base: 'ɛ', result: 'ɛ̃', mode: 'nasal' },
  { trigger: '~', base: 'u', result: 'ũ', mode: 'nasal' },
];

describe('resolveNasal', () => {
  it('resolves tilde + a to ã', () => {
    expect(resolveNasal('~', 'a', makeMap(rules))).toBe('ã');
  });

  it('resolves tilde + ɛ to ɛ̃', () => {
    expect(resolveNasal('~', 'ɛ', makeMap(rules))).toBe('ɛ̃');
  });

  it('returns null for unknown base', () => {
    expect(resolveNasal('~', 'z', makeMap(rules))).toBeNull();
  });

  it('returns null for unknown trigger', () => {
    expect(resolveNasal('´', 'a', makeMap(rules))).toBeNull();
  });
});
