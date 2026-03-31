import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { ContenteditableAdapter } from '../../../src/adapters/contenteditable-adapter.js'
import { createTargetHandle } from '../../../src/adapters/types.js'

describe('Adapter Security (BBOARD-65)', () => {
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

  it('prevents XSS injection by treating input as raw text', () => {
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
    
    const adapter = new ContenteditableAdapter(createTargetHandle('sec1'), el)
    const maliciousInput = '<img src=x onerror=alert(1)>'
    adapter.applyOperation({ type: 'insert', text: maliciousInput })
    
    // Ensure the raw HTML string is visible, but not interpreted as an element
    expect(el.innerHTML).not.toContain('<img')
    expect(el.textContent).toContain(maliciousInput)
    
    document.body.removeChild(el)
  })
})
