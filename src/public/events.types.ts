import type { KeyboardState } from '../core/index.js';
import type { ErrorSeverity } from '../core/index.js';
import type { ErrorCode } from './error-codes.js';

export interface BBoardReadyEventDetail {
  readonly state: KeyboardState;
}

export interface BBoardLanguageChangeEventDetail {
  readonly languageId: string;
}

export interface BBoardThemeChangeEventDetail {
  readonly theme: 'light' | 'dark' | 'auto';
  readonly effectiveTheme: 'light' | 'dark';
}

export interface BBoardErrorEventDetail {
  readonly code: ErrorCode;
  readonly severity: ErrorSeverity;
  readonly message: string;
  readonly recoverySuggestion: string;
  readonly cause?: Error;
}

export interface BBoardKeyPressEventDetail {
  readonly keyId: string;
  readonly char: string;
}

export type BBoardEventMap = {
  'bboard-ready': CustomEvent<BBoardReadyEventDetail>;
  'bboard-language-change': CustomEvent<BBoardLanguageChangeEventDetail>;
  'bboard-theme-change': CustomEvent<BBoardThemeChangeEventDetail>;
  'bboard-error': CustomEvent<BBoardErrorEventDetail>;
  'bboard-key-press': CustomEvent<BBoardKeyPressEventDetail>;
};
