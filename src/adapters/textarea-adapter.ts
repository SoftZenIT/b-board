import { BaseAdapter } from './base-adapter.js'
import type { NormalizedSelection, InputOperation, OperationResult, TargetHandle } from './types.js'

export class TextareaAdapter extends BaseAdapter {
  declare protected readonly element: HTMLTextAreaElement

  constructor(handle: TargetHandle, element: HTMLTextAreaElement) {
    super(handle, element)
  }

  getSelection(): NormalizedSelection | null {
    if (this.element.selectionStart === null || this.element.selectionEnd === null) return null
    return {
      position: this.element.selectionStart,
      length: this.element.selectionEnd - this.element.selectionStart,
      direction: this.element.selectionDirection === 'backward' ? 'backward' : 'forward'
    }
  }

  applyOperation(operation: InputOperation): OperationResult {
    const start = this.element.selectionStart ?? this.element.value.length
    const end = this.element.selectionEnd ?? this.element.value.length

    try {
      if (operation.type === 'insert') {
        this.element.setRangeText(operation.text, start, end, 'end')
      } else if (operation.type === 'delete') {
        const deleteStart = Math.max(0, start - operation.length)
        this.element.setRangeText('', deleteStart, end, 'end')
      } else if (operation.type === 'replace') {
        this.element.setRangeText(operation.text, operation.selection.position, operation.selection.position + operation.selection.length, 'end')
      }
      return { success: true, selectionAfter: this.getSelection() ?? undefined }
    } catch (e) {
      return { success: false, error: { code: 'OP_FAILED', message: String(e) } }
    }
  }
}
