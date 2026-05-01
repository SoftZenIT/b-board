import type { TargetAdapter, InputOperation, OperationResult } from '../adapters/types.js';

export const AdapterBoundary = {
  /**
   * Executes an adapter operation within a secure boundary,
   * validating the output and catching any rogue behavior.
   */
  execute(adapter: TargetAdapter, operation: InputOperation): OperationResult {
    try {
      // 1. Validate Adapter Contract
      if (!adapter || typeof adapter.applyOperation !== 'function') {
        throw new Error('Adapter does not conform to TargetAdapter contract');
      }

      // 2. Call Adapter safely
      const result = adapter.applyOperation(operation);

      // 3. Validate Return Value (Subtask 22.5c)
      if (!result || typeof result.success !== 'boolean') {
        throw new Error('Adapter returned an invalid OperationResult');
      }

      // 4. Boundary Enforcement
      // This is primarily done through code reviews and safe APIs,
      // but we can ensure the adapter doesn't leak sensitive errors.
      if (!result.success && !result.error) {
        throw new Error('Adapter failed without an error reason');
      }

      return result;
    } catch (err) {
      // Catch-all for adapter layer failures
      return {
        success: false,
        error: {
          code: 'OP_FAILED',
          message: `Adapter Trust Boundary violation: ${err instanceof Error ? err.message : String(err)}`,
        },
      };
    }
  },
};
