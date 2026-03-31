import { describe, it, expect } from 'vitest'
import { TargetValidator } from './target-validator.js'

describe('TargetValidator', () => {
  it('rejects stale elements not in document', () => {
    const el = document.createElement('input')
    const result = TargetValidator.validate(el)
    expect(result.isValid).toBe(false)
    expect(result.reason).toBe('stale')
  })

  it('rejects readonly elements', () => {
    const el = document.createElement('input')
    el.readOnly = true
    document.body.appendChild(el)
    const result = TargetValidator.validate(el)
    expect(result.isValid).toBe(false)
    expect(result.reason).toBe('readonly')
    document.body.removeChild(el)
  })

  it('accepts valid input elements', () => {
    const el = document.createElement('input')
    document.body.appendChild(el)
    const result = TargetValidator.validate(el)
    expect(result.isValid).toBe(true)
    document.body.removeChild(el)
  })
})
