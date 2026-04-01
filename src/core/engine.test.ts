import { describe, it, expect, vi } from 'vitest';
import { createKeyboardEngine } from './engine.js';
import { InvariantViolationError } from './invariants.js';
import * as errorHandlerModule from './error-handler.js';
import { createResolvedLayout } from '../data/runtime.types.js';
import type { ResolvedLayout } from '../data/runtime.types.js';
import type { LifecycleEventMap } from './lifecycle.types.js';

// Minimal mock layout — content unused by engine itself
const mockLayout: ResolvedLayout = createResolvedLayout(
  { id: 'test-layout', variant: 'desktop', layers: [], theme: 'light' } as never,
  {
    languageId: 'test',
    name: 'Test',
    nativeName: 'Test',
    characters: [],
    compositionRules: [],
  } as never,
  new Map(),
  new Map()
);

function makeEngine(checkInvariants = true) {
  return createKeyboardEngine({ resolvedLayout: mockLayout, checkInvariants });
}

describe('createKeyboardEngine — happy path', () => {
  it('getState() returns "ready" after initialize()', async () => {
    const engine = makeEngine();
    await engine.initialize();
    expect(engine.getState()).toBe('ready');
  });

  it('events fire in order: state-change×2, initialized, ready', async () => {
    const engine = makeEngine();
    const order: string[] = [];

    engine.on('state-change', ({ from, to }) => {
      order.push(`state-change:${from}→${to}`);
    });
    engine.on('initialized', () => {
      order.push('initialized');
    });
    engine.on('ready', () => {
      order.push('ready');
    });

    await engine.initialize();

    expect(order).toEqual([
      'state-change:uninitialized→initializing',
      'state-change:initializing→ready',
      'initialized',
      'ready',
    ]);
  });

  it('"ready" event payload includes substates', async () => {
    const engine = makeEngine();
    let readyPayload: LifecycleEventMap['ready'] | undefined;

    engine.on('ready', (payload) => {
      readyPayload = payload;
    });
    await engine.initialize();

    expect(readyPayload).toBeDefined();
    expect(readyPayload!.substates).toBeDefined();
    expect(readyPayload!.substates.attachment).toBe('detached');
  });

  it('getSnapshot() returns correct state and previous after initialize()', async () => {
    const engine = makeEngine();
    await engine.initialize();
    const snap = engine.getSnapshot();
    expect(snap.state).toBe('ready');
    expect(snap.previous).toBe('initializing');
  });
});

describe('createKeyboardEngine — substate operations', () => {
  it('setSubstates() with valid updates does not throw', async () => {
    const engine = makeEngine();
    await engine.initialize();
    expect(() => engine.setSubstates({ surface: 'visible' })).not.toThrow();
  });

  it('setSubstates() with attachment=attached throws InvariantViolationError (hasTargetAdapter is false)', async () => {
    const engine = makeEngine();
    await engine.initialize();
    expect(() => engine.setSubstates({ attachment: 'attached' })).toThrow(InvariantViolationError);
  });
});

describe('createKeyboardEngine — destroy', () => {
  it('destroy() transitions to "destroyed" and emits state-change + destroyed', async () => {
    const engine = makeEngine();
    await engine.initialize();

    const events: string[] = [];
    engine.on('state-change', ({ from, to }) => {
      events.push(`state-change:${from}→${to}`);
    });
    engine.on('destroyed', () => {
      events.push('destroyed');
    });

    engine.destroy();

    expect(engine.getState()).toBe('destroyed');
    expect(events).toEqual(['state-change:ready→destroyed', 'destroyed']);
  });

  it('destroy() called twice is idempotent — no extra events on second call', async () => {
    const engine = makeEngine();
    await engine.initialize();

    const events: string[] = [];
    engine.on('destroyed', () => {
      events.push('destroyed');
    });

    engine.destroy();
    engine.destroy();

    expect(events).toHaveLength(1);
  });
});

describe('createKeyboardEngine — error path', () => {
  it('calling initialize() a second time triggers recoverable error path and emits "error" + "state-change"', async () => {
    const engine = makeEngine();
    await engine.initialize();

    let errorPayload: LifecycleEventMap['error'] | undefined;
    const stateChanges: Array<{ from: string; to: string }> = [];
    engine.on('error', (payload) => {
      errorPayload = payload;
    });
    engine.on('state-change', ({ from, to }) => {
      stateChanges.push({ from, to });
    });

    // Second initialize() attempts uninitialized→initializing which is an invalid transition
    // from 'ready' — StateTransitionError is thrown and handled as recoverable
    await engine.initialize();

    expect(engine.getState()).toBe('error');
    expect(errorPayload).toBeDefined();
    expect(errorPayload!.recoverable).toBe(true);
    expect(stateChanges).toContainEqual({ from: 'ready', to: 'error' });
  });

  it('handles fatal errors by transitioning to "destroyed" state', async () => {
    const ehSpy = vi.spyOn(errorHandlerModule, 'createErrorHandler').mockReturnValue({
      handle: (error: unknown) => ({
        severity: 'fatal' as const,
        message: String(error),
      }),
      isRecoverable: () => false,
    });

    // We need a new engine instance that uses the mocked error handler
    const engine = makeEngine();

    let destroyedFired = false;
    engine.on('destroyed', () => {
      destroyedFired = true;
    });

    // Force an error in initialize
    // We can do this by making the state machine transition fail or invariants fail
    // But since initialize() catches everything, we just need ANY error to be thrown inside try block

    // Let's mock sm.transition to throw
    // Actually, easier to just mock eh.handle to return fatal and then trigger ANY error.
    // Transitioning to 'initializing' twice will throw.

    await engine.initialize(); // first one succeeds
    await engine.initialize(); // second one fails, handled as fatal by mock

    expect(engine.getState()).toBe('destroyed');
    expect(destroyedFired).toBe(true);

    ehSpy.mockRestore();
  });
});

describe('createKeyboardEngine — on/unsubscribe', () => {
  it('on() returns a working unsubscribe — listener does not fire after unsubscribe', async () => {
    const engine = makeEngine();
    const listener = vi.fn();
    const unsub = engine.on('initialized', listener);

    unsub();
    await engine.initialize();

    expect(listener).not.toHaveBeenCalled();
  });
});
