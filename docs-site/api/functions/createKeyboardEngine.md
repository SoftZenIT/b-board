[**b-board**](../README.md)

---

[b-board](../README.md) / createKeyboardEngine

# Function: createKeyboardEngine()

> **createKeyboardEngine**(`options`): [`KeyboardEngine`](../interfaces/KeyboardEngine.md)

Defined in: [core/engine.ts:73](https://github.com/SoftZenIT/b-board/blob/c22afb247f8482392c5e7a60d8facd4174dd8352/src/core/engine.ts#L73)

Creates the keyboard engine facade — wires state machine, substates, lifecycle, error handler, and invariants.

## Parameters

### options

[`KeyboardEngineOptions`](../interfaces/KeyboardEngineOptions.md)

## Returns

[`KeyboardEngine`](../interfaces/KeyboardEngine.md)

## Example

```ts
const engine = createKeyboardEngine({ resolvedLayout });
engine.on('ready', ({ substates }) => console.log('ready!', substates));
await engine.initialize();
```
