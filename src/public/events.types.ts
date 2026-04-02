import type { KeyboardState, ErrorSeverity } from '../core/index.js';

export interface BBoardReadyEventDetail {
  readonly state: KeyboardState;
}

export interface BBoardLanguageChangeEventDetail {
  readonly languageId: string;
}

export interface BBoardErrorEventDetail {
  readonly severity: ErrorSeverity;
  readonly message: string;
}

export type BBoardEventMap = {
  'bboard-ready': CustomEvent<BBoardReadyEventDetail>;
  'bboard-language-change': CustomEvent<BBoardLanguageChangeEventDetail>;
  'bboard-error': CustomEvent<BBoardErrorEventDetail>;
};
