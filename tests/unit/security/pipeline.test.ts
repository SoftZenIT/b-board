import { describe, it, expect, vi } from 'vitest';
import { InsertionPipeline } from '../../../src/security/insertion-pipeline.js';
import { createTargetHandle } from '../../../src/adapters/types.js';

describe('InsertionPipeline', () => {
  const mockAdapter = {
    handle: createTargetHandle('test-handle'),
    element: document.createElement('input'),
    getSelection: vi.fn(),
    applyOperation: vi.fn().mockReturnValue({ success: true }),
    focus: vi.fn(),
    blur: vi.fn(),
  };

  it('rejects invalid target', () => {
    const el = document.createElement('input');
    el.disabled = true;
    const adapter = { ...mockAdapter, element: el };
    const result = InsertionPipeline.execute(adapter, { type: 'insert', text: 'test' });
    expect(result.success).toBe(false);
    expect(result.error?.code).toBe('INVALID_TARGET');
  });

  it('rejects operation with control characters', () => {
    document.body.appendChild(mockAdapter.element);
    const result = InsertionPipeline.execute(mockAdapter, { type: 'insert', text: 'test\x00' });
    expect(result.success).toBe(false);
    expect(result.error?.message).toContain('control characters');
    document.body.removeChild(mockAdapter.element);
  });

  it('executes valid operation', () => {
    document.body.appendChild(mockAdapter.element);
    const result = InsertionPipeline.execute(mockAdapter, { type: 'insert', text: 'safe text' });
    expect(result.success).toBe(true);
    expect(mockAdapter.applyOperation).toHaveBeenCalled();
    document.body.removeChild(mockAdapter.element);
  });
});
