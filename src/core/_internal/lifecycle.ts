import type {
  LifecycleEventMap,
  LifecycleEventName,
  Unsubscribe,
  Lifecycle,
} from '../lifecycle.types.js';
import { logger } from '../../utils/logger.js';

/**
 * Creates a typed lifecycle event emitter.
 * on() returns an Unsubscribe closure. emit() calls listeners synchronously.
 * Async listeners are fire-and-forget. Payloads are frozen before delivery.
 * @example
 * const lc = createLifecycle()
 * const unsub = lc.on('state-change', ({ from, to }) => console.log(from, to))
 * lc.emit('state-change', { from: 'initializing', to: 'ready', timestamp: Date.now() })
 * unsub()
 */
export function createLifecycle(): Lifecycle {
  const listeners = new Map<string, Set<(payload: unknown) => void | Promise<void>>>();

  return {
    on<K extends LifecycleEventName>(
      event: K,
      listener: (payload: LifecycleEventMap[K]) => void | Promise<void>
    ): Unsubscribe {
      if (!listeners.has(event)) {
        listeners.set(event, new Set());
      }
      const set = listeners.get(event)!;
      type AnyListener = (payload: unknown) => void | Promise<void>;
      const stored = listener as unknown as AnyListener;
      set.add(stored);

      return () => {
        set.delete(stored);
        if (set.size === 0) listeners.delete(event);
      };
    },

    emit<K extends LifecycleEventName>(event: K, payload: LifecycleEventMap[K]): void {
      const frozen = Object.freeze({ ...payload });
      const set = listeners.get(event);
      if (set === undefined) return;
      for (const listener of set) {
        try {
          const result = listener(frozen);
          if (result instanceof Promise) {
            result.catch((error) => {
              logger.error(`Async listener for event '${event}' failed:`, error);
            });
          }
        } catch (error) {
          logger.error(`Listener for event '${event}' failed:`, error);
        }
      }
    },
  };
}
