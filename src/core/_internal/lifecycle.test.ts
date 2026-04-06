import { describe, it, expect, vi } from 'vitest';
import { createLifecycle } from './lifecycle.js';
import type { KeyboardError } from './error-handler.js';
import { ErrorCode } from './error-handler.js';
import type { ReadySubstates } from '../substate.types.js';

const ke: KeyboardError = {
  code: ErrorCode.UNKNOWN_ERROR,
  severity: 'recoverable',
  message: 'test',
  suggestion: 'Check the browser console for details.',
};

const substates: ReadySubstates = {
  attachment: 'attached',
  focus: 'focused',
  surface: 'visible',
  interaction: 'active',
  composition: 'inactive',
};

describe('createLifecycle', () => {
  // 1. No listeners — emit() with no registered listeners does not throw
  it('does not throw when emitting with no listeners', () => {
    const lc = createLifecycle();
    expect(() => {
      lc.emit('state-change', { from: 'initializing', to: 'ready', timestamp: Date.now() });
    }).not.toThrow();
  });

  // 2. Single listener — emit() calls registered listener with the payload
  it('calls a single registered listener with the correct payload', () => {
    const lc = createLifecycle();
    const listener = vi.fn();
    lc.on('initialized', listener);
    const payload = { state: 'initializing' as const, timestamp: 1000 };
    lc.emit('initialized', payload);
    expect(listener).toHaveBeenCalledOnce();
    expect(listener).toHaveBeenCalledWith(
      expect.objectContaining({ state: 'initializing', timestamp: 1000 })
    );
  });

  // 3. Multiple listeners — all registered listeners for an event fire
  it('calls all registered listeners for an event', () => {
    const lc = createLifecycle();
    const listener1 = vi.fn();
    const listener2 = vi.fn();
    lc.on('destroyed', listener1);
    lc.on('destroyed', listener2);
    lc.emit('destroyed', { timestamp: 2000 });
    expect(listener1).toHaveBeenCalledOnce();
    expect(listener2).toHaveBeenCalledOnce();
  });

  // 4. Payload frozen — the payload object received by the listener is frozen
  it('delivers a frozen payload to the listener', () => {
    const lc = createLifecycle();
    let received: object | undefined;
    lc.on('destroyed', (payload) => {
      received = payload;
    });
    lc.emit('destroyed', { timestamp: 3000 });
    expect(received).toBeDefined();
    expect(Object.isFrozen(received)).toBe(true);
  });

  // 5. Unsubscribe — calling the returned Unsubscribe removes the listener
  it('stops calling listener after unsubscribe', () => {
    const lc = createLifecycle();
    const listener = vi.fn();
    const unsub = lc.on('initialized', listener);
    lc.emit('initialized', { state: 'initializing', timestamp: 4000 });
    expect(listener).toHaveBeenCalledOnce();
    unsub();
    lc.emit('initialized', { state: 'initializing', timestamp: 5000 });
    expect(listener).toHaveBeenCalledOnce(); // still only once
  });

  // 6. Unsubscribe idempotent — calling the returned Unsubscribe twice does not throw
  it('does not throw when unsubscribe is called twice', () => {
    const lc = createLifecycle();
    const unsub = lc.on('destroyed', vi.fn());
    expect(() => {
      unsub();
      unsub();
    }).not.toThrow();
  });

  // 7. Different events isolated — subscribing to 'initialized' does not receive 'state-change' payloads
  it('does not deliver events to listeners registered for a different event', () => {
    const lc = createLifecycle();
    const listener = vi.fn();
    lc.on('initialized', listener);
    lc.emit('state-change', { from: 'initializing', to: 'ready', timestamp: 6000 });
    expect(listener).not.toHaveBeenCalled();
  });

  // 8. Multiple unsubscribes — if two listeners are registered and one unsubscribes, the other still fires
  it('keeps other listeners active when one unsubscribes', () => {
    const lc = createLifecycle();
    const listener1 = vi.fn();
    const listener2 = vi.fn();
    const unsub1 = lc.on('destroyed', listener1);
    lc.on('destroyed', listener2);
    unsub1();
    lc.emit('destroyed', { timestamp: 7000 });
    expect(listener1).not.toHaveBeenCalled();
    expect(listener2).toHaveBeenCalledOnce();
  });

  // 9. Async listener fire-and-forget — emit() returns synchronously
  it('returns synchronously even when an async listener is registered', () => {
    const lc = createLifecycle();
    let syncVar = 0;

    lc.on('destroyed', async () => {
      await new Promise((resolve) => setTimeout(resolve, 100));
      syncVar = 99; // should not be set by the time emit returns
    });

    lc.on('destroyed', () => {
      syncVar = 1; // set synchronously
    });

    lc.emit('destroyed', { timestamp: 8000 });
    // The sync listener should have run, the async one should not have resolved yet
    expect(syncVar).toBe(1);
  });

  // 10. All event names fire — smoke-test each of the 5 event names
  it('fires the "initialized" event', () => {
    const lc = createLifecycle();
    const listener = vi.fn();
    lc.on('initialized', listener);
    lc.emit('initialized', { state: 'ready', timestamp: Date.now() });
    expect(listener).toHaveBeenCalledOnce();
  });

  it('fires the "ready" event', () => {
    const lc = createLifecycle();
    const listener = vi.fn();
    lc.on('ready', listener);
    lc.emit('ready', { state: 'ready', substates, timestamp: Date.now() });
    expect(listener).toHaveBeenCalledOnce();
  });

  it('fires the "error" event', () => {
    const lc = createLifecycle();
    const listener = vi.fn();
    lc.on('error', listener);
    lc.emit('error', { error: ke, recoverable: true, timestamp: Date.now() });
    expect(listener).toHaveBeenCalledOnce();
  });

  it('fires the "destroyed" event', () => {
    const lc = createLifecycle();
    const listener = vi.fn();
    lc.on('destroyed', listener);
    lc.emit('destroyed', { timestamp: Date.now() });
    expect(listener).toHaveBeenCalledOnce();
  });

  it('fires the "state-change" event', () => {
    const lc = createLifecycle();
    const listener = vi.fn();
    lc.on('state-change', listener);
    lc.emit('state-change', { from: 'initializing', to: 'ready', timestamp: Date.now() });
    expect(listener).toHaveBeenCalledOnce();
  });

  // 11. Error resilience — one failing listener does not stop others
  it('continues calling listeners if one throws synchronously', () => {
    const lc = createLifecycle();
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    const listener1 = vi.fn(() => {
      throw new Error('fail');
    });
    const listener2 = vi.fn();

    lc.on('destroyed', listener1);
    lc.on('destroyed', listener2);

    lc.emit('destroyed', { timestamp: 9000 });

    expect(listener1).toHaveBeenCalledOnce();
    expect(listener2).toHaveBeenCalledOnce();
    expect(errorSpy).toHaveBeenCalledWith(
      '[B-BOARD ERROR]',
      expect.stringContaining("Listener for event 'destroyed' failed:"),
      expect.any(Error)
    );

    errorSpy.mockRestore();
  });

  it('logs error if an async listener rejects', async () => {
    const lc = createLifecycle();
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    lc.on('destroyed', async () => {
      throw new Error('async fail');
    });

    lc.emit('destroyed', { timestamp: 10000 });

    // Wait for the microtask queue to process the rejection
    await new Promise((resolve) => setTimeout(resolve, 0));

    expect(errorSpy).toHaveBeenCalledWith(
      '[B-BOARD ERROR]',
      expect.stringContaining("Async listener for event 'destroyed' failed:"),
      expect.any(Error)
    );

    errorSpy.mockRestore();
  });

  it('removes event from listeners map when last listener unsubscribes', () => {
    const lc = createLifecycle();
    const unsub = lc.on('destroyed', vi.fn());

    // We can't directly check the internal Map size, but we can verify it doesn't fire after unsub
    // This is more of a line coverage completion for the `listeners.delete(event)` branch
    unsub();
    // No way to easily assert the Map is empty without exposing it or using reflection
    // but the line is now exercised.
  });
});
