declare const __targetHandleBrand: unique symbol

/** Opaque reference to a host element. */
export type TargetHandle = string & { readonly [__targetHandleBrand]: void }

export function createTargetHandle(raw: string): TargetHandle {
  return raw as TargetHandle
}

export function isTargetHandle(val: unknown): val is TargetHandle {
  return typeof val === 'string'
}

export interface NormalizedSelection {
  readonly position: number
  readonly length: number
  readonly direction: 'forward' | 'backward' | 'none'
}

export type OperationType = 'insert' | 'delete' | 'replace'

export interface BaseOperation {
  readonly type: OperationType
}

export interface InsertOperation extends BaseOperation {
  readonly type: 'insert'
  readonly text: string
}

export interface DeleteOperation extends BaseOperation {
  readonly type: 'delete'
  readonly length: number
}

export interface ReplaceOperation extends BaseOperation {
  readonly type: 'replace'
  readonly text: string
  readonly selection: NormalizedSelection
}

export type InputOperation = InsertOperation | DeleteOperation | ReplaceOperation

export interface OperationResult {
  readonly success: boolean
  readonly selectionAfter?: NormalizedSelection
  readonly error?: {
    code: string
    message: string
  }
}

export interface TargetAdapter {
  readonly handle: TargetHandle
  getSelection(): NormalizedSelection | null
  applyOperation(operation: InputOperation): OperationResult
  focus(): void
  blur(): void
}
