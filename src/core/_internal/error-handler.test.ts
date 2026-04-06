import { describe, it, expect, afterEach } from 'vitest';
import { createErrorHandler, ErrorCode } from './error-handler.js';
import { RECOVERY_SUGGESTIONS } from '../../public/error-codes.js';
import { DataLoaderError } from '../../data/loader.js';
import { ValidationError } from '../../data/_internal/validator.js';
import { IntegrityError } from '../../data/_internal/integrity-checker.js';
import { StateTransitionError } from './state-machine.js';
import { InvariantViolationError } from './invariants.js';

describe('createErrorHandler', () => {
  const originalNodeEnv = process.env['NODE_ENV'];

  afterEach(() => {
    process.env['NODE_ENV'] = originalNodeEnv;
  });

  it('handle(Error, "recoverable") sets message, severity, and includes cause in non-prod', () => {
    const handler = createErrorHandler();
    const err = new Error('msg');
    const ke = handler.handle(err, 'recoverable');

    expect(ke.message).toBe('msg');
    expect(ke.severity).toBe('recoverable');
    expect(ke.cause).toBe(err);
  });

  it('handle(Error, "fatal") sets severity to "fatal"', () => {
    const handler = createErrorHandler();
    const ke = handler.handle(new Error('msg'), 'fatal');

    expect(ke.severity).toBe('fatal');
  });

  it('handle(Error, "unknown") sets severity to "unknown"', () => {
    const handler = createErrorHandler();
    const ke = handler.handle(new Error('msg'), 'unknown');

    expect(ke.severity).toBe('unknown');
  });

  it('handle(string, "recoverable") sets message to string and cause to string', () => {
    const handler = createErrorHandler();
    const ke = handler.handle('string error', 'recoverable');

    expect(ke.message).toBe('string error');
    expect(ke.cause).toBe('string error');
  });

  it('handle(42, "fatal") sets message to fallback and cause to 42', () => {
    const handler = createErrorHandler();
    const ke = handler.handle(42, 'fatal');

    expect(ke.message).toBe('[KeyboardError] An unknown error occurred');
    expect(ke.cause).toBe(42);
  });

  it('handle(null, "fatal") sets message to fallback', () => {
    const handler = createErrorHandler();
    const ke = handler.handle(null, 'fatal');

    expect(ke.message).toBe('[KeyboardError] An unknown error occurred');
  });

  it('handle(object, "recoverable") sets cause to the original object', () => {
    const handler = createErrorHandler();
    const obj = { code: 404 };
    const ke = handler.handle(obj, 'recoverable');

    expect(ke.cause).toBe(obj);
  });

  it('includes cause when NODE_ENV is not "production"', () => {
    process.env['NODE_ENV'] = 'development';
    const handler = createErrorHandler();
    const err = new Error('boom');
    const ke = handler.handle(err, 'recoverable');

    expect('cause' in ke).toBe(true);
    expect(ke.cause).toBe(err);
  });

  it('omits cause when NODE_ENV is "production"', () => {
    process.env['NODE_ENV'] = 'production';
    const handler = createErrorHandler();
    const ke = handler.handle(new Error('boom'), 'recoverable');

    expect('cause' in ke).toBe(false);
  });

  it('isRecoverable() returns true for severity "recoverable"', () => {
    const handler = createErrorHandler();
    const ke = handler.handle(new Error('x'), 'recoverable');

    expect(handler.isRecoverable(ke)).toBe(true);
  });

  it('isRecoverable() returns false for severity "fatal"', () => {
    const handler = createErrorHandler();
    const ke = handler.handle(new Error('x'), 'fatal');

    expect(handler.isRecoverable(ke)).toBe(false);
  });

  it('isRecoverable() returns false for severity "unknown"', () => {
    const handler = createErrorHandler();
    const ke = handler.handle(new Error('x'), 'unknown');

    expect(handler.isRecoverable(ke)).toBe(false);
  });

  describe('ErrorCode classification', () => {
    it('every ErrorCode has a recovery suggestion', () => {
      for (const code of Object.values(ErrorCode)) {
        expect(RECOVERY_SUGGESTIONS[code]).toBeTruthy();
      }
    });

    it('handle() assigns an ErrorCode to every KeyboardError', () => {
      const handler = createErrorHandler();
      const ke = handler.handle(new Error('x'));
      expect(ke.code).toBeDefined();
      expect(Object.values(ErrorCode)).toContain(ke.code);
    });

    it('classifies DataLoaderError with "HTTP" as HTTP_ERROR (recoverable)', () => {
      const handler = createErrorHandler();
      const err = new DataLoaderError("[DataLoader] HTTP 503 loading 'data/layouts/desktop.json'");
      const { code, severity } = handler.classifyError(err);
      expect(code).toBe(ErrorCode.HTTP_ERROR);
      expect(severity).toBe('recoverable');
    });

    it('classifies DataLoaderError with "not found" as DATA_NOT_FOUND (fatal)', () => {
      const handler = createErrorHandler();
      const err = new DataLoaderError("[DataLoader] File not found in bundle: 'missing.json'");
      const { code, severity } = handler.classifyError(err);
      expect(code).toBe(ErrorCode.DATA_NOT_FOUND);
      expect(severity).toBe('fatal');
    });

    it('classifies DataLoaderError with network message as NETWORK_ERROR (recoverable)', () => {
      const handler = createErrorHandler();
      const err = new DataLoaderError(
        "[DataLoader] Network error loading 'data/foo.json': Failed to fetch"
      );
      const { code, severity } = handler.classifyError(err);
      expect(code).toBe(ErrorCode.NETWORK_ERROR);
      expect(severity).toBe('recoverable');
    });

    it('classifies ValidationError as SCHEMA_VALIDATION (fatal)', () => {
      const handler = createErrorHandler();
      const err = new ValidationError('Invalid schema');
      const { code, severity } = handler.classifyError(err);
      expect(code).toBe(ErrorCode.SCHEMA_VALIDATION);
      expect(severity).toBe('fatal');
    });

    it('classifies IntegrityError as INTEGRITY_CHECK (fatal)', () => {
      const handler = createErrorHandler();
      const err = new IntegrityError('Duplicate key');
      const { code, severity } = handler.classifyError(err);
      expect(code).toBe(ErrorCode.INTEGRITY_CHECK);
      expect(severity).toBe('fatal');
    });

    it('classifies StateTransitionError as INVALID_TRANSITION (fatal)', () => {
      const handler = createErrorHandler();
      const err = new StateTransitionError('ready', 'initializing', 'not allowed');
      const { code, severity } = handler.classifyError(err);
      expect(code).toBe(ErrorCode.INVALID_TRANSITION);
      expect(severity).toBe('fatal');
    });

    it('classifies InvariantViolationError as INVARIANT_VIOLATION (fatal)', () => {
      const handler = createErrorHandler();
      const err = new InvariantViolationError(1, 'invariant check failed');
      const { code, severity } = handler.classifyError(err);
      expect(code).toBe(ErrorCode.INVARIANT_VIOLATION);
      expect(severity).toBe('fatal');
    });

    it('classifies unknown errors as UNKNOWN_ERROR (recoverable)', () => {
      const handler = createErrorHandler();
      const { code, severity } = handler.classifyError({ random: 'obj' });
      expect(code).toBe(ErrorCode.UNKNOWN_ERROR);
      expect(severity).toBe('recoverable');
    });

    it('handle() without severity override uses auto-classified severity', () => {
      const handler = createErrorHandler();
      const ke = handler.handle(new DataLoaderError('[DataLoader] Network error'));
      expect(ke.severity).toBe('recoverable');
      expect(ke.code).toBe(ErrorCode.NETWORK_ERROR);
    });

    it('handle() with severity override uses the override', () => {
      const handler = createErrorHandler();
      const ke = handler.handle(new DataLoaderError('[DataLoader] Network error'), 'fatal');
      expect(ke.severity).toBe('fatal');
      expect(ke.code).toBe(ErrorCode.NETWORK_ERROR);
    });
  });
});
