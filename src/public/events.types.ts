import type { KeyboardState } from '../core/index.js';
import type { ErrorSeverity } from '../core/index.js';
import type { ErrorCode } from './error-codes.js';

/** Payload for the `bboard-ready` custom event. */
export interface BBoardReadyEventDetail {
  readonly state: KeyboardState;
}

/** Payload for the `bboard-language-change` custom event. */
export interface BBoardLanguageChangeEventDetail {
  readonly languageId: string;
}

/** Payload for the `bboard-theme-change` custom event. */
export interface BBoardThemeChangeEventDetail {
  readonly theme: 'light' | 'dark' | 'auto';
  readonly effectiveTheme: 'light' | 'dark';
}

/** Payload for the `bboard-error` custom event. */
export interface BBoardErrorEventDetail {
  readonly code: ErrorCode;
  readonly severity: ErrorSeverity;
  readonly message: string;
  readonly recoverySuggestion: string;
  readonly cause?: Error;
}

/** Payload for the `bboard-key-press` custom event. */
export interface BBoardKeyPressEventDetail {
  readonly keyId: string;
  readonly char: string;
}

/**
 * Map of all custom events emitted by `<benin-keyboard>`.
 * Use this with `addEventListener` for type-safe event handling.
 * @example
 * ```ts
 * keyboard.addEventListener('bboard-ready', (e: BBoardEventMap['bboard-ready']) => {
 *   console.log(e.detail.state)
 * })
 * ```
 */
export type BBoardEventMap = {
  'bboard-ready': CustomEvent<BBoardReadyEventDetail>;
  'bboard-language-change': CustomEvent<BBoardLanguageChangeEventDetail>;
  'bboard-theme-change': CustomEvent<BBoardThemeChangeEventDetail>;
  'bboard-error': CustomEvent<BBoardErrorEventDetail>;
  'bboard-key-press': CustomEvent<BBoardKeyPressEventDetail>;
};
