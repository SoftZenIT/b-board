import type { KeyboardState, ErrorSeverity } from '../core/index.js';

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
  readonly severity: ErrorSeverity;
  readonly message: string;
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
