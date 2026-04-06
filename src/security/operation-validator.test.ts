import { describe, it, expect } from 'vitest';
import { OperationValidator } from './operation-validator.js';
import type { InputOperation } from '../adapters/types.js';

describe('OperationValidator.validate', () => {
  it('throws when operation is falsy', () => {
    expect(() => OperationValidator.validate(null as unknown as InputOperation)).toThrow(
      'Operation is required'
    );
  });

  describe('insert', () => {
    it('accepts a valid insert operation', () => {
      expect(() => OperationValidator.validate({ type: 'insert', text: 'hello' })).not.toThrow();
    });

    it('throws when text is not a string', () => {
      expect(() =>
        OperationValidator.validate({ type: 'insert', text: 42 } as unknown as InputOperation)
      ).toThrow('Insert operation requires a string text');
    });
  });

  describe('delete', () => {
    it('accepts a valid delete operation', () => {
      expect(() => OperationValidator.validate({ type: 'delete', length: 3 })).not.toThrow();
    });

    it('throws when length is negative', () => {
      expect(() => OperationValidator.validate({ type: 'delete', length: -1 })).toThrow(
        'Delete operation requires a non-negative length'
      );
    });

    it('throws when length is not a number', () => {
      expect(() =>
        OperationValidator.validate({
          type: 'delete',
          length: 'oops',
        } as unknown as InputOperation)
      ).toThrow('Delete operation requires a non-negative length');
    });
  });

  describe('replace', () => {
    it('accepts a valid replace operation', () => {
      expect(() =>
        OperationValidator.validate({
          type: 'replace',
          text: 'new',
          selection: { position: 0, length: 3, direction: 'forward' },
        })
      ).not.toThrow();
    });

    it('throws when text is not a string', () => {
      expect(() =>
        OperationValidator.validate({
          type: 'replace',
          text: 5,
          selection: { position: 0, length: 0, direction: 'none' },
        } as unknown as InputOperation)
      ).toThrow('Replace operation requires a string text');
    });

    it('throws when selection is missing', () => {
      expect(() =>
        OperationValidator.validate({ type: 'replace', text: 'hi' } as unknown as InputOperation)
      ).toThrow('Replace operation requires a valid selection position');
    });

    it('throws when selection position is negative', () => {
      expect(() =>
        OperationValidator.validate({
          type: 'replace',
          text: 'hi',
          selection: { position: -1, length: 0, direction: 'none' },
        } as unknown as InputOperation)
      ).toThrow('Replace operation requires a valid selection position');
    });
  });

  it('throws for an unsupported operation type', () => {
    expect(() =>
      OperationValidator.validate({ type: 'unknown' } as unknown as InputOperation)
    ).toThrow('Unsupported operation type: unknown');
  });
});
