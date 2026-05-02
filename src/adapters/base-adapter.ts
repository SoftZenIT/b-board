import type {
  TargetAdapter,
  TargetHandle,
  NormalizedSelection,
  InputOperation,
  OperationResult,
} from './types.js';

/** HTMLInputElement and HTMLTextAreaElement share the same selection API. */
type TextSelectionElement = HTMLInputElement | HTMLTextAreaElement;

export abstract class BaseAdapter implements TargetAdapter {
  constructor(
    public readonly handle: TargetHandle,
    public readonly element: HTMLElement
  ) {}

  getSelection(): NormalizedSelection | null {
    const el = this.element as TextSelectionElement;
    // Elements like <div> don't have selectionStart/End (they are undefined)
    if (el.selectionStart == null || el.selectionEnd == null) return null;
    return {
      position: el.selectionStart,
      length: el.selectionEnd - el.selectionStart,
      direction: el.selectionDirection === 'backward' ? 'backward' : 'forward',
    };
  }

  getWordLengthBeforeCursor(): number {
    const el = this.element as HTMLInputElement | HTMLTextAreaElement;
    const cursor = el.selectionStart;
    if (cursor == null || cursor === 0) return 1;
    const before = el.value.slice(0, cursor);
    const trimmed = before.trimEnd();
    if (trimmed.length === 0) return before.length || 1;
    const lastSpace = Math.max(trimmed.lastIndexOf(' '), trimmed.lastIndexOf('\n'));
    const wordLen = trimmed.length - (lastSpace + 1);
    const trailingSpaces = before.length - trimmed.length;
    return Math.max(1, wordLen + trailingSpaces);
  }

  applyOperation(operation: InputOperation): OperationResult {
    try {
      const el = this.element as TextSelectionElement;
      const valueLength = el.value?.length ?? 0;
      const start = el.selectionStart ?? valueLength;
      const end = el.selectionEnd ?? valueLength;

      if (operation.type === 'insert') {
        el.setRangeText(operation.text, start, end, 'end');
      } else if (operation.type === 'delete') {
        const deleteStart = Math.max(0, start - operation.length);
        el.setRangeText('', deleteStart, end, 'end');
      } else if (operation.type === 'replace') {
        el.setRangeText(
          operation.text,
          operation.selection.position,
          operation.selection.position + operation.selection.length,
          'end'
        );
      }
      return { success: true, selectionAfter: this.getSelection() ?? undefined };
    } catch (e) {
      return { success: false, error: { code: 'OP_FAILED', message: String(e) } };
    }
  }

  focus(): void {
    this.element.focus();
  }

  blur(): void {
    this.element.blur();
  }
}
