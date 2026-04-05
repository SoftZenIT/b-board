import type { CompositionRule } from '../data/language.types.js';
import type { CompositionRuleMode } from '../data/language.types.js';
import { resolveTone } from './tone-resolver.js';
import { resolveNasal } from './nasal-resolver.js';

/**
 * Resolves a composed character by delegating to the appropriate resolver
 * based on `mode`. Returns `null` if no rule matches.
 */
export function mapLetter(
  trigger: string,
  base: string,
  mode: CompositionRuleMode,
  compositionMap: Map<string, CompositionRule[]>
): string | null {
  if (mode === 'tone') return resolveTone(trigger, base, compositionMap);
  if (mode === 'nasal') return resolveNasal(trigger, base, compositionMap);
  return null;
}
