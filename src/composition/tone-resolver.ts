import type { CompositionRule } from '../data/language.types.js';

/**
 * Looks up the composed character for a tone dead-key sequence.
 * Returns the result string or `null` if no matching rule exists.
 */
export function resolveTone(
  trigger: string,
  base: string,
  compositionMap: Map<string, CompositionRule[]>
): string | null {
  const rules = compositionMap.get(trigger);
  if (!rules) return null;
  return rules.find((r) => r.base === base && r.mode === 'tone')?.result ?? null;
}
