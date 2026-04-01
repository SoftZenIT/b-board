import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { ContenteditableAdapter } from './contenteditable-adapter.js'
import { createTargetHandle } from './types.js'

describe('ContenteditableAdapter', () => {
  let originalExecCommand: typeof document.execCommand

  beforeEach(() => {
    originalExecCommand = document.execCommand
    // Mock execCommand since JSDOM doesn't implement it fully
    document.execCommand = vi.fn((commandId: string, _showUI?: boolean, value?: string) => {
      if (commandId === 'insertText' && value) {
        const selection = window.getSelection()
        if (selection && selection.rangeCount > 0) {
          const range = selection.getRangeAt(0)
          range.insertNode(document.createTextNode(value))
        }
      }
      return true
    }) as typeof document.execCommand
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

  it('deletes text correctly from contenteditable element', () => {
    const el = document.createElement('div')
    el.contentEditable = 'true'
    el.textContent = 'hello'
    document.body.appendChild(el)
    el.focus()

    const adapter = new ContenteditableAdapter(createTargetHandle('test'), el)
    adapter.applyOperation({ type: 'delete', length: 2 })

    expect(document.execCommand).toHaveBeenCalledWith('delete', false)
    expect(document.execCommand).toHaveBeenCalledTimes(2)

    document.body.removeChild(el)
  })

  it('replaces text correctly in contenteditable element', () => {
    const el = document.createElement('div')
    el.contentEditable = 'true'
    document.body.appendChild(el)
    el.focus()

    const adapter = new ContenteditableAdapter(createTargetHandle('test'), el)
    adapter.applyOperation({
      type: 'replace',
      text: 'new text',
      selection: { position: 0, length: 0, direction: 'none' }
    })

    expect(document.execCommand).toHaveBeenCalledWith('insertText', false, 'new text')

    document.body.removeChild(el)
  })

  it('getSelection returns null if no selection exists', () => {
    const el = document.createElement('div')
    const adapter = new ContenteditableAdapter(createTargetHandle('test'), el)
    
    // Mock document.getSelection to return null
    const spy = vi.spyOn(document, 'getSelection').mockReturnValue(null)
    expect(adapter.getSelection()).toBeNull()
    spy.mockRestore()
  })

  it('returns failure result on error in applyOperation', () => {
    const el = document.createElement('div')
    const adapter = new ContenteditableAdapter(createTargetHandle('test'), el)
    
    // Force error by making focus throw
    el.focus = () => { throw new Error('focus failed') }
    
    const res = adapter.applyOperation({ type: 'insert', text: 'X' })
    expect(res.success).toBe(false)
    expect(res.error?.code).toBe('OP_FAILED')
  })
})
