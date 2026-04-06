/**
 * Canonical error codes emitted by the keyboard component.
 * Each code maps to a {@link RECOVERY_SUGGESTIONS} entry with a human-readable
 * recovery hint for developers.
 */
export enum ErrorCode {
  // Data loading
  NETWORK_ERROR = 'NETWORK_ERROR',
  HTTP_ERROR = 'HTTP_ERROR',
  DATA_NOT_FOUND = 'DATA_NOT_FOUND',
  PARSE_ERROR = 'PARSE_ERROR',

  // Validation
  SCHEMA_VALIDATION = 'SCHEMA_VALIDATION',
  INTEGRITY_CHECK = 'INTEGRITY_CHECK',
  INVALID_LANGUAGE = 'INVALID_LANGUAGE',
  INVALID_LAYOUT = 'INVALID_LAYOUT',

  // State
  INVALID_TRANSITION = 'INVALID_TRANSITION',
  INVARIANT_VIOLATION = 'INVARIANT_VIOLATION',

  // Composition
  COMPOSITION_ERROR = 'COMPOSITION_ERROR',
  INVALID_OPERATION = 'INVALID_OPERATION',

  // Browser compatibility
  UNSUPPORTED_BROWSER = 'UNSUPPORTED_BROWSER',
  MISSING_API = 'MISSING_API',

  // Runtime
  RENDER_ERROR = 'RENDER_ERROR',
  EVENT_DISPATCH_ERROR = 'EVENT_DISPATCH_ERROR',
  UNKNOWN_ERROR = 'UNKNOWN_ERROR',
}

/**
 * Developer-facing recovery suggestions keyed by {@link ErrorCode}.
 */
export const RECOVERY_SUGGESTIONS: Readonly<Record<ErrorCode, string>> = {
  [ErrorCode.NETWORK_ERROR]: 'Check network connectivity and ensure the data server is reachable.',
  [ErrorCode.HTTP_ERROR]:
    'Verify the data file URL returns a 2xx status. Check server logs for errors.',
  [ErrorCode.DATA_NOT_FOUND]:
    'Ensure the requested layout or language data file exists at the expected path.',
  [ErrorCode.PARSE_ERROR]: 'The data file contains invalid JSON. Regenerate or fix the data file.',
  [ErrorCode.SCHEMA_VALIDATION]:
    'The data file does not match the expected schema. Run the schema validator to identify issues.',
  [ErrorCode.INTEGRITY_CHECK]:
    'Cross-file data consistency check failed. Check for duplicate keyIds or circular composition rules.',
  [ErrorCode.INVALID_LANGUAGE]:
    'The specified language ID is not supported. Use one of the registered language IDs.',
  [ErrorCode.INVALID_LAYOUT]:
    'The specified layout variant is not supported. Use one of the registered layout variants.',
  [ErrorCode.INVALID_TRANSITION]:
    'Check the valid transitions for the current state before calling transition().',
  [ErrorCode.INVARIANT_VIOLATION]:
    'Ensure all required substates and engine conditions are met before the operation.',
  [ErrorCode.COMPOSITION_ERROR]:
    'A composition rule failed. Check the composition rules catalog for the active language.',
  [ErrorCode.INVALID_OPERATION]:
    'The input operation is malformed. Verify operation type, text, and selection fields.',
  [ErrorCode.UNSUPPORTED_BROWSER]:
    'This browser does not support required Web Component APIs. Please use a modern browser (Chrome 105+, Firefox 104+, Safari 15.6+, Edge 105+).',
  [ErrorCode.MISSING_API]:
    'A required browser API is unavailable. The keyboard will attempt to work with reduced functionality.',
  [ErrorCode.RENDER_ERROR]:
    'The keyboard failed to render. This is usually transient — try re-opening the keyboard.',
  [ErrorCode.EVENT_DISPATCH_ERROR]:
    'An event listener threw an error. Check your bboard event handlers for exceptions.',
  [ErrorCode.UNKNOWN_ERROR]: 'An unexpected error occurred. Check the browser console for details.',
};

/**
 * Maps an {@link ErrorCode} to whether it is considered recoverable.
 * Recoverable errors may resolve on retry; fatal errors indicate
 * fundamentally broken data or configuration.
 */
export const RECOVERABLE_CODES: ReadonlySet<ErrorCode> = new Set([
  ErrorCode.NETWORK_ERROR,
  ErrorCode.RENDER_ERROR,
  ErrorCode.EVENT_DISPATCH_ERROR,
  ErrorCode.COMPOSITION_ERROR,
  ErrorCode.UNKNOWN_ERROR,
]);
