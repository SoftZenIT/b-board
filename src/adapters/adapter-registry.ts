export class AdapterRegistry {
  private adapters = new Map<string, any>();

  register(type: string, adapterClass: any): void {
    this.adapters.set(type, adapterClass);
  }

  get(type: string): any {
    return this.adapters.get(type);
  }
}
