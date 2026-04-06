import { describe, it, expect } from 'vitest';
import type {
  BBoardReadyEventDetail,
  BBoardLanguageChangeEventDetail,
  BBoardErrorEventDetail,
} from '@/public/events.types.js';
import { ErrorCode } from '@/public/error-codes.js';

describe('Public Event Types', () => {
  it('types are importable and structured correctly', () => {
    const readyDetail: BBoardReadyEventDetail = { state: 'ready' };
    expect(readyDetail.state).toBe('ready');

    // Use the other types to satisfy the linter
    const langDetail: BBoardLanguageChangeEventDetail = { languageId: 'yoruba' };
    expect(langDetail.languageId).toBe('yoruba');

    const errDetail: BBoardErrorEventDetail = {
      code: ErrorCode.UNKNOWN_ERROR,
      severity: 'recoverable',
      message: 'test',
      recoverySuggestion: 'Check the browser console for details.',
    };
    expect(errDetail.severity).toBe('recoverable');
  });
});
