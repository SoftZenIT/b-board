import { BaseAdapter } from '../src/adapters/base-adapter.js'
import { TargetHandle, InputOperation, OperationResult, NormalizedSelection } from '../src/adapters/types.js'

/**
 * Example implementation of a B-Board adapter for the Quill editor.
 * Note: This assumes Quill is available in the environment.
 */
export class QuillAdapter extends BaseAdapter {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  constructor(handle: TargetHandle, private quill: any) {
    // quill.root is the contenteditable element
    super(handle, quill.root)
  }

  getSelection(): NormalizedSelection | null {
    const range = this.quill.getSelection()
    if (!range) return null
    return {
      position: range.index,
      length: range.length,
      direction: 'none'
    }
  }

  applyOperation(operation: InputOperation): OperationResult {
    try {
      const range = this.quill.getSelection(true) // focus if needed
      
      if (operation.type === 'insert') {
        this.quill.insertText(range.index, operation.text, 'user')
        this.quill.setSelection(range.index + operation.text.length, 0, 'user')
      } else if (operation.type === 'delete') {
        const start = Math.max(0, range.index - operation.length)
        this.quill.deleteText(start, operation.length, 'user')
      } else if (operation.type === 'replace') {
        this.quill.deleteText(operation.selection.position, operation.selection.length, 'user')
        this.quill.insertText(operation.selection.position, operation.text, 'user')
      }

      return { 
        success: true, 
        selectionAfter: this.getSelection() ?? undefined 
      }
    } catch (e) {
      return { 
        success: false, 
        error: { code: 'QUILL_ERROR', message: String(e) } 
      }
    }
  }
}
