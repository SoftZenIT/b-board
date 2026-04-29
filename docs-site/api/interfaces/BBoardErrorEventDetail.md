[**b-board**](../README.md)

---

[b-board](../README.md) / BBoardErrorEventDetail

# Interface: BBoardErrorEventDetail

Defined in: [public/events.types.ts:22](https://github.com/SoftZenIT/b-board/blob/c22afb247f8482392c5e7a60d8facd4174dd8352/src/public/events.types.ts#L22)

Payload for the `bboard-error` custom event.

## Properties

### cause?

> `readonly` `optional` **cause?**: `Error`

Defined in: [public/events.types.ts:27](https://github.com/SoftZenIT/b-board/blob/c22afb247f8482392c5e7a60d8facd4174dd8352/src/public/events.types.ts#L27)

---

### code

> `readonly` **code**: [`ErrorCode`](../enumerations/ErrorCode.md)

Defined in: [public/events.types.ts:23](https://github.com/SoftZenIT/b-board/blob/c22afb247f8482392c5e7a60d8facd4174dd8352/src/public/events.types.ts#L23)

---

### message

> `readonly` **message**: `string`

Defined in: [public/events.types.ts:25](https://github.com/SoftZenIT/b-board/blob/c22afb247f8482392c5e7a60d8facd4174dd8352/src/public/events.types.ts#L25)

---

### recoverySuggestion

> `readonly` **recoverySuggestion**: `string`

Defined in: [public/events.types.ts:26](https://github.com/SoftZenIT/b-board/blob/c22afb247f8482392c5e7a60d8facd4174dd8352/src/public/events.types.ts#L26)

---

### severity

> `readonly` **severity**: `"recoverable"` \| `"fatal"` \| `"unknown"`

Defined in: [public/events.types.ts:24](https://github.com/SoftZenIT/b-board/blob/c22afb247f8482392c5e7a60d8facd4174dd8352/src/public/events.types.ts#L24)
