import { BaseAdapter } from './base-adapter.js'
import type { TargetHandle } from './types.js'

export class InputElementAdapter extends BaseAdapter {
  declare public readonly element: HTMLInputElement

  constructor(handle: TargetHandle, element: HTMLInputElement) {
    super(handle, element)
  }
}
