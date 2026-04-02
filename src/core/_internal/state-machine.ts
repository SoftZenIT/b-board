import type { KeyboardState, StateSnapshot, StateMachine } from '../state.types.js';

/** Thrown when a requested state transition is not in the valid transition table. */
export class StateTransitionError extends Error {
  constructor(
    readonly from: KeyboardState,
    readonly to: KeyboardState,
    readonly reason: string
  ) {
    super(`[StateTransitionError] Invalid transition: '${from}' → '${to}'. ${reason}`);
    this.name = 'StateTransitionError';
  }
}

const VALID_TRANSITIONS: Record<KeyboardState, readonly KeyboardState[]> = {
  uninitialized: ['initializing', 'destroyed'],
  initializing: ['ready', 'error', 'destroyed'],
  ready: ['error', 'destroyed'],
  error: ['ready', 'destroyed'],
  destroyed: [],
};

/**
 * Creates a state machine managing the keyboard engine's top-level lifecycle.
 * @example
 * const sm = createStateMachine()
 * sm.transition('initializing')
 * sm.transition('ready')
 * sm.getSnapshot() // { state: 'ready', previous: 'initializing', timestamp: ... }
 */
export function createStateMachine(): StateMachine {
  let state: KeyboardState = 'uninitialized';
  let previous: KeyboardState | null = null;
  let timestamp: number = Date.now();

  return {
    getState() {
      return state;
    },

    getSnapshot(): Readonly<StateSnapshot> {
      return Object.freeze({ state, previous, timestamp });
    },

    transition(to: KeyboardState) {
      const allowed = VALID_TRANSITIONS[state];
      if (!(allowed as readonly unknown[]).includes(to)) {
        throw new StateTransitionError(
          state,
          to,
          `Allowed from '${state}': [${allowed.join(', ') || 'none'}]`
        );
      }
      previous = state;
      state = to;
      timestamp = Date.now();
    },
  };
}
