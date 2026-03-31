export type ValidationReason = 'stale' | 'readonly' | 'disabled' | 'unsupported' | null

export interface ValidationResult {
  isValid: boolean
  reason: ValidationReason
}

export const TargetValidator = {
  validate(element: HTMLElement): ValidationResult {
    if (!document.body.contains(element)) {
      return { isValid: false, reason: 'stale' }
    }

    if (element instanceof HTMLInputElement || element instanceof HTMLTextAreaElement) {
      if (element.disabled) return { isValid: false, reason: 'disabled' }
      if (element.readOnly) return { isValid: false, reason: 'readonly' }
      return { isValid: true, reason: null }
    }

    if (element.isContentEditable) {
      return { isValid: true, reason: null }
    }

    return { isValid: false, reason: 'unsupported' }
  }
}
