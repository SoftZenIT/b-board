import { describe, it, expect } from 'vitest'
import { OperationDispatcher } from './dispatcher.js'
import { createTargetHandle, type InputOperation } from './types.js'
import { InputElementAdapter } from './input-adapter.js'

describe('OperationDispatcher', () => {
  it('dispatches operation if target is valid', () => {
    const el = document.createElement('input')
    document.body.appendChild(el)
    
    const handle = createTargetHandle('id1')
    const adapter = new InputElementAdapter(handle, el)
    const dispatcher = new OperationDispatcher()
    
    dispatcher.registerAdapter(adapter)
    
    const result = dispatcher.dispatch(handle, { type: 'insert', text: 'x' })
    expect(result.success).toBe(true)
    expect(el.value).toBe('x')
    
    document.body.removeChild(el)
  })

  it('fails dispatch if target is stale/invalid', () => {
    const el = document.createElement('input')
    // not appended to body -> stale
    const handle = createTargetHandle('id2')
    const adapter = new InputElementAdapter(handle, el)
    const dispatcher = new OperationDispatcher()
    
    dispatcher.registerAdapter(adapter)
    const result = dispatcher.dispatch(handle, { type: 'insert', text: 'y' })
    
    expect(result.success).toBe(false)
    expect(result.error?.message).toContain('Validation failed')
  })
})
