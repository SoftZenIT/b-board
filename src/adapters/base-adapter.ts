import type { TargetAdapter, TargetHandle, NormalizedSelection, InputOperation, OperationResult } from './types.js'

/** HTMLInputElement and HTMLTextAreaElement share the same selection API. */
type TextSelectionElement = HTMLInputElement | HTMLTextAreaElement

export abstract class BaseAdapter implements TargetAdapter {
  constructor(
    public readonly handle: TargetHandle,
    public readonly element: HTMLElement
  ) {}

  getSelection(): NormalizedSelection | null {
    const el = this.element as TextSelectionElement
    if (el.selectionStart === null || el.selectionEnd === null) return null
    return {
      position: el.selectionStart,
      length: el.selectionEnd - el.selectionStart,
      direction: el.selectionDirection === 'backward' ? 'backward' : 'forward',
    }
  }

  applyOperation(operation: InputOperation): OperationResult {
    const el = this.element as TextSelectionElement
    const start = el.selectionStart ?? el.value.length
    const end = el.selectionEnd ?? el.value.length

    try {
      if (operation.type === 'insert') {
        el.setRangeText(operation.text, start, end, 'end')
      } else if (operation.type === 'delete') {
        const deleteStart = Math.max(0, start - operation.length)
        el.setRangeText('', deleteStart, end, 'end')
      } else if (operation.type === 'replace') {
        el.setRangeText(operation.text, operation.selection.position, operation.selection.position + operation.selection.length, 'end')
      }
      return { success: true, selectionAfter: this.getSelection() ?? undefined }
    } catch (e) {
      return { success: false, error: { code: 'OP_FAILED', message: String(e) } }
    }
  }

  focus(): void {
    this.element.focus()
  }

  blur(): void {
    this.element.blur()
  }
}
