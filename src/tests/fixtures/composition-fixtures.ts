import { createCompositionRule, type CompositionRule } from '../../public/index.js';

/** Builds a Map<trigger, CompositionRule[]> from a flat array — the format used by resolvers. */
export function buildCompositionMap(rules: CompositionRule[]): Map<string, CompositionRule[]> {
  const m = new Map<string, CompositionRule[]>();
  for (const r of rules) {
    const existing = m.get(r.trigger) ?? [];
    existing.push(r);
    m.set(r.trigger, existing);
  }
  return m;
}

/** Yoruba tone cycle: acute accent over vowels. */
export function acuteToneRules(): CompositionRule[] {
  return [
    createCompositionRule('´', 'a', 'á', 'tone'),
    createCompositionRule('´', 'e', 'é', 'tone'),
    createCompositionRule('´', 'o', 'ó', 'tone'),
    createCompositionRule('´', 'i', 'í', 'tone'),
    createCompositionRule('´', 'u', 'ú', 'tone'),
  ];
}

/** Yoruba tone cycle: grave accent over vowels. */
export function graveToneRules(): CompositionRule[] {
  return [
    createCompositionRule('`', 'a', 'à', 'tone'),
    createCompositionRule('`', 'e', 'è', 'tone'),
    createCompositionRule('`', 'o', 'ò', 'tone'),
  ];
}

/** Fon nasal composition rules. */
export function nasalRules(): CompositionRule[] {
  return [
    createCompositionRule('~', 'a', 'ã', 'nasal'),
    createCompositionRule('~', 'e', 'ẽ', 'nasal'),
    createCompositionRule('~', 'o', 'õ', 'nasal'),
  ];
}

/** All composition rules combined (Yoruba + Fon). */
export function allCompositionRules(): CompositionRule[] {
  return [...acuteToneRules(), ...graveToneRules(), ...nasalRules()];
}

/** A composition map with no rules — for edge case testing. */
export function emptyCompositionMap(): Map<string, CompositionRule[]> {
  return new Map();
}

/** An invalid rule that references a non-existent trigger. */
export function invalidCompositionRule(): CompositionRule {
  return createCompositionRule('∅', 'x', 'x', 'tone');
}
