import { BaseAdapter } from './base-adapter.js';
import type {
  NormalizedSelection,
  InputOperation,
  OperationResult,
  TargetHandle,
} from './types.js';

export class ContenteditableAdapter extends BaseAdapter {
  constructor(handle: TargetHandle, element: HTMLElement) {
    super(handle, element);
  }

  getSelection(): NormalizedSelection | null {
    const selection = document.getSelection();
    if (!selection || selection.rangeCount === 0) return null;
    // Fallback naive implementation for demo; complete DOM mapping is complex
    return {
      position: selection.anchorOffset,
      length: Math.abs(selection.focusOffset - selection.anchorOffset),
      direction: 'forward',
    };
  }

  applyOperation(operation: InputOperation): OperationResult {
    // SECURITY: Use document.execCommand('insertText') to let browser handle
    // safe DOM insertion without risking innerHTML XSS injection.
    try {
      this.focus();
      if (operation.type === 'insert') {
        document.execCommand('insertText', false, operation.text);
      } else if (operation.type === 'delete') {
        for (let i = 0; i < operation.length; i++) {
          document.execCommand('delete', false);
        }
      } else if (operation.type === 'replace') {
        // Highly simplified: assume selection is active
        document.execCommand('insertText', false, operation.text);
      }
      return { success: true, selectionAfter: this.getSelection() ?? undefined };
    } catch (e) {
      return { success: false, error: { code: 'OP_FAILED', message: String(e) } };
    }
  }
}
