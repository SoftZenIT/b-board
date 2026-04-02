import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { OperationDispatcher } from '@/adapters/dispatcher.js';
import { ContenteditableAdapter } from '@/adapters/contenteditable-adapter.js';
import { InputElementAdapter } from '@/adapters/input-adapter.js';
import { createTargetHandle } from '@/adapters/types.js';

describe('Security Integration: Adapter Boundary', () => {
  let originalExecCommand: typeof document.execCommand;

  beforeEach(() => {
    originalExecCommand = document.execCommand;
    document.execCommand = vi.fn((commandId: string, _showUI?: boolean, value?: string) => {
      if (commandId === 'insertText' && value) {
        const selection = window.getSelection();
        if (selection && selection.rangeCount > 0) {
          const range = selection.getRangeAt(0);
          range.insertNode(document.createTextNode(value));
        }
      }
      return true;
    }) as typeof document.execCommand;
  });

  afterEach(() => {
    document.execCommand = originalExecCommand;
  });

  it('Pipeline blocks XSS injection across contenteditable targets', () => {
    const el = document.createElement('div');
    el.contentEditable = 'true';
    Object.defineProperty(el, 'isContentEditable', { value: true });
    document.body.appendChild(el);
    el.focus();

    // Setup selection for JSDOM
    const selection = window.getSelection();
    const range = document.createRange();
    range.selectNodeContents(el);
    range.collapse(true);
    selection?.removeAllRanges();
    selection?.addRange(range);

    const dispatcher = new OperationDispatcher();
    const handle = createTargetHandle('sec-target');
    dispatcher.registerAdapter(new ContenteditableAdapter(handle, el));

    const maliciousPayload = '<script>alert("xss")</script><img src="x" onerror="alert(1)">';

    // Dispatch through the pipeline (using text property for adapter InputOperation)
    const result = dispatcher.dispatch(handle, { type: 'insert', text: maliciousPayload });

    expect(result.success).toBe(true);
    // Ensure the raw string is present as text, but no script or img tags were rendered
    expect(el.innerHTML).not.toContain('<script>');
    expect(el.innerHTML).not.toContain('<img');
    expect(el.textContent).toContain(maliciousPayload);

    document.body.removeChild(el);
  });

  it('Pipeline rejects operations if target becomes readonly mid-flight', () => {
    const el = document.createElement('input');
    document.body.appendChild(el);

    const dispatcher = new OperationDispatcher();
    const handle = createTargetHandle('sec-target-2');
    dispatcher.registerAdapter(new InputElementAdapter(handle, el));

    // Make readonly right before dispatch
    el.readOnly = true;

    const result = dispatcher.dispatch(handle, { type: 'insert', text: 'safe' });

    expect(result.success).toBe(false);
    expect(result.error?.message).toContain('readonly');
    expect(el.value).toBe(''); // Mutation prevented

    document.body.removeChild(el);
  });
});
