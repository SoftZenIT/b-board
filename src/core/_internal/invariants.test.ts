import { describe, it, expect } from 'vitest';
import { createInvariantsChecker, InvariantViolationError } from './invariants.js';
import type { InvariantContext } from './invariants.js';

const readyCtx: InvariantContext = {
  state: 'ready',
  substates: {
    attachment: 'attached',
    focus: 'focused',
    surface: 'visible',
    interaction: 'active',
    composition: 'inactive',
  },
  hasResolvedLayout: true,
  hasTargetAdapter: true,
};

const nonReadyCtx: InvariantContext = {
  state: 'uninitialized',
  substates: {
    attachment: 'detached',
    focus: 'blurred',
    surface: 'hidden',
    interaction: 'idle',
    composition: 'inactive',
  },
  hasResolvedLayout: false,
  hasTargetAdapter: false,
};

/** Runs check() once and returns the caught error, or throws if nothing was thrown. */
function catchError(
  checker: ReturnType<typeof createInvariantsChecker>,
  ctx: InvariantContext
): InvariantViolationError {
  try {
    checker.check(ctx);
    throw new Error('Expected InvariantViolationError to be thrown but check() did not throw');
  } catch (e) {
    if (e instanceof InvariantViolationError) return e;
    throw e;
  }
}

describe('createInvariantsChecker', () => {
  describe('Invariant #1: when state is not ready, all substates must be at initial values', () => {
    it('throws InvariantViolationError #1 when non-ready state has non-initial substates', () => {
      const checker = createInvariantsChecker();
      const ctx: InvariantContext = {
        ...nonReadyCtx,
        substates: { ...nonReadyCtx.substates, attachment: 'attached' },
      };
      const err = catchError(checker, ctx);
      expect(err).toBeInstanceOf(InvariantViolationError);
      expect(err.invariantNumber).toBe(1);
    });

    it('passes when non-ready state has all substates at initial values', () => {
      const checker = createInvariantsChecker();
      expect(() => checker.check(nonReadyCtx)).not.toThrow();
    });
  });

  describe('Invariant #2: when attachment is detached, focus must be blurred', () => {
    it('throws InvariantViolationError #2 when detached but focus is focused', () => {
      const checker = createInvariantsChecker();
      const ctx: InvariantContext = {
        state: 'ready',
        substates: {
          attachment: 'detached',
          focus: 'focused',
          surface: 'hidden',
          interaction: 'idle',
          composition: 'inactive',
        },
        hasResolvedLayout: true,
        hasTargetAdapter: false,
      };
      const err = catchError(checker, ctx);
      expect(err).toBeInstanceOf(InvariantViolationError);
      expect(err.invariantNumber).toBe(2);
    });

    it('passes when detached and focus is blurred', () => {
      const checker = createInvariantsChecker();
      expect(() => checker.check(nonReadyCtx)).not.toThrow();
    });
  });

  describe('Invariant #3: when attachment is detached, interaction must be idle', () => {
    it('throws InvariantViolationError #3 when detached but interaction is active', () => {
      const checker = createInvariantsChecker();
      const ctx: InvariantContext = {
        state: 'ready',
        substates: {
          attachment: 'detached',
          focus: 'blurred',
          surface: 'hidden',
          interaction: 'active',
          composition: 'inactive',
        },
        hasResolvedLayout: true,
        hasTargetAdapter: false,
      };
      const err = catchError(checker, ctx);
      expect(err).toBeInstanceOf(InvariantViolationError);
      expect(err.invariantNumber).toBe(3);
    });

    it('passes when detached and interaction is idle', () => {
      const checker = createInvariantsChecker();
      expect(() => checker.check(nonReadyCtx)).not.toThrow();
    });
  });

  describe('Invariant #4: when attachment is detached, composition must be inactive', () => {
    it('throws InvariantViolationError #4 when detached but composition is composing', () => {
      const checker = createInvariantsChecker();
      const ctx: InvariantContext = {
        state: 'ready',
        substates: {
          attachment: 'detached',
          focus: 'blurred',
          surface: 'hidden',
          interaction: 'idle',
          composition: 'composing',
        },
        hasResolvedLayout: true,
        hasTargetAdapter: false,
      };
      const err = catchError(checker, ctx);
      expect(err).toBeInstanceOf(InvariantViolationError);
      expect(err.invariantNumber).toBe(4);
    });

    it('passes when detached and composition is inactive', () => {
      const checker = createInvariantsChecker();
      expect(() => checker.check(nonReadyCtx)).not.toThrow();
    });
  });

  describe('Invariant #5: when surface is hidden, interaction must be idle', () => {
    it('throws InvariantViolationError #5 when surface is hidden but interaction is active', () => {
      const checker = createInvariantsChecker();
      const ctx: InvariantContext = {
        state: 'ready',
        substates: {
          attachment: 'attached',
          focus: 'focused',
          surface: 'hidden',
          interaction: 'active',
          composition: 'inactive',
        },
        hasResolvedLayout: true,
        hasTargetAdapter: true,
      };
      const err = catchError(checker, ctx);
      expect(err).toBeInstanceOf(InvariantViolationError);
      expect(err.invariantNumber).toBe(5);
    });

    it('passes when surface is hidden and interaction is idle', () => {
      const checker = createInvariantsChecker();
      const ctx: InvariantContext = {
        state: 'ready',
        substates: {
          attachment: 'attached',
          focus: 'focused',
          surface: 'hidden',
          interaction: 'idle',
          composition: 'inactive',
        },
        hasResolvedLayout: true,
        hasTargetAdapter: true,
      };
      expect(() => checker.check(ctx)).not.toThrow();
    });
  });

  describe('Invariant #6: when composition is composing, focus must be focused', () => {
    it('throws InvariantViolationError #6 when composing but focus is blurred', () => {
      const checker = createInvariantsChecker();
      const ctx: InvariantContext = {
        state: 'ready',
        substates: {
          attachment: 'attached',
          focus: 'blurred',
          surface: 'visible',
          interaction: 'active',
          composition: 'composing',
        },
        hasResolvedLayout: true,
        hasTargetAdapter: true,
      };
      const err = catchError(checker, ctx);
      expect(err).toBeInstanceOf(InvariantViolationError);
      expect(err.invariantNumber).toBe(6);
    });

    it('passes when composing and focus is focused', () => {
      const checker = createInvariantsChecker();
      const ctx: InvariantContext = {
        state: 'ready',
        substates: {
          attachment: 'attached',
          focus: 'focused',
          surface: 'visible',
          interaction: 'active',
          composition: 'composing',
        },
        hasResolvedLayout: true,
        hasTargetAdapter: true,
      };
      expect(() => checker.check(ctx)).not.toThrow();
    });
  });

  describe('Invariant #7: when state is ready, hasResolvedLayout must be true', () => {
    it('throws InvariantViolationError #7 when state is ready but hasResolvedLayout is false', () => {
      const checker = createInvariantsChecker();
      const ctx: InvariantContext = { ...readyCtx, hasResolvedLayout: false };
      const err = catchError(checker, ctx);
      expect(err).toBeInstanceOf(InvariantViolationError);
      expect(err.invariantNumber).toBe(7);
    });

    it('passes when state is ready and hasResolvedLayout is true', () => {
      const checker = createInvariantsChecker();
      expect(() => checker.check(readyCtx)).not.toThrow();
    });
  });

  describe('Invariant #8: when attachment is attached, hasTargetAdapter must be true', () => {
    it('throws InvariantViolationError #8 when attached but hasTargetAdapter is false', () => {
      const checker = createInvariantsChecker();
      const ctx: InvariantContext = { ...readyCtx, hasTargetAdapter: false };
      const err = catchError(checker, ctx);
      expect(err).toBeInstanceOf(InvariantViolationError);
      expect(err.invariantNumber).toBe(8);
    });

    it('passes when attached and hasTargetAdapter is true', () => {
      const checker = createInvariantsChecker();
      expect(() => checker.check(readyCtx)).not.toThrow();
    });
  });

  describe('enabled: false option', () => {
    it('check() is a no-op when enabled is false, does not throw even with a violating context', () => {
      const checker = createInvariantsChecker({ enabled: false });
      const violatingCtx: InvariantContext = {
        state: 'uninitialized',
        substates: {
          attachment: 'attached',
          focus: 'focused',
          surface: 'visible',
          interaction: 'active',
          composition: 'composing',
        },
        hasResolvedLayout: false,
        hasTargetAdapter: false,
      };
      expect(() => checker.check(violatingCtx)).not.toThrow();
    });
  });

  describe('InvariantViolationError message format', () => {
    it('error message includes invariant number and invariant message', () => {
      const checker = createInvariantsChecker();
      const ctx: InvariantContext = { ...readyCtx, hasResolvedLayout: false };
      const err = catchError(checker, ctx);
      expect(err.message).toContain('[InvariantViolationError]');
      expect(err.message).toContain('Invariant #7');
      expect(err.message).toContain(err.invariantMessage);
      expect(err.invariantNumber).toBe(7);
      expect(err.name).toBe('InvariantViolationError');
    });
  });
});
