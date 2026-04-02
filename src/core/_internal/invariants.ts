import type { KeyboardState } from '../state.types.js';
import type { ReadySubstates } from '../substate.types.js';
import { INITIAL_SUBSTATES } from '../substate.types.js';

export interface InvariantContext {
  state: KeyboardState;
  substates: ReadySubstates;
  hasResolvedLayout: boolean;
  hasTargetAdapter: boolean;
}

/** Thrown when an invariant is violated. Includes invariant number and message. */
export class InvariantViolationError extends Error {
  constructor(
    readonly invariantNumber: number,
    readonly invariantMessage: string
  ) {
    super(`[InvariantViolationError] Invariant #${invariantNumber} violated: ${invariantMessage}`);
    this.name = 'InvariantViolationError';
  }
}

export interface InvariantsChecker {
  check(ctx: InvariantContext): void;
}

export interface InvariantsCheckerOptions {
  /** Defaults to true. When false, check() is a no-op. */
  enabled?: boolean;
}

const INVARIANTS: Array<{ message: string; check: (ctx: InvariantContext) => boolean }> = [
  {
    // #1: when not in ready state, all substates must be at initial values
    message: "when state is not 'ready', all substates must be at initial values",
    check: (ctx) => {
      if (ctx.state === 'ready') return true;
      return (
        ctx.substates.attachment === INITIAL_SUBSTATES.attachment &&
        ctx.substates.focus === INITIAL_SUBSTATES.focus &&
        ctx.substates.surface === INITIAL_SUBSTATES.surface &&
        ctx.substates.interaction === INITIAL_SUBSTATES.interaction &&
        ctx.substates.composition === INITIAL_SUBSTATES.composition
      );
    },
  },
  {
    // #2: detached → focus must be blurred
    message: "when attachment is 'detached', focus must be 'blurred'",
    check: (ctx) => ctx.substates.attachment !== 'detached' || ctx.substates.focus === 'blurred',
  },
  {
    // #3: detached → interaction must be idle
    message: "when attachment is 'detached', interaction must be 'idle'",
    check: (ctx) => ctx.substates.attachment !== 'detached' || ctx.substates.interaction === 'idle',
  },
  {
    // #4: detached → composition must be inactive
    message: "when attachment is 'detached', composition must be 'inactive'",
    check: (ctx) =>
      ctx.substates.attachment !== 'detached' || ctx.substates.composition === 'inactive',
  },
  {
    // #5: hidden surface → interaction must be idle
    message: "when surface is 'hidden', interaction must be 'idle'",
    check: (ctx) => ctx.substates.surface !== 'hidden' || ctx.substates.interaction === 'idle',
  },
  {
    // #6: composing → focus must be focused
    message: "when composition is 'composing', focus must be 'focused'",
    check: (ctx) => ctx.substates.composition !== 'composing' || ctx.substates.focus === 'focused',
  },
  {
    // #7: ready state → must have resolved layout
    message: "when state is 'ready', hasResolvedLayout must be true",
    check: (ctx) => ctx.state !== 'ready' || ctx.hasResolvedLayout === true,
  },
  {
    // #8: attached → must have target adapter
    message: "when attachment is 'attached', hasTargetAdapter must be true",
    check: (ctx) => ctx.substates.attachment !== 'attached' || ctx.hasTargetAdapter === true,
  },
];

/**
 * Creates an invariants checker. Throws InvariantViolationError on first failed invariant.
 * Pass { enabled: false } to make check() a no-op (for production use).
 * @example
 * const checker = createInvariantsChecker()
 * checker.check({ state: 'ready', substates: readySubstates, hasResolvedLayout: true, hasTargetAdapter: true })
 */
export function createInvariantsChecker(options?: InvariantsCheckerOptions): InvariantsChecker {
  const enabled = options?.enabled ?? true;

  return {
    check(ctx: InvariantContext): void {
      if (!enabled) return;
      for (let i = 0; i < INVARIANTS.length; i++) {
        const invariant = INVARIANTS[i]!;
        if (!invariant.check(ctx)) {
          throw new InvariantViolationError(i + 1, invariant.message);
        }
      }
    },
  };
}
