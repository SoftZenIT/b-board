import type { TargetAdapter, InputOperation, OperationResult } from '../adapters/types.js';
import { TargetValidation } from './target-validation.js';
import { OperationValidator } from './operation-validator.js';
import { OutputValidator } from './output-validator.js';
import { StaleDetection } from './stale-detection.js';
import { AdapterBoundary } from './adapter-boundary.js';

export const InsertionPipeline = {
  execute(adapter: TargetAdapter, operation: InputOperation): OperationResult {
    try {
      // 1. Target Validation & Stale Detection
      const targetValidation = TargetValidation.validate(adapter.element);
      if (!targetValidation.isValid) {
        return {
          success: false,
          error: {
            code: 'INVALID_TARGET',
            message: `Target validation failed: ${targetValidation.reason}`,
          },
        };
      }

      if (StaleDetection.isStale(adapter.element)) {
        return {
          success: false,
          error: { code: 'INVALID_TARGET', message: 'Target is stale or detached from DOM' },
        };
      }

      // 2. Operation Validation
      OperationValidator.validate(operation);

      // 3. Output Validation
      if (operation.type === 'insert' || operation.type === 'replace') {
        OutputValidator.validate(operation.text);
      }

      // 4. Adapter Execution via Trust Boundary
      return AdapterBoundary.execute(adapter, operation);
    } catch (err) {
      return {
        success: false,
        error: { code: 'OP_FAILED', message: err instanceof Error ? err.message : String(err) },
      };
    }
  },
};
