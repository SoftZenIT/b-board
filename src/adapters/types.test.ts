import { describe, it, expect, assertType } from 'vitest'
import { createTargetHandle, isTargetHandle } from './types.js'
import type { TargetHandle } from './types.js'

describe('Adapter Types', () => {
  it('creates and validates a TargetHandle brand', () => {
    const handle = createTargetHandle('host-id-1')
    expect(isTargetHandle(handle)).toBe(true)
    
    // Type checking: it acts as a brand at compile time
    assertType<TargetHandle>(handle)
    
    // At runtime, it's just a string, so a raw string also passes the guard
    expect(isTargetHandle('random')).toBe(true)
  })
})
