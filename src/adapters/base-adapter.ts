import type { TargetAdapter, TargetHandle, NormalizedSelection, InputOperation, OperationResult } from './types.js'

export abstract class BaseAdapter implements TargetAdapter {
  constructor(
    public readonly handle: TargetHandle,
    protected readonly element: HTMLElement
  ) {}

  abstract getSelection(): NormalizedSelection | null
  abstract applyOperation(operation: InputOperation): OperationResult

  focus(): void {
    this.element.focus()
  }

  blur(): void {
    this.element.blur()
  }
}
