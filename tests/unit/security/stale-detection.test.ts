import { describe, it, expect } from 'vitest';
import { StaleDetection } from '../../../src/security/stale-detection.js';

describe('StaleDetection', () => {
  it('detects element detached from body', () => {
    const el = document.createElement('div');
    expect(StaleDetection.isStale(el)).toBe(true);

    document.body.appendChild(el);
    expect(StaleDetection.isStale(el)).toBe(false);

    document.body.removeChild(el);
    expect(StaleDetection.isStale(el)).toBe(true);
  });

  it('detects attribute changes for inputs', () => {
    const el = document.createElement('input');
    expect(StaleDetection.hasAttributeChanges(el)).toBe(false);

    el.readOnly = true;
    expect(StaleDetection.hasAttributeChanges(el)).toBe(true);

    el.readOnly = false;
    el.disabled = true;
    expect(StaleDetection.hasAttributeChanges(el)).toBe(true);
  });
});
