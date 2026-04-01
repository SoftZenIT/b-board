import { BaseAdapter } from './base-adapter.js'
import type { TargetHandle } from './types.js'

export class TextareaAdapter extends BaseAdapter {
  declare public readonly element: HTMLTextAreaElement

  constructor(handle: TargetHandle, element: HTMLTextAreaElement) {
    super(handle, element)
  }
}
