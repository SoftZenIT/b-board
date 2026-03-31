import { describe, it, expect, vi } from 'vitest'
import { BaseAdapter } from './base-adapter.js'
import { createTargetHandle, type InputOperation } from './types.js'

class DummyAdapter extends BaseAdapter {
  getSelection() { return null }
  applyOperation(op: InputOperation) { return { success: true } }
}

describe('BaseAdapter', () => {
  it('implements focus and blur', () => {
    const el = document.createElement('input')
    document.body.appendChild(el)
    el.focus = vi.fn()
    el.blur = vi.fn()
    
    const adapter = new DummyAdapter(createTargetHandle('test'), el)
    adapter.focus()
    expect(el.focus).toHaveBeenCalled()
    adapter.blur()
    expect(el.blur).toHaveBeenCalled()
    
    document.body.removeChild(el)
  })
})
