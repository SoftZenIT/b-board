import { describe, it, expect, vi } from 'vitest';
import { DataLayerImpl } from '../../src/data/data-layer.js';

describe('DataLayer', () => {
  it('should abstract data loading and validation', async () => {
    const layer = new DataLayerImpl();
    expect(layer.loadLanguageProfile).toBeDefined();
    expect(layer.loadLayoutShape).toBeDefined();
  });
});
