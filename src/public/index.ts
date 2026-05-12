/**
 * @packageDocumentation
 * b-board public API — the single entry point for all consumer imports.
 * Do not import from internal modules directly.
 *
 * @example
 * ```ts
 * import { createKeyboardEngine, DataLayerImpl } from 'b-board'
 * ```
 */

// BJ-Keyboard Public API
// This is the single entry point for all public exports.
// Internal modules must NOT be imported directly by consumers.

export * from './types.js';
export * from './events.types.js';
export { ErrorCode, RECOVERY_SUGGESTIONS, RECOVERABLE_CODES } from './error-codes.js';

// Core public interfaces
export { createKeyboardEngine } from '../core/engine.js';
export type { KeyboardEngine, KeyboardEngineOptions } from '../core/engine.js';
export type { KeyboardState, StateSnapshot } from '../core/state.types.js';
export type {
  ReadySubstates,
  AttachmentState,
  FocusState,
  SurfaceState,
  InteractionState,
  CompositionSubstate,
} from '../core/substate.types.js';
export type {
  LifecycleEventMap,
  LifecycleEventName,
  Unsubscribe,
} from '../core/lifecycle.types.js';

// Data public interfaces
export * from '../data/registry.types.js';
export * from '../data/language.types.js';
export * from '../data/layout.types.js';
export * from '../data/runtime.types.js';
export * from '../data/data-layer.js';

// Adapter public interfaces
export * from '../adapters/types.js';
