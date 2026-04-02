import type { LanguageProfile } from './language.types.js';
import type { LayoutShape } from './layout.types.js';
import { createDataLoader, type DataLoader } from './loader.js';
import { isLanguageId, isLayoutVariantId } from '../public/types.js';

export interface DataLayer {
  loadLanguageProfile(id: string): Promise<LanguageProfile>;
  loadLayoutShape(id: string): Promise<LayoutShape>;
}

/**
 * Implementation of the DataLayer that delegates to the specialized DataLoader.
 * Handles ID validation before loading.
 */
export class DataLayerImpl implements DataLayer {
  private loader: DataLoader;

  constructor(baseUrl?: string) {
    this.loader = createDataLoader({ baseUrl });
  }

  async loadLanguageProfile(id: string): Promise<LanguageProfile> {
    if (!isLanguageId(id)) {
      throw new Error(`[DataLayer] Invalid language ID: '${id}'`);
    }
    return this.loader.loadLanguageProfile(id);
  }

  async loadLayoutShape(id: string): Promise<LayoutShape> {
    if (!isLayoutVariantId(id)) {
      throw new Error(`[DataLayer] Invalid layout variant ID: '${id}'`);
    }
    return this.loader.loadLayoutShape(id);
  }
}
