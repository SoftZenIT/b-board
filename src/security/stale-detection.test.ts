import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { StaleDetection } from './stale-detection.js';

describe('StaleDetection', () => {
  describe('isStale', () => {
    let el: HTMLElement;

    beforeEach(() => {
      el = document.createElement('div');
    });

    afterEach(() => {
      el.remove();
    });

    it('returns false when element is attached to the document', () => {
      document.body.appendChild(el);
      expect(StaleDetection.isStale(el)).toBe(false);
    });

    it('returns true when element is not in the document', () => {
      expect(StaleDetection.isStale(el)).toBe(true);
    });
  });

  describe('hasAttributeChanges', () => {
    it('returns true for a disabled input', () => {
      const input = document.createElement('input');
      input.disabled = true;
      expect(StaleDetection.hasAttributeChanges(input)).toBe(true);
    });

    it('returns true for a readOnly input', () => {
      const input = document.createElement('input');
      input.readOnly = true;
      expect(StaleDetection.hasAttributeChanges(input)).toBe(true);
    });

    it('returns false for an enabled, writable input', () => {
      const input = document.createElement('input');
      expect(StaleDetection.hasAttributeChanges(input)).toBe(false);
    });

    it('returns true for a disabled textarea', () => {
      const textarea = document.createElement('textarea');
      textarea.disabled = true;
      expect(StaleDetection.hasAttributeChanges(textarea)).toBe(true);
    });

    it('returns false for a plain element', () => {
      const div = document.createElement('div');
      expect(StaleDetection.hasAttributeChanges(div)).toBe(false);
    });
  });
});
