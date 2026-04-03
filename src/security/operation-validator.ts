import type { InputOperation } from '../adapters/types.js';

export const OperationValidator = {
  validate(operation: InputOperation): void {
    if (!operation) {
      throw new Error('Operation is required');
    }

    switch (operation.type) {
      case 'insert':
        if (typeof operation.text !== 'string') {
          throw new Error('Insert operation requires a string text');
        }
        break;
      case 'delete':
        if (typeof operation.length !== 'number' || operation.length < 0) {
          throw new Error('Delete operation requires a non-negative length');
        }
        break;
      case 'replace':
        if (typeof operation.text !== 'string') {
          throw new Error('Replace operation requires a string text');
        }
        if (
          !operation.selection ||
          typeof operation.selection.position !== 'number' ||
          operation.selection.position < 0
        ) {
          throw new Error('Replace operation requires a valid selection position');
        }
        break;
      default:
        throw new Error(`Unsupported operation type: ${(operation as { type: string }).type}`);
    }
  },
};
