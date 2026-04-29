[**b-board**](../README.md)

---

[b-board](../README.md) / BBoardEventMap

# Type Alias: BBoardEventMap

> **BBoardEventMap** = `object`

Defined in: [public/events.types.ts:46](https://github.com/SoftZenIT/b-board/blob/c22afb247f8482392c5e7a60d8facd4174dd8352/src/public/events.types.ts#L46)

Map of all custom events emitted by `<benin-keyboard>`.
Use this with `addEventListener` for type-safe event handling.

## Example

```ts
keyboard.addEventListener('bboard-ready', (e: BBoardEventMap['bboard-ready']) => {
  console.log(e.detail.state);
});
```

## Properties

### bboard-error

> **bboard-error**: `CustomEvent`\<[`BBoardErrorEventDetail`](../interfaces/BBoardErrorEventDetail.md)\>

Defined in: [public/events.types.ts:50](https://github.com/SoftZenIT/b-board/blob/c22afb247f8482392c5e7a60d8facd4174dd8352/src/public/events.types.ts#L50)

---

### bboard-key-press

> **bboard-key-press**: `CustomEvent`\<[`BBoardKeyPressEventDetail`](../interfaces/BBoardKeyPressEventDetail.md)\>

Defined in: [public/events.types.ts:51](https://github.com/SoftZenIT/b-board/blob/c22afb247f8482392c5e7a60d8facd4174dd8352/src/public/events.types.ts#L51)

---

### bboard-language-change

> **bboard-language-change**: `CustomEvent`\<[`BBoardLanguageChangeEventDetail`](../interfaces/BBoardLanguageChangeEventDetail.md)\>

Defined in: [public/events.types.ts:48](https://github.com/SoftZenIT/b-board/blob/c22afb247f8482392c5e7a60d8facd4174dd8352/src/public/events.types.ts#L48)

---

### bboard-ready

> **bboard-ready**: `CustomEvent`\<[`BBoardReadyEventDetail`](../interfaces/BBoardReadyEventDetail.md)\>

Defined in: [public/events.types.ts:47](https://github.com/SoftZenIT/b-board/blob/c22afb247f8482392c5e7a60d8facd4174dd8352/src/public/events.types.ts#L47)

---

### bboard-theme-change

> **bboard-theme-change**: `CustomEvent`\<[`BBoardThemeChangeEventDetail`](../interfaces/BBoardThemeChangeEventDetail.md)\>

Defined in: [public/events.types.ts:49](https://github.com/SoftZenIT/b-board/blob/c22afb247f8482392c5e7a60d8facd4174dd8352/src/public/events.types.ts#L49)
