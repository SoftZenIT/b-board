---
title: Getting Started
---

# Getting Started

b-board is a framework-agnostic virtual keyboard for Beninese African languages. It ships as a Web Component (`<benin-keyboard>`) that works with any JavaScript framework or plain HTML.

## Installation

```bash
npm install b-board
```

### CDN / No-build Setup

To use `b-board` without a build step, load the UMD bundle directly from jsDelivr:

```html
<!-- Pin to a specific version (recommended for production) -->
<script src="https://cdn.jsdelivr.net/npm/b-board@0.1.0/dist/bboard.umd.js"></script>

<!-- Or always load the latest version (good for prototyping) -->
<script src="https://cdn.jsdelivr.net/npm/b-board/dist/bboard.umd.js"></script>

<!-- Then use the element directly -->
<benin-keyboard language="yoruba" theme="auto" open></benin-keyboard>
```

No `import` or bundler needed. The custom element registers itself when the script loads.

## Quick Start

### 1. Register the custom element

```ts
import 'b-board';
```

### 2. Add the keyboard and an input to your HTML

```html
<input id="my-input" type="text" />
<benin-keyboard id="kb" language="yoruba" theme="auto" open></benin-keyboard>
```

### 3. Connect the keyboard to your input

```ts
const keyboard = document.querySelector('benin-keyboard');
const input = document.getElementById('my-input');
keyboard.attach(input);
```

`attach()` accepts `<input>`, `<textarea>`, or any `contenteditable` element. It handles cursor-aware character insertion, backspace, and composition automatically. Call `detach()` to disconnect (e.g. on page navigation or component teardown).

## Configuration

| Attribute               | Type                  | Default            | Description                                                                                                                                                                                               |
| ----------------------- | --------------------- | ------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `language`              | `LanguageId`          | `'yoruba'`         | Active language profile                                                                                                                                                                                   |
| `theme`                 | `ThemeId`             | `'auto'`           | Color theme (`light`, `dark`, `auto`)                                                                                                                                                                     |
| `layout-variant`        | `LayoutVariantId`     | `'desktop-azerty'` | Keyboard layout. `'desktop-azerty'` auto-selects `'desktop-azerty-macos'` on macOS and `'desktop-azerty-windows'` on Windows/Linux at runtime. Use the OS-specific IDs only to force a particular layout. |
| `modifier-display-mode` | `ModifierDisplayMode` | `'transition'`     | How modifier keys animate (`transition` or `hint`)                                                                                                                                                        |
| `open`                  | `boolean`             | `true`             | Show or hide the keyboard; set to `false` to collapse it                                                                                                                                                  |
| `disabled`              | `boolean`             | `false`            | Disables all interaction                                                                                                                                                                                  |
| `show-physical-echo`    | `boolean`             | `false`            | Highlights the matching virtual key when a physical key is pressed                                                                                                                                        |
| `floating`              | `boolean`             | `false`            | Detaches the keyboard into a fixed overlay; draggable by its handle                                                                                                                                       |

### Showing and hiding the keyboard

The `open` attribute controls visibility. Removing it (or setting it to `false`) collapses the keyboard while keeping the element in the DOM — state, language, and theme are preserved.

```html
<!-- Collapsed on page load -->
<benin-keyboard language="yoruba" theme="auto"></benin-keyboard>

<button id="toggle">Show keyboard</button>
```

```ts
const kb = document.querySelector('benin-keyboard')!;
const btn = document.getElementById('toggle')!;

btn.addEventListener('click', () => {
  if (kb.hasAttribute('open')) {
    kb.removeAttribute('open');
    btn.textContent = 'Show keyboard';
  } else {
    kb.setAttribute('open', '');
    btn.textContent = 'Hide keyboard';
  }
});
```

### Floating mode

When `floating` is set, the keyboard detaches from the document flow and renders as a fixed overlay centered at the bottom of the viewport. A drag handle appears at the top — the user can reposition the keyboard anywhere on screen by dragging it.

```html
<benin-keyboard language="yoruba" theme="auto" open floating></benin-keyboard>
```

The keyboard returns to its default inline position when `floating` is removed.

## Supported Languages

| Language ID | Language   |
| ----------- | ---------- |
| `yoruba`    | Yoruba     |
| `fon-adja`  | Fon / Adja |
| `baatonum`  | Baatɔnum   |
| `dendi`     | Dendi      |

## Events

| Event                    | Detail                                            | Description        |
| ------------------------ | ------------------------------------------------- | ------------------ |
| `bboard-ready`           | `{ state }`                                       | Engine initialized |
| `bboard-key-press`       | `{ keyId, char }`                                 | A key was pressed  |
| `bboard-language-change` | `{ languageId }`                                  | Language switched  |
| `bboard-theme-change`    | `{ theme, effectiveTheme }`                       | Theme changed      |
| `bboard-error`           | `{ code, severity, message, recoverySuggestion }` | Error occurred     |

## Framework Guides

- [React](/guides/react)
- [Vue 3](/guides/vue)
- [Angular](/guides/angular)
- [Vanilla JS/TS](/guides/vanilla)

## Next Steps

- [API Reference](/api/) — complete TypeDoc-generated reference
- [Language Customization](/guides/language-customization) — add your own language
- [Troubleshooting](/reference/troubleshooting) — common issues and fixes
