import type { ResolvedLayout } from '../data/runtime.types.js';
import type { KeyId } from '../public/types.js';
import { detectDeadKey } from './dead-key-detector.js';
import { createCompositionStateMachine } from './state-machine.js';
import { mapLetter } from './letter-mapper.js';
import { cancelComposition } from './cancellation.js';

export interface CompositionProcessor {
  /** Process a key press. Returns null when a dead key is swallowed; returns resolved char otherwise. */
  process(keyId: KeyId, char: string): string | null;
  /** Cancel pending composition (Escape / blur / language switch). Safe to call when idle. */
  cancel(): void;
  /** True when a dead key has been pressed and is awaiting a base key. */
  get isArmed(): boolean;
  /** The trigger character currently pending, or null if not armed. */
  get armedTrigger(): string | null;
  /** The composition mode currently armed: 'tone', 'nasal', or null if idle. */
  get armedMode(): 'tone' | 'nasal' | null;
}

/**
 * Creates a composition processor bound to the given resolved layout's composition rules.
 * Recreate this when the layout or language changes to reset composition state.
 */
export function createCompositionProcessor(resolvedLayout: ResolvedLayout): CompositionProcessor {
  const sm = createCompositionStateMachine();
  const { compositionMap } = resolvedLayout;

  return {
    process(_keyId: KeyId, char: string): string | null {
      const deadKeyInfo = detectDeadKey(char, compositionMap);
      if (deadKeyInfo !== null) {
        sm.arm(deadKeyInfo.trigger, deadKeyInfo.mode === 'tone' ? 'tone-armed' : 'nasal-armed');
        return null;
      }

      const trigger = sm.getArmedTrigger();
      const mode = sm.getMode();
      if (trigger !== null && mode !== 'none') {
        const compositionMode = mode === 'tone-armed' ? 'tone' : 'nasal';
        const composed = mapLetter(trigger, char, compositionMode, compositionMap);
        sm.resolve();
        return composed ?? char;
      }

      return char;
    },

    cancel(): void {
      cancelComposition(sm);
    },

    get isArmed(): boolean {
      return sm.getMode() !== 'none';
    },

    get armedTrigger(): string | null {
      return sm.getArmedTrigger();
    },

    get armedMode(): 'tone' | 'nasal' | null {
      const mode = sm.getMode();
      if (mode === 'tone-armed') return 'tone';
      if (mode === 'nasal-armed') return 'nasal';
      return null;
    },
  };
}
