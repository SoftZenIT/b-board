[**b-board**](../README.md)

---

[b-board](../README.md) / KeyboardEngine

# Interface: KeyboardEngine

Defined in: [core/engine.ts:45](https://github.com/SoftZenIT/b-board/blob/c22afb247f8482392c5e7a60d8facd4174dd8352/src/core/engine.ts#L45)

The keyboard engine facade — manages state, lifecycle events, and substates.
Create via [createKeyboardEngine](../functions/createKeyboardEngine.md).

## Example

```ts
const engine = createKeyboardEngine({ resolvedLayout });
engine.on('ready', ({ substates }) => console.log('ready', substates));
await engine.initialize();
engine.destroy();
```

## Methods

### destroy()

> **destroy**(): `void`

Defined in: [core/engine.ts:49](https://github.com/SoftZenIT/b-board/blob/c22afb247f8482392c5e7a60d8facd4174dd8352/src/core/engine.ts#L49)

Destroys the engine and cleans up all listeners.

#### Returns

`void`

---

### getSnapshot()

> **getSnapshot**(): [`StateSnapshot`](StateSnapshot.md)

Defined in: [core/engine.ts:53](https://github.com/SoftZenIT/b-board/blob/c22afb247f8482392c5e7a60d8facd4174dd8352/src/core/engine.ts#L53)

Returns a full snapshot of current state and substates.

#### Returns

[`StateSnapshot`](StateSnapshot.md)

---

### getState()

> **getState**(): `"uninitialized"` \| `"initializing"` \| `"ready"` \| `"error"` \| `"destroyed"`

Defined in: [core/engine.ts:51](https://github.com/SoftZenIT/b-board/blob/c22afb247f8482392c5e7a60d8facd4174dd8352/src/core/engine.ts#L51)

Returns the current top-level state.

#### Returns

`"uninitialized"` \| `"initializing"` \| `"ready"` \| `"error"` \| `"destroyed"`

---

### initialize()

> **initialize**(): `Promise`\<`void`\>

Defined in: [core/engine.ts:47](https://github.com/SoftZenIT/b-board/blob/c22afb247f8482392c5e7a60d8facd4174dd8352/src/core/engine.ts#L47)

Transitions the engine from `init` → `ready`. Must be called once before use.

#### Returns

`Promise`\<`void`\>

---

### on()

> **on**\<`K`\>(`event`, `listener`): [`Unsubscribe`](../type-aliases/Unsubscribe.md)

Defined in: [core/engine.ts:60](https://github.com/SoftZenIT/b-board/blob/c22afb247f8482392c5e7a60d8facd4174dd8352/src/core/engine.ts#L60)

Registers a listener for a lifecycle event.

#### Type Parameters

##### K

`K` _extends_ keyof [`LifecycleEventMap`](LifecycleEventMap.md)

#### Parameters

##### event

`K`

##### listener

(`payload`) => `void` \| `Promise`\<`void`\>

#### Returns

[`Unsubscribe`](../type-aliases/Unsubscribe.md)

An unsubscribe function — call it to remove the listener.

---

### setSubstates()

> **setSubstates**(`updates`): `void`

Defined in: [core/engine.ts:55](https://github.com/SoftZenIT/b-board/blob/c22afb247f8482392c5e7a60d8facd4174dd8352/src/core/engine.ts#L55)

Updates one or more ready-phase substates atomically.

#### Parameters

##### updates

`Partial`\<[`ReadySubstates`](ReadySubstates.md)\>

#### Returns

`void`
