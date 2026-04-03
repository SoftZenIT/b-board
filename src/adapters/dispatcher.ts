import type { TargetHandle, TargetAdapter, InputOperation, OperationResult } from './types.js';
import { InsertionPipeline } from '../security/insertion-pipeline.js';

export class OperationDispatcher {
  private adapters = new Map<TargetHandle, TargetAdapter>();

  registerAdapter(adapter: TargetAdapter): void {
    this.adapters.set(adapter.handle, adapter);
  }

  dispatch(handle: TargetHandle, operation: InputOperation): OperationResult {
    const adapter = this.adapters.get(handle);
    if (!adapter) {
      return {
        success: false,
        error: { code: 'ADAPTER_NOT_FOUND', message: 'No adapter for handle' },
      };
    }

    return InsertionPipeline.execute(adapter, operation);
  }
}
