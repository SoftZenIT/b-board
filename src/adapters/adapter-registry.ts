import type { TargetAdapter, TargetHandle } from './types.js';

/**
 * A constructor for a TargetAdapter.
 * Uses a generic for the element type to allow different host targets (DOM elements, editor instances).
 */
export type AdapterConstructor<T = unknown> = new (
  handle: TargetHandle,
  element: T
) => TargetAdapter;

/**
 * Registry for target adapters, allowing dynamic instantiation of adapters by type.
 */
export class AdapterRegistry {
  private readonly adapters = new Map<string, AdapterConstructor>();

  /**
   * Registers an adapter class for a given type string.
   */
  register<T>(type: string, adapterClass: AdapterConstructor<T>): void {
    // Cast to unknown to allow storing heterogeneous constructors in the map
    this.adapters.set(type, adapterClass as unknown as AdapterConstructor<unknown>);
  }

  /**
   * Retrieves an adapter constructor by type.
   */
  get<T = unknown>(type: string): AdapterConstructor<T> | undefined {
    return this.adapters.get(type) as AdapterConstructor<T> | undefined;
  }
}
