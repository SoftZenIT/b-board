[**b-board**](../README.md)

---

[b-board](../README.md) / TargetAdapter

# Interface: TargetAdapter

Defined in: [adapters/types.ts:56](https://github.com/SoftZenIT/b-board/blob/fbde7c09877b4cf77622343e6f26b0c36b001484/src/adapters/types.ts#L56)

## Methods

### applyOperation()

> **applyOperation**(`operation`): [`OperationResult`](OperationResult.md)

Defined in: [adapters/types.ts:61](https://github.com/SoftZenIT/b-board/blob/fbde7c09877b4cf77622343e6f26b0c36b001484/src/adapters/types.ts#L61)

#### Parameters

##### operation

[`InputOperation`](../type-aliases/InputOperation.md)

#### Returns

[`OperationResult`](OperationResult.md)

---

### blur()

> **blur**(): `void`

Defined in: [adapters/types.ts:63](https://github.com/SoftZenIT/b-board/blob/fbde7c09877b4cf77622343e6f26b0c36b001484/src/adapters/types.ts#L63)

#### Returns

`void`

---

### focus()

> **focus**(): `void`

Defined in: [adapters/types.ts:62](https://github.com/SoftZenIT/b-board/blob/fbde7c09877b4cf77622343e6f26b0c36b001484/src/adapters/types.ts#L62)

#### Returns

`void`

---

### getSelection()

> **getSelection**(): [`NormalizedSelection`](NormalizedSelection.md) \| `null`

Defined in: [adapters/types.ts:60](https://github.com/SoftZenIT/b-board/blob/fbde7c09877b4cf77622343e6f26b0c36b001484/src/adapters/types.ts#L60)

#### Returns

[`NormalizedSelection`](NormalizedSelection.md) \| `null`

## Properties

### element

> `readonly` **element**: `HTMLElement`

Defined in: [adapters/types.ts:59](https://github.com/SoftZenIT/b-board/blob/fbde7c09877b4cf77622343e6f26b0c36b001484/src/adapters/types.ts#L59)

The underlying DOM element. Exposed for validation purposes.

---

### handle

> `readonly` **handle**: [`TargetHandle`](../type-aliases/TargetHandle.md)

Defined in: [adapters/types.ts:57](https://github.com/SoftZenIT/b-board/blob/fbde7c09877b4cf77622343e6f26b0c36b001484/src/adapters/types.ts#L57)
