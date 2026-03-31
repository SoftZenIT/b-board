import type { TargetHandle, TargetAdapter, InputOperation, OperationResult } from './types.js'
import { TargetValidator } from './target-validator.js'

export class OperationDispatcher {
  private adapters = new Map<TargetHandle, TargetAdapter>()

  registerAdapter(adapter: TargetAdapter): void {
    this.adapters.set(adapter.handle, adapter)
  }

  dispatch(handle: TargetHandle, operation: InputOperation): OperationResult {
    const adapter = this.adapters.get(handle)
    if (!adapter) {
      return { success: false, error: { code: 'ADAPTER_NOT_FOUND', message: 'No adapter for handle' } }
    }

    // Access the private element for validation. 
    // Cast to any to get around protected scope for structural validation.
    const element = (adapter as any).element as HTMLElement
    if (element) {
      const validation = TargetValidator.validate(element)
      if (!validation.isValid) {
        return { success: false, error: { code: 'INVALID_TARGET', message: `Validation failed: ${validation.reason}` } }
      }
    }

    return adapter.applyOperation(operation)
  }
}
