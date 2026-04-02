import { describe, it, expect, vi } from 'vitest';
import { DataLayerImpl } from '../../src/data/data-layer.js';
import * as loaderModule from '../../src/data/loader.js';

describe('DataLayer', () => {
  it('should abstract data loading and validation', async () => {
    const layer = new DataLayerImpl();
    expect(layer.loadLanguageProfile).toBeDefined();
    expect(layer.loadLayoutShape).toBeDefined();
  });

  it('loadLanguageProfile validates ID and calls loader', async () => {
    const mockLoadLanguageProfile = vi.fn().mockResolvedValue({ id: 'yoruba' });
    vi.spyOn(loaderModule, 'createDataLoader').mockReturnValue({
      loadLanguageProfile: mockLoadLanguageProfile,
      loadLayoutShape: vi.fn(),
      loadRegistry: vi.fn(),
      loadCompositionRules: vi.fn(),
    });

    const layer = new DataLayerImpl();

    // Invalid ID
    await expect(layer.loadLanguageProfile('invalid')).rejects.toThrow(
      "[DataLayer] Invalid language ID: 'invalid'"
    );

    // Valid ID
    const result = await layer.loadLanguageProfile('yoruba');
    expect(mockLoadLanguageProfile).toHaveBeenCalledWith('yoruba');
    expect(result).toEqual({ id: 'yoruba' });
  });

  it('loadLayoutShape validates ID and calls loader', async () => {
    const mockLoadLayoutShape = vi.fn().mockResolvedValue({ id: 'desktop-azerty' });
    vi.spyOn(loaderModule, 'createDataLoader').mockReturnValue({
      loadLanguageProfile: vi.fn(),
      loadLayoutShape: mockLoadLayoutShape,
      loadRegistry: vi.fn(),
      loadCompositionRules: vi.fn(),
    });

    const layer = new DataLayerImpl();

    // Invalid ID
    await expect(layer.loadLayoutShape('invalid')).rejects.toThrow(
      "[DataLayer] Invalid layout variant ID: 'invalid'"
    );

    // Valid ID
    const result = await layer.loadLayoutShape('desktop-azerty');
    expect(mockLoadLayoutShape).toHaveBeenCalledWith('desktop-azerty');
    expect(result).toEqual({ id: 'desktop-azerty' });
  });
});
