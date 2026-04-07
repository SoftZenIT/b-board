import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ErrorCode } from '../../public/error-codes.js';
import {
  supportsCustomElements,
  supportsShadowDOM,
  supportsCSSCustomProperties,
  supportsFetchAPI,
  supportsResizeObserver,
  supportsMatchMedia,
  checkBrowserCompatibility,
  validateBrowser,
  _resetCachedReport,
} from './browser-compat.js';

describe('browser-compat', () => {
  beforeEach(() => {
    _resetCachedReport();
    vi.restoreAllMocks();
  });

  describe('individual detection functions', () => {
    it('supportsCustomElements returns true when window.customElements exists', () => {
      expect(supportsCustomElements()).toBe(true);
    });

    it('supportsShadowDOM returns true when attachShadow exists', () => {
      expect(supportsShadowDOM()).toBe(true);
    });

    it('supportsFetchAPI returns true when fetch exists', () => {
      expect(supportsFetchAPI()).toBe(true);
    });

    it('supportsResizeObserver returns true when ResizeObserver exists', () => {
      // jsdom may or may not have ResizeObserver
      const hasIt = typeof globalThis.ResizeObserver === 'function';
      expect(supportsResizeObserver()).toBe(hasIt);
    });

    it('supportsMatchMedia returns true when matchMedia exists', () => {
      const hasIt = typeof window.matchMedia === 'function';
      expect(supportsMatchMedia()).toBe(hasIt);
    });

    it('supportsCSSCustomProperties returns true when CSS.supports is missing (assumes support)', () => {
      const original = globalThis.CSS;
      // @ts-expect-error — intentionally removing CSS for test
      globalThis.CSS = undefined;
      expect(supportsCSSCustomProperties()).toBe(true);
      globalThis.CSS = original;
    });

    it('supportsCSSCustomProperties returns false when CSS.supports explicitly rejects', () => {
      const original = globalThis.CSS;
      globalThis.CSS = {
        supports: () => false,
      } as unknown as typeof CSS;
      expect(supportsCSSCustomProperties()).toBe(false);
      globalThis.CSS = original;
    });
  });

  describe('checkBrowserCompatibility', () => {
    it('returns a complete report object', () => {
      const report = checkBrowserCompatibility();
      expect(report).toHaveProperty('customElements');
      expect(report).toHaveProperty('shadowDOM');
      expect(report).toHaveProperty('cssCustomProperties');
      expect(report).toHaveProperty('fetchAPI');
      expect(report).toHaveProperty('resizeObserver');
      expect(report).toHaveProperty('matchMedia');
    });

    it('caches the report — second call returns same reference', () => {
      const r1 = checkBrowserCompatibility();
      const r2 = checkBrowserCompatibility();
      expect(r1).toBe(r2);
    });

    it('_resetCachedReport clears the cache', () => {
      const r1 = checkBrowserCompatibility();
      _resetCachedReport();
      const r2 = checkBrowserCompatibility();
      expect(r1).not.toBe(r2);
    });
  });

  describe('validateBrowser', () => {
    it('returns empty array when all APIs are present', () => {
      // jsdom lacks CSS.supports — mock it for this test
      const originalCSS = globalThis.CSS;
      globalThis.CSS = {
        ...originalCSS,
        supports: () => true,
      } as typeof CSS;
      _resetCachedReport();

      const errors = validateBrowser();
      const fatalErrors = errors.filter((e) => e.severity === 'fatal');
      expect(fatalErrors).toHaveLength(0);

      globalThis.CSS = originalCSS;
    });

    it('returns fatal error when customElements is missing', () => {
      const descriptor = Object.getOwnPropertyDescriptor(window, 'customElements');
      Object.defineProperty(window, 'customElements', {
        get: () => undefined,
        configurable: true,
      });
      _resetCachedReport();

      const errors = validateBrowser();
      const fatal = errors.find(
        (e) => e.severity === 'fatal' && e.message.includes('Custom Elements v1')
      );
      expect(fatal).toBeDefined();
      expect(fatal!.code).toBe(ErrorCode.UNSUPPORTED_BROWSER);

      if (descriptor) {
        Object.defineProperty(window, 'customElements', descriptor);
      }
    });

    it('returns fatal error when attachShadow is missing', () => {
      const original = HTMLElement.prototype.attachShadow;
      // @ts-expect-error — intentionally removing for test
      HTMLElement.prototype.attachShadow = undefined;
      _resetCachedReport();

      const errors = validateBrowser();
      const fatal = errors.find(
        (e) => e.severity === 'fatal' && e.message.includes('Shadow DOM v1')
      );
      expect(fatal).toBeDefined();

      HTMLElement.prototype.attachShadow = original;
    });

    it('returns recoverable error when ResizeObserver is missing', () => {
      const original = window.ResizeObserver;
      // @ts-expect-error — intentionally removing for test
      window.ResizeObserver = undefined;
      _resetCachedReport();

      const errors = validateBrowser();
      const recoverable = errors.find(
        (e) => e.severity === 'recoverable' && e.message.includes('ResizeObserver')
      );
      expect(recoverable).toBeDefined();
      expect(recoverable!.code).toBe(ErrorCode.MISSING_API);

      window.ResizeObserver = original;
    });

    it('returns recoverable error when fetch is missing', () => {
      const original = window.fetch;
      // @ts-expect-error — intentionally removing for test
      window.fetch = undefined;
      _resetCachedReport();

      const errors = validateBrowser();
      const recoverable = errors.find(
        (e) => e.severity === 'recoverable' && e.message.includes('Fetch API')
      );
      expect(recoverable).toBeDefined();

      window.fetch = original;
    });

    it('returns recoverable error when matchMedia is missing', () => {
      const original = window.matchMedia;
      // @ts-expect-error — intentionally removing for test
      window.matchMedia = undefined;
      _resetCachedReport();

      const errors = validateBrowser();
      const recoverable = errors.find(
        (e) => e.severity === 'recoverable' && e.message.includes('matchMedia')
      );
      expect(recoverable).toBeDefined();

      window.matchMedia = original;
    });

    it('includes suggestion in every error', () => {
      const descriptor = Object.getOwnPropertyDescriptor(window, 'customElements');
      Object.defineProperty(window, 'customElements', {
        get: () => undefined,
        configurable: true,
      });
      _resetCachedReport();

      const errors = validateBrowser();
      for (const err of errors) {
        expect(err.suggestion).toBeTruthy();
      }

      if (descriptor) {
        Object.defineProperty(window, 'customElements', descriptor);
      }
    });
  });
});
