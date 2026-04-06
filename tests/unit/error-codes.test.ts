import { describe, it, expect } from 'vitest';
import {
  ErrorCode,
  RECOVERY_SUGGESTIONS,
  RECOVERABLE_CODES,
} from '../../src/public/error-codes.js';

describe('ErrorCode public API', () => {
  it('every ErrorCode value has a RECOVERY_SUGGESTIONS entry', () => {
    for (const code of Object.values(ErrorCode)) {
      expect(RECOVERY_SUGGESTIONS[code]).toBeTruthy();
    }
  });

  it('RECOVERABLE_CODES is a subset of ErrorCode values', () => {
    const allCodes = new Set(Object.values(ErrorCode));
    for (const code of RECOVERABLE_CODES) {
      expect(allCodes.has(code)).toBe(true);
    }
  });

  it('DATA_NOT_FOUND is NOT in RECOVERABLE_CODES (retrying a missing file will not help)', () => {
    expect(RECOVERABLE_CODES.has(ErrorCode.DATA_NOT_FOUND)).toBe(false);
  });

  it('HTTP_ERROR is NOT in RECOVERABLE_CODES (severity depends on status code)', () => {
    expect(RECOVERABLE_CODES.has(ErrorCode.HTTP_ERROR)).toBe(false);
  });

  it('NETWORK_ERROR is in RECOVERABLE_CODES', () => {
    expect(RECOVERABLE_CODES.has(ErrorCode.NETWORK_ERROR)).toBe(true);
  });

  it('SCHEMA_VALIDATION is NOT in RECOVERABLE_CODES', () => {
    expect(RECOVERABLE_CODES.has(ErrorCode.SCHEMA_VALIDATION)).toBe(false);
  });

  it('exports at least 10 error codes', () => {
    expect(Object.values(ErrorCode).length).toBeGreaterThanOrEqual(10);
  });
});
