import { ErrorCode, RECOVERY_SUGGESTIONS } from '../../public/error-codes.js';
import type { KeyboardError } from './error-handler.js';

/**
 * Result of probing the current browser for required and optional APIs.
 * Each flag is `true` when the corresponding API is detected.
 */
export interface BrowserCompatReport {
  readonly customElements: boolean;
  readonly shadowDOM: boolean;
  readonly cssCustomProperties: boolean;
  readonly fetchAPI: boolean;
  readonly resizeObserver: boolean;
  readonly matchMedia: boolean;
}

let cachedReport: BrowserCompatReport | null = null;

export function supportsCustomElements(): boolean {
  return typeof window !== 'undefined' && typeof window.customElements !== 'undefined';
}

export function supportsShadowDOM(): boolean {
  return (
    typeof HTMLElement !== 'undefined' && typeof HTMLElement.prototype.attachShadow === 'function'
  );
}

export function supportsCSSCustomProperties(): boolean {
  // If CSS.supports is available, use it for a definitive check.
  // If CSS or CSS.supports is unavailable (e.g., jsdom, SSR), assume support
  // rather than producing a false negative — real browsers always have CSS.
  if (typeof CSS === 'undefined' || typeof CSS.supports !== 'function') return true;
  return CSS.supports('color', 'var(--test)');
}

export function supportsFetchAPI(): boolean {
  return typeof window !== 'undefined' && typeof window.fetch === 'function';
}

export function supportsResizeObserver(): boolean {
  return typeof window !== 'undefined' && typeof window.ResizeObserver === 'function';
}

export function supportsMatchMedia(): boolean {
  return typeof window !== 'undefined' && typeof window.matchMedia === 'function';
}

/**
 * Build a full compatibility report, caching the result so subsequent calls
 * do not re-probe the DOM.
 */
export function checkBrowserCompatibility(): BrowserCompatReport {
  if (cachedReport) return cachedReport;
  cachedReport = {
    customElements: supportsCustomElements(),
    shadowDOM: supportsShadowDOM(),
    cssCustomProperties: supportsCSSCustomProperties(),
    fetchAPI: supportsFetchAPI(),
    resizeObserver: supportsResizeObserver(),
    matchMedia: supportsMatchMedia(),
  };
  return cachedReport;
}

/**
 * Validate the current browser against the minimum requirements for b-board.
 *
 * Returns an array of {@link KeyboardError} objects — one for each missing API.
 * Core APIs (Custom Elements, Shadow DOM, CSS Custom Properties) produce
 * `fatal` severity errors; optional APIs produce `recoverable` ones.
 *
 * Call this once during `connectedCallback`.
 */
export function validateBrowser(): KeyboardError[] {
  const report = checkBrowserCompatibility();
  const errors: KeyboardError[] = [];

  const coreApis: Array<{ supported: boolean; name: string }> = [
    { supported: report.customElements, name: 'Custom Elements v1' },
    { supported: report.shadowDOM, name: 'Shadow DOM v1' },
    { supported: report.cssCustomProperties, name: 'CSS Custom Properties' },
  ];

  for (const api of coreApis) {
    if (!api.supported) {
      errors.push({
        code: ErrorCode.UNSUPPORTED_BROWSER,
        severity: 'fatal',
        message: `[BrowserCompat] Missing required API: ${api.name}`,
        suggestion: RECOVERY_SUGGESTIONS[ErrorCode.UNSUPPORTED_BROWSER],
      });
    }
  }

  const optionalApis: Array<{ supported: boolean; name: string }> = [
    { supported: report.fetchAPI, name: 'Fetch API' },
    { supported: report.resizeObserver, name: 'ResizeObserver' },
    { supported: report.matchMedia, name: 'matchMedia' },
  ];

  for (const api of optionalApis) {
    if (!api.supported) {
      errors.push({
        code: ErrorCode.MISSING_API,
        severity: 'recoverable',
        message: `[BrowserCompat] Optional API unavailable: ${api.name}`,
        suggestion: RECOVERY_SUGGESTIONS[ErrorCode.MISSING_API],
      });
    }
  }

  return errors;
}

/**
 * Reset the cached compatibility report.
 * Only intended for testing — in production the report is computed once.
 */
export function _resetCachedReport(): void {
  cachedReport = null;
}
