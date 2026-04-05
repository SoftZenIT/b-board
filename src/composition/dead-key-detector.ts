import type { CompositionRule } from '../data/language.types.js';
import type { CompositionRuleMode } from '../data/language.types.js';

export interface DeadKeyInfo {
  trigger: string;
  mode: CompositionRuleMode;
}

/**
 * Returns {@link DeadKeyInfo} if `char` is a dead-key trigger in `compositionMap`,
 * or `null` if it is a regular character.
 */
export function detectDeadKey(
  char: string,
  compositionMap: Map<string, CompositionRule[]>
): DeadKeyInfo | null {
  const rules = compositionMap.get(char);
  if (!rules || rules.length === 0) return null;
  return { trigger: char, mode: rules[0].mode };
}
