import { describe, it, expect } from 'vitest';
import { createCompositionProcessor } from './index.js';
import type { ResolvedLayout } from '../data/runtime.types.js';
import type { CompositionRule } from '../data/language.types.js';

function makeLayout(rules: CompositionRule[]): ResolvedLayout {
  const compositionMap = new Map<string, CompositionRule[]>();
  for (const r of rules) {
    const existing = compositionMap.get(r.trigger) ?? [];
    existing.push(r);
    compositionMap.set(r.trigger, existing);
  }
  return {
    layout: { id: 'desktop-azerty', variant: 'desktop', layers: [], theme: 'light' },
    language: {
      languageId: 'yoruba',
      name: 'Yoruba',
      nativeName: 'Yorùbá',
      characters: [],
      compositionRules: rules,
    },
    keyMap: new Map(),
    compositionMap,
  };
}

const yorubaRules: CompositionRule[] = [
  { trigger: '´', base: 'a', result: 'á', mode: 'tone' },
  { trigger: '´', base: 'e', result: 'é', mode: 'tone' },
  { trigger: '`', base: 'a', result: 'à', mode: 'tone' },
  { trigger: '~', base: 'a', result: 'ã', mode: 'nasal' },
];

describe('createCompositionProcessor', () => {
  it('passes through regular characters when idle', () => {
    const p = createCompositionProcessor(makeLayout(yorubaRules));
    expect(p.process('key-a' as any, 'a')).toBe('a');
  });

  it('swallows a dead key (returns null) and arms the processor', () => {
    const p = createCompositionProcessor(makeLayout(yorubaRules));
    expect(p.process('key-tone' as any, '´')).toBeNull();
    expect(p.isArmed).toBe(true);
    expect(p.armedTrigger).toBe('´');
  });

  it('resolves tone composition: dead key then base key', () => {
    const p = createCompositionProcessor(makeLayout(yorubaRules));
    p.process('key-tone' as any, '´'); // arm
    expect(p.process('key-a' as any, 'a')).toBe('á');
    expect(p.isArmed).toBe(false);
  });

  it('resolves nasal composition: tilde then base key', () => {
    const p = createCompositionProcessor(makeLayout(yorubaRules));
    p.process('key-nasal' as any, '~'); // arm
    expect(p.process('key-a' as any, 'a')).toBe('ã');
  });

  it('passes through original char when armed but base has no match', () => {
    const p = createCompositionProcessor(makeLayout(yorubaRules));
    p.process('key-tone' as any, '´'); // arm
    expect(p.process('key-z' as any, 'z')).toBe('z'); // no rule for z
    expect(p.isArmed).toBe(false); // state reset after pass-through
  });

  it('re-arms when a second dead key is pressed while already armed', () => {
    const p = createCompositionProcessor(makeLayout(yorubaRules));
    p.process('key-tone' as any, '´'); // arm with acute
    p.process('key-tone2' as any, '`'); // re-arm with grave
    expect(p.armedTrigger).toBe('`');
    expect(p.process('key-a' as any, 'a')).toBe('à');
  });

  it('cancel resets armed state', () => {
    const p = createCompositionProcessor(makeLayout(yorubaRules));
    p.process('key-tone' as any, '´');
    p.cancel();
    expect(p.isArmed).toBe(false);
    expect(p.armedTrigger).toBeNull();
  });

  it('next key after cancel is a plain pass-through', () => {
    const p = createCompositionProcessor(makeLayout(yorubaRules));
    p.process('key-tone' as any, '´');
    p.cancel();
    expect(p.process('key-a' as any, 'a')).toBe('a');
  });

  it('is not armed by default', () => {
    const p = createCompositionProcessor(makeLayout(yorubaRules));
    expect(p.isArmed).toBe(false);
    expect(p.armedTrigger).toBeNull();
  });
});
