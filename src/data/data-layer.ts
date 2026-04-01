import type { LanguageProfile } from './language.types.js';
import type { LayoutShape } from './layout.types.js';

export interface DataLayer {
  loadLanguageProfile(id: string): Promise<LanguageProfile>;
  loadLayoutShape(id: string): Promise<LayoutShape>;
}

export class DataLayerImpl implements DataLayer {
  async loadLanguageProfile(id: string): Promise<LanguageProfile> {
    void id;
    throw new Error("Not implemented");
  }
  async loadLayoutShape(id: string): Promise<LayoutShape> {
    void id;
    throw new Error("Not implemented");
  }
}
