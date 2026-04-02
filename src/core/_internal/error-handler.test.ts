import { describe, it, expect, afterEach } from 'vitest';
import { createErrorHandler } from './error-handler.js';

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
});
