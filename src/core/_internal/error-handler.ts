import { StateTransitionError } from './state-machine.js';
import { InvariantViolationError } from './invariants.js';
import { ErrorCode, RECOVERY_SUGGESTIONS } from '../../public/error-codes.js';
import { DataLoaderError } from '../../data/loader.js';
import { ValidationError } from '../../data/_internal/validator.js';
import { IntegrityError } from '../../data/_internal/integrity-checker.js';

export { ErrorCode };
export const ERROR_SEVERITIES = ['recoverable', 'fatal', 'unknown'] as const;
export type ErrorSeverity = (typeof ERROR_SEVERITIES)[number];

export interface KeyboardError {
  readonly code: ErrorCode;
  readonly severity: ErrorSeverity;
  readonly message: string; // sanitized, safe for prod logs
  readonly cause?: unknown; // original error (dev only — omitted in production)
  readonly suggestion: string; // actionable recovery hint
}

export interface ErrorHandler {
  handle(error: unknown, severity?: ErrorSeverity): KeyboardError;
  classifyError(error: unknown): { code: ErrorCode; severity: ErrorSeverity };
  isRecoverable(error: KeyboardError): boolean;
}

/**
 * Classifies a thrown value into an {@link ErrorCode} and {@link ErrorSeverity}.
 */
function classifyErrorValue(error: unknown): { code: ErrorCode; severity: ErrorSeverity } {
  if (error instanceof DataLoaderError) {
    const msg = error.message;
    if (msg.includes('not found') || msg.includes('File not found'))
      return { code: ErrorCode.DATA_NOT_FOUND, severity: 'fatal' };
    // HTTP 4xx client errors are fatal (bad config); 5xx/other are recoverable
    const httpMatch = msg.match(/HTTP (\d+)/);
    if (httpMatch) {
      const status = Number(httpMatch[1]);
      return status >= 400 && status < 500
        ? { code: ErrorCode.HTTP_ERROR, severity: 'fatal' }
        : { code: ErrorCode.HTTP_ERROR, severity: 'recoverable' };
    }
    return { code: ErrorCode.NETWORK_ERROR, severity: 'recoverable' };
  }
  if (error instanceof ValidationError) {
    return { code: ErrorCode.SCHEMA_VALIDATION, severity: 'fatal' };
  }
  if (error instanceof IntegrityError) {
    return { code: ErrorCode.INTEGRITY_CHECK, severity: 'fatal' };
  }
  if (error instanceof StateTransitionError) {
    return { code: ErrorCode.INVALID_TRANSITION, severity: 'fatal' };
  }
  if (error instanceof InvariantViolationError) {
    return { code: ErrorCode.INVARIANT_VIOLATION, severity: 'fatal' };
  }
  // JSON parse failures (TypeError from res.json()) and other unknowns
  if (error instanceof SyntaxError) {
    return { code: ErrorCode.PARSE_ERROR, severity: 'fatal' };
  }
  return { code: ErrorCode.UNKNOWN_ERROR, severity: 'recoverable' };
}

/**
 * Creates an error handler that normalises thrown values into KeyboardError.
 * @example
 * const handler = createErrorHandler()
 * const ke = handler.handle(new Error('boom'))
 * handler.isRecoverable(ke) // true (unknown errors default to recoverable)
 */
export function createErrorHandler(): ErrorHandler {
  return {
    classifyError: classifyErrorValue,

    handle(error: unknown, severityOverride?: ErrorSeverity): KeyboardError {
      const { code, severity: autoSeverity } = classifyErrorValue(error);
      const severity = severityOverride ?? autoSeverity;

      let message: string;
      let cause: unknown;

      if (error instanceof Error) {
        message = error.message;
        cause = error;
      } else if (typeof error === 'string') {
        message = error;
        cause = error;
      } else {
        message = '[KeyboardError] An unknown error occurred';
        cause = error;
      }

      const suggestion = RECOVERY_SUGGESTIONS[code];

      const ke: KeyboardError = {
        code,
        severity,
        message,
        suggestion,
        ...(process.env['NODE_ENV'] !== 'production' && { cause }),
      };

      return ke;
    },

    isRecoverable(error: KeyboardError): boolean {
      return error.severity === 'recoverable';
    },
  };
}
