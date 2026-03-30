import { describe, it, expect } from 'vitest'
import { createStateMachine, StateTransitionError } from './state-machine.js'

describe('createStateMachine', () => {
  describe('initial state', () => {
    it('starts in uninitialized', () => {
      const sm = createStateMachine()
      expect(sm.getState()).toBe('uninitialized')
    })

    it('getSnapshot() has state=uninitialized, previous=null, numeric timestamp', () => {
      const sm = createStateMachine()
      const snap = sm.getSnapshot()
      expect(snap.state).toBe('uninitialized')
      expect(snap.previous).toBeNull()
      expect(typeof snap.timestamp).toBe('number')
    })

    it('getSnapshot() returns a frozen object', () => {
      const sm = createStateMachine()
      expect(Object.isFrozen(sm.getSnapshot())).toBe(true)
    })
  })

  describe('valid transitions', () => {
    it('uninitialized → initializing', () => {
      const sm = createStateMachine()
      sm.transition('initializing')
      expect(sm.getState()).toBe('initializing')
    })

    it('initializing → ready', () => {
      const sm = createStateMachine()
      sm.transition('initializing')
      sm.transition('ready')
      expect(sm.getState()).toBe('ready')
    })

    it('initializing → error', () => {
      const sm = createStateMachine()
      sm.transition('initializing')
      sm.transition('error')
      expect(sm.getState()).toBe('error')
    })

    it('initializing → destroyed', () => {
      const sm = createStateMachine()
      sm.transition('initializing')
      sm.transition('destroyed')
      expect(sm.getState()).toBe('destroyed')
    })

    it('ready → error', () => {
      const sm = createStateMachine()
      sm.transition('initializing')
      sm.transition('ready')
      sm.transition('error')
      expect(sm.getState()).toBe('error')
    })

    it('ready → destroyed', () => {
      const sm = createStateMachine()
      sm.transition('initializing')
      sm.transition('ready')
      sm.transition('destroyed')
      expect(sm.getState()).toBe('destroyed')
    })

    it('error → ready (recoverable retry)', () => {
      const sm = createStateMachine()
      sm.transition('initializing')
      sm.transition('error')
      sm.transition('ready')
      expect(sm.getState()).toBe('ready')
    })

    it('error → destroyed (fatal)', () => {
      const sm = createStateMachine()
      sm.transition('initializing')
      sm.transition('error')
      sm.transition('destroyed')
      expect(sm.getState()).toBe('destroyed')
    })

    it('uninitialized → destroyed', () => {
      const sm = createStateMachine()
      sm.transition('destroyed')
      expect(sm.getState()).toBe('destroyed')
    })
  })

  describe('invalid transitions throw StateTransitionError', () => {
    it('uninitialized → ready throws', () => {
      const sm = createStateMachine()
      expect(() => sm.transition('ready')).toThrow(StateTransitionError)
    })

    it('ready → initializing throws', () => {
      const sm = createStateMachine()
      sm.transition('initializing')
      sm.transition('ready')
      expect(() => sm.transition('initializing')).toThrow(StateTransitionError)
    })

    it('destroyed → any throws (terminal state)', () => {
      const sm = createStateMachine()
      sm.transition('initializing')
      sm.transition('ready')
      sm.transition('destroyed')
      expect(() => sm.transition('error')).toThrow(StateTransitionError)
      expect(() => sm.transition('ready')).toThrow(StateTransitionError)
    })

    it('StateTransitionError carries from, to, and reason', () => {
      const sm = createStateMachine()
      let err: StateTransitionError | undefined
      try { sm.transition('ready') } catch (e) { err = e as StateTransitionError }
      expect(err).toBeInstanceOf(StateTransitionError)
      expect(err?.from).toBe('uninitialized')
      expect(err?.to).toBe('ready')
      expect(err?.reason.length).toBeGreaterThan(0)
    })
  })

  describe('snapshot tracking', () => {
    it('previous tracks the state before the last transition', () => {
      const sm = createStateMachine()
      sm.transition('initializing')
      expect(sm.getSnapshot().previous).toBe('uninitialized')
      sm.transition('ready')
      expect(sm.getSnapshot().previous).toBe('initializing')
    })

    it('timestamp advances after each transition', () => {
      const sm = createStateMachine()
      const t1 = sm.getSnapshot().timestamp
      sm.transition('initializing')
      const t2 = sm.getSnapshot().timestamp
      expect(t2).toBeGreaterThanOrEqual(t1)
    })
  })
})
