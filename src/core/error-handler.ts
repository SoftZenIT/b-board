import { StateTransitionError } from './state-machine.js';
import { InvariantViolationError } from './invariants.js';

export const ERROR_SEVERITIES = ['recoverable', 'fatal', 'unknown'] as const;
export type ErrorSeverity = (typeof ERROR_SEVERITIES)[number];

export interface KeyboardError {
  readonly severity: ErrorSeverity;
  readonly message: string; // sanitized, safe for prod logs
  readonly cause?: unknown; // original error (dev only — omitted in production)
  readonly suggestion?: string; // actionable recovery hint
}

export interface ErrorHandler {
  handle(error: unknown, severity: ErrorSeverity): KeyboardError;
  isRecoverable(error: KeyboardError): boolean;
}

/**
 * Creates an error handler that normalises thrown values into KeyboardError.
 * @example
 * const handler = createErrorHandler()
 * const ke = handler.handle(new Error('boom'), 'recoverable')
 * handler.isRecoverable(ke) // true
 */
export function createErrorHandler(): ErrorHandler {
  return {
    handle(error: unknown, severity: ErrorSeverity): KeyboardError {
      let message: string;
      let cause: unknown;
      let suggestion: string | undefined;

      if (error instanceof Error) {
        message = error.message;
        cause = error;
        if (error instanceof StateTransitionError) {
          suggestion =
            'Check the valid transitions for the current state before calling transition().';
        } else if (error instanceof InvariantViolationError) {
          suggestion =
            'Ensure all required substates and engine conditions are met before transitioning to ready or modifying substates.';
        }
      } else if (typeof error === 'string') {
        message = error;
        cause = error;
      } else {
        message = '[KeyboardError] An unknown error occurred';
        cause = error;
      }

      const ke: KeyboardError = {
        severity,
        message,
        ...(suggestion && { suggestion }),
        ...(process.env['NODE_ENV'] !== 'production' && { cause }),
      };

      return ke;
    },

    isRecoverable(error: KeyboardError): boolean {
      return error.severity === 'recoverable';
    },
  };
}
