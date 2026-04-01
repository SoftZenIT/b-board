import { describe, it, expect } from 'vitest';
import { InputElementAdapter } from './input-adapter.js';
import { createTargetHandle } from './types.js';

describe('InputElementAdapter', () => {
  it('inserts text correctly', () => {
    const el = document.createElement('input');
    el.type = 'text';
    el.value = 'hello';
    el.setSelectionRange(5, 5);

    const adapter = new InputElementAdapter(createTargetHandle('test'), el);
    adapter.applyOperation({ type: 'insert', text: ' world' });

    expect(el.value).toBe('hello world');
  });
});
