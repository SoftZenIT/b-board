import type { ResolvedLayout } from '../data/runtime.types.js'
import type { KeyboardState, StateSnapshot, StateMachine } from './state.types.js'
import type { ReadySubstates, Substates } from './substate.types.js'
import type { ErrorSeverity, ErrorHandler, KeyboardError } from './error-handler.js'
import type { LifecycleEventName, LifecycleEventMap, Unsubscribe, Lifecycle } from './lifecycle.types.js'
import type { InvariantsChecker } from './invariants.js'
import { createStateMachine } from './state-machine.js'
import { createSubstates } from './substates.js'
import { createErrorHandler } from './error-handler.js'
import { createLifecycle } from './lifecycle.js'
import { createInvariantsChecker } from './invariants.js'

export interface KeyboardEngineOptions {
  resolvedLayout: ResolvedLayout
  checkInvariants?: boolean  // defaults to true
}

export interface KeyboardEngine {
  initialize(): Promise<void>
  destroy(): void
  getState(): KeyboardState
  getSnapshot(): StateSnapshot
  setSubstates(updates: Partial<ReadySubstates>): void
  on<K extends LifecycleEventName>(
    event: K,
    listener: (payload: LifecycleEventMap[K]) => void | Promise<void>
  ): Unsubscribe
}

/**
 * Creates the keyboard engine facade — wires state machine, substates, lifecycle, error handler, and invariants.
 * @example
 * const engine = createKeyboardEngine({ resolvedLayout })
 * engine.on('ready', ({ substates }) => console.log('ready!', substates))
 * await engine.initialize()
 */
export function createKeyboardEngine(options: KeyboardEngineOptions): KeyboardEngine {
  const sm: StateMachine = createStateMachine()
  const ss: Substates = createSubstates()
  const lc: Lifecycle = createLifecycle()
  const eh: ErrorHandler = createErrorHandler()
  const checker: InvariantsChecker = createInvariantsChecker({ enabled: options.checkInvariants ?? true })

  function buildInvariantContext() {
    return {
      state: sm.getState(),
      substates: ss.get(),
      hasResolvedLayout: true,  // resolvedLayout is a required option — always present
      hasTargetAdapter: false,  // adapters are wired by the adapters module (Epic 8)
    }
  }

  function handleError(error: unknown, severity: ErrorSeverity): void {
    const ke: KeyboardError = eh.handle(error, severity)
    const fromState = sm.getState()  // capture BEFORE transition
    if (eh.isRecoverable(ke)) {
      sm.transition('error')
      ss.reset()
      lc.emit('state-change', { from: fromState, to: 'error', timestamp: Date.now() })
      lc.emit('error', { error: ke, recoverable: true, timestamp: Date.now() })
    } else {
      sm.transition('destroyed')
      ss.reset()
      lc.emit('state-change', { from: fromState, to: 'destroyed', timestamp: Date.now() })
      lc.emit('error', { error: ke, recoverable: false, timestamp: Date.now() })
      lc.emit('destroyed', { timestamp: Date.now() })
    }
  }

  return {
    async initialize(): Promise<void> {
      try {
        sm.transition('initializing')
        lc.emit('state-change', { from: 'uninitialized', to: 'initializing', timestamp: Date.now() })

        sm.transition('ready')
        checker.check(buildInvariantContext())
        const now = Date.now()
        lc.emit('state-change', { from: 'initializing', to: 'ready', timestamp: now })
        lc.emit('initialized', { state: sm.getState(), timestamp: now })
        lc.emit('ready', { state: sm.getState(), substates: ss.get(), timestamp: now })
      } catch (error) {
        handleError(error, 'recoverable')
      }
    },

    destroy(): void {
      if (sm.getState() === 'destroyed') return
      const fromState = sm.getState()  // capture BEFORE transition
      sm.transition('destroyed')
      ss.reset()
      lc.emit('state-change', { from: fromState, to: 'destroyed', timestamp: Date.now() })
      lc.emit('destroyed', { timestamp: Date.now() })
    },

    getState(): KeyboardState {
      return sm.getState()
    },

    getSnapshot(): StateSnapshot {
      return sm.getSnapshot()
    },

    setSubstates(updates: Partial<ReadySubstates>): void {
      ss.set(updates)
      checker.check(buildInvariantContext())
    },

    on<K extends LifecycleEventName>(
      event: K,
      listener: (payload: LifecycleEventMap[K]) => void | Promise<void>
    ): Unsubscribe {
      return lc.on(event, listener)
    },
  }
}
