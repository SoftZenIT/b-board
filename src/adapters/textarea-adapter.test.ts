import { describe, it, expect } from 'vitest';
import { TextareaAdapter } from './textarea-adapter.js';
import { createTargetHandle } from './types.js';

describe('TextareaAdapter', () => {
  it('inserts text with newlines correctly', () => {
    const el = document.createElement('textarea');
    el.value = 'line1\n';
    el.setSelectionRange(6, 6);

    const adapter = new TextareaAdapter(createTargetHandle('test'), el);
    adapter.applyOperation({ type: 'insert', text: 'line2' });

    expect(el.value).toBe('line1\nline2');
  });
});
