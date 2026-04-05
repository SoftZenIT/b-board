import type { CompositionStateMachine } from './state-machine.js';

/**
 * Cancels any pending composition and resets the state machine to idle.
 * Safe to call when already idle.
 */
export function cancelComposition(sm: CompositionStateMachine): void {
  sm.cancel();
}
