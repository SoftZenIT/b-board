export const KEYBOARD_STATES = [
  'uninitialized',
  'initializing',
  'ready',
  'error',
  'destroyed',
] as const

/** The top-level lifecycle state of the keyboard engine. */
export type KeyboardState = (typeof KEYBOARD_STATES)[number]

/** A point-in-time snapshot of the state machine. */
export interface StateSnapshot {
  /** Current state. */
  state: KeyboardState
  /** State before the last transition, or null if no transition has occurred. */
  previous: KeyboardState | null
  /** Unix timestamp (ms) of the last transition. */
  timestamp: number
}

/** The state machine interface returned by {@link createStateMachine}. */
export interface StateMachine {
  /** Returns the current state. */
  getState(): KeyboardState
  /** Returns a frozen snapshot of current state, previous state, and timestamp. */
  getSnapshot(): Readonly<StateSnapshot>
  /**
   * Transitions to `to`. Throws {@link StateTransitionError} if the transition
   * is not in the valid transition table.
   * @throws {StateTransitionError}
   */
  transition(to: KeyboardState): void
}
