import type { KeyboardState } from './state.types.js';
import type { ReadySubstates } from './substate.types.js';
import type { KeyboardError } from './error-handler.js';

export interface LifecycleEventMap {
  initialized: { state: KeyboardState; timestamp: number };
  ready: { state: KeyboardState; substates: ReadySubstates; timestamp: number };
  error: { error: KeyboardError; recoverable: boolean; timestamp: number };
  destroyed: { timestamp: number };
  'state-change': { from: KeyboardState; to: KeyboardState; timestamp: number };
}

export type LifecycleEventName = keyof LifecycleEventMap;

export type Unsubscribe = () => void;

export interface Lifecycle {
  on<K extends LifecycleEventName>(
    event: K,
    listener: (payload: LifecycleEventMap[K]) => void | Promise<void>
  ): Unsubscribe;
  emit<K extends LifecycleEventName>(event: K, payload: LifecycleEventMap[K]): void;
}
