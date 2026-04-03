import { describe, it, expect, vi } from 'vitest';
import { AdapterBoundary } from '../../../src/security/adapter-boundary.js';

describe('AdapterBoundary', () => {
  it('rejects invalid adapter contract', () => {
    const badAdapter = {} as any;
    const result = AdapterBoundary.execute(badAdapter, { type: 'insert', text: 'x' });
    expect(result.success).toBe(false);
    expect(result.error?.message).toContain('contract');
  });

  it('validates successful adapter return value', () => {
    const mockAdapter = {
      applyOperation: vi.fn().mockReturnValue({ success: true }),
    } as any;
    const result = AdapterBoundary.execute(mockAdapter, { type: 'insert', text: 'x' });
    expect(result.success).toBe(true);
  });

  it('rejects invalid return value shape', () => {
    const mockAdapter = {
      applyOperation: vi.fn().mockReturnValue({ notSuccess: true }),
    } as any;
    const result = AdapterBoundary.execute(mockAdapter, { type: 'insert', text: 'x' });
    expect(result.success).toBe(false);
    expect(result.error?.message).toContain('invalid OperationResult');
  });

  it('catches adapter runtime errors', () => {
    const mockAdapter = {
      applyOperation: vi.fn().mockImplementation(() => {
        throw new Error('Boom');
      }),
    } as any;
    const result = AdapterBoundary.execute(mockAdapter, { type: 'insert', text: 'x' });
    expect(result.success).toBe(false);
    expect(result.error?.message).toContain('Adapter Trust Boundary violation');
    expect(result.error?.message).toContain('Boom');
  });
});
