import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { ContenteditableAdapter } from './contenteditable-adapter.js'
import { createTargetHandle } from './types.js'

describe('ContenteditableAdapter', () => {
  let originalExecCommand: typeof document.execCommand

  beforeEach(() => {
    originalExecCommand = document.execCommand
    // Mock execCommand since JSDOM doesn't implement it fully
    document.execCommand = vi.fn((commandId: string, showUI?: boolean, value?: string) => {
      if (commandId === 'insertText' && value) {
        const selection = window.getSelection()
        if (selection && selection.rangeCount > 0) {
          const range = selection.getRangeAt(0)
          range.insertNode(document.createTextNode(value))
        }
      }
      return true
    }) as any
  })

  afterEach(() => {
    document.execCommand = originalExecCommand
  })

  it('inserts text correctly into contenteditable element', () => {
    const el = document.createElement('div')
    el.contentEditable = 'true'
    document.body.appendChild(el)
    el.focus()
    
    // In JSDOM, focusing doesn't automatically create a selection range, so we create one manually
    const selection = window.getSelection()
    const range = document.createRange()
    range.selectNodeContents(el)
    range.collapse(true)
    selection?.removeAllRanges()
    selection?.addRange(range)
    
    const adapter = new ContenteditableAdapter(createTargetHandle('test'), el)
    adapter.applyOperation({ type: 'insert', text: 'safe text' })
    
    expect(el.textContent).toContain('safe text')
    expect(document.execCommand).toHaveBeenCalledWith('insertText', false, 'safe text')
    
    document.body.removeChild(el)
  })
})
