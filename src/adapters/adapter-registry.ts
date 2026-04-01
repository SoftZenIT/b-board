import type { TargetAdapter, TargetHandle } from './types.js';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type AdapterConstructor = new (handle: TargetHandle, element: any) => TargetAdapter;

export class AdapterRegistry {
  private adapters = new Map<string, AdapterConstructor>();

  register(type: string, adapterClass: AdapterConstructor): void {
    this.adapters.set(type, adapterClass);
  }

  get(type: string): AdapterConstructor | undefined {
    return this.adapters.get(type);
  }
}
