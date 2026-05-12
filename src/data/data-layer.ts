import type { LanguageProfile } from './language.types.js';
import type { LayoutShape } from './layout.types.js';
import { createDataLoader, type DataLoader } from './loader.js';
import { isLanguageId, isLayoutVariantId } from '../public/types.js';

/**
 * The public data-loading contract for language profiles and layout shapes.
 * Implement this interface to provide a custom data source.
 */
export interface DataLayer {
  /**
   * Loads a language profile by its {@link LanguageId}.
   * @throws if `id` is not a valid {@link LanguageId}
   */
  loadLanguageProfile(id: string): Promise<LanguageProfile>;
  /**
   * Loads a layout shape by its {@link LayoutVariantId}.
   * @throws if `id` is not a valid {@link LayoutVariantId}
   */
  loadLayoutShape(id: string): Promise<LayoutShape>;
}

/**
 * Default {@link DataLayer} implementation — loads JSON files from the package's
 * `data/` directory via fetch. Pass a custom `baseUrl` if hosting data files
 * on a CDN.
 * @example
 * ```ts
 * const data = new DataLayerImpl()
 * const profile = await data.loadLanguageProfile('yoruba')
 * ```
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
