import { describe, it, expect, vi } from 'vitest';
import { BaseAdapter } from './base-adapter.js';
import { createTargetHandle } from './types.js';

class DummyAdapter extends BaseAdapter {}

describe('BaseAdapter', () => {
  it('implements focus and blur', () => {
    const el = document.createElement('input');
    document.body.appendChild(el);
    el.focus = vi.fn();
    el.blur = vi.fn();

    const adapter = new DummyAdapter(createTargetHandle('test'), el);
    adapter.focus();
    expect(el.focus).toHaveBeenCalled();
    adapter.blur();
    expect(el.blur).toHaveBeenCalled();

    el.remove();
  });

  describe('getSelection', () => {
    it('returns normalized selection for input elements', () => {
      const el = document.createElement('input');
      el.value = 'hello';
      el.setSelectionRange(1, 3, 'forward');
      document.body.appendChild(el);

      const adapter = new DummyAdapter(createTargetHandle('test'), el);
      const sel = adapter.getSelection();

      expect(sel).toEqual({
        position: 1,
        length: 2,
        direction: 'forward',
      });

      el.remove();
    });

    it('returns backward selection direction correctly', () => {
      const el = document.createElement('input');
      el.value = 'hello';
      el.setSelectionRange(1, 3, 'backward');
      document.body.appendChild(el);

      const adapter = new DummyAdapter(createTargetHandle('test'), el);
      const sel = adapter.getSelection();
      expect(sel?.direction).toBe('backward');
      el.remove();
    });

    it('returns null if selection is not supported', () => {
      const el = document.createElement('div');
      const adapter = new DummyAdapter(createTargetHandle('test'), el);
      expect(adapter.getSelection()).toBeNull();
    });
  });

  describe('applyOperation', () => {
    it('handles insert operation', () => {
      const el = document.createElement('input');
      el.value = 'abc';
      el.setSelectionRange(1, 1);
      document.body.appendChild(el);

      const adapter = new DummyAdapter(createTargetHandle('test'), el);
      const res = adapter.applyOperation({ type: 'insert', text: 'X' });

      expect(res.success).toBe(true);
      expect(el.value).toBe('aXbc');
      el.remove();
    });

    it('handles delete operation', () => {
      const el = document.createElement('input');
      el.value = 'abc';
      el.setSelectionRange(2, 2);
      document.body.appendChild(el);

      const adapter = new DummyAdapter(createTargetHandle('test'), el);
      const res = adapter.applyOperation({ type: 'delete', length: 1 });

      expect(res.success).toBe(true);
      expect(el.value).toBe('ac');
      el.remove();
    });

    it('handles replace operation', () => {
      const el = document.createElement('input');
      el.value = 'abcde';
      document.body.appendChild(el);

      const adapter = new DummyAdapter(createTargetHandle('test'), el);
      const res = adapter.applyOperation({
        type: 'replace',
        text: 'XYZ',
        selection: { position: 1, length: 3, direction: 'none' },
      });

      expect(res.success).toBe(true);
      expect(el.value).toBe('aXYZe');
      el.remove();
    });

    it('defaults to end of text if selection is null', () => {
      const el = document.createElement('input');
      el.value = 'abc';
      const adapter = new DummyAdapter(createTargetHandle('test'), el);

      // Force selectionStart/End to null for this test
      Object.defineProperty(el, 'selectionStart', { value: null, configurable: true });
      Object.defineProperty(el, 'selectionEnd', { value: null, configurable: true });

      const res = adapter.applyOperation({ type: 'insert', text: 'X' });
      expect(res.success).toBe(true);
      expect(el.value).toBe('abcX');
    });

    it('returns failure result on error', () => {
      const el = document.createElement('input');
      const adapter = new DummyAdapter(createTargetHandle('test'), el);
      // Force error by passing null as element (simulated)
      // @ts-expect-error - testing error handling
      adapter.element = null;
      const res = adapter.applyOperation({ type: 'insert', text: 'X' });
      expect(res.success).toBe(false);
      expect(res.error?.code).toBe('OP_FAILED');
    });
  });
});
