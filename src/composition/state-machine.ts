import type { CompositionMode } from '../public/types.js';

export interface CompositionStateMachine {
  getMode(): CompositionMode;
  getArmedTrigger(): string | null;
  arm(trigger: string, mode: Exclude<CompositionMode, 'none'>): void;
  resolve(): void;
  cancel(): void;
}

/**
 * Creates a lightweight composition state machine.
 * States: none → tone-armed | nasal-armed → none (via resolve or cancel).
 * Re-arming from an already-armed state replaces the current trigger.
 */
export function createCompositionStateMachine(): CompositionStateMachine {
  let mode: CompositionMode = 'none';
  let armedTrigger: string | null = null;

  return {
    getMode: () => mode,
    getArmedTrigger: () => armedTrigger,
    arm(trigger, newMode) {
      mode = newMode;
      armedTrigger = trigger;
    },
    resolve() {
      mode = 'none';
      armedTrigger = null;
    },
    cancel() {
      mode = 'none';
      armedTrigger = null;
    },
  };
}
