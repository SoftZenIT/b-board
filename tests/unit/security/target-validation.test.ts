import { describe, it, expect } from 'vitest';
import { TargetValidation } from '../../../src/security/target-validation.js';

describe('TargetValidation', () => {
  it('rejects stale elements not in document', () => {
    const el = document.createElement('input');
    const result = TargetValidation.validate(el);
    expect(result.isValid).toBe(false);
    expect(result.reason).toBe('stale');
  });

  it('rejects readonly elements', () => {
    const el = document.createElement('input');
    el.readOnly = true;
    document.body.appendChild(el);
    const result = TargetValidation.validate(el);
    expect(result.isValid).toBe(false);
    expect(result.reason).toBe('readonly');
    document.body.removeChild(el);
  });

  it('rejects disabled elements', () => {
    const el = document.createElement('input');
    el.disabled = true;
    document.body.appendChild(el);
    const result = TargetValidation.validate(el);
    expect(result.isValid).toBe(false);
    expect(result.reason).toBe('disabled');
    document.body.removeChild(el);
  });

  it('accepts valid input elements', () => {
    const el = document.createElement('input');
    document.body.appendChild(el);
    const result = TargetValidation.validate(el);
    expect(result.isValid).toBe(true);
    document.body.removeChild(el);
  });

  it('accepts contenteditable elements', () => {
    const el = document.createElement('div');
    // In JSDOM, we need to define isContentEditable if it doesn't behave as expected
    Object.defineProperty(el, 'isContentEditable', { value: true, configurable: true });
    document.body.appendChild(el);
    const result = TargetValidation.validate(el);
    expect(result.isValid).toBe(true);
    document.body.removeChild(el);
  });
});
