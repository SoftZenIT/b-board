---
title: Getting Started
---

# Getting Started

b-board is a framework-agnostic virtual keyboard for Beninese African languages. It ships as a Web Component (`<benin-keyboard>`) that works with any JavaScript framework or plain HTML.

## Installation

```bash
npm install b-board
```

## Quick Start

### 1. Register the custom element

```ts
import 'b-board';
```

### 2. Add the keyboard to your HTML

```html
<input id="my-input" type="text" /> <benin-keyboard language="yoruba" theme="auto"></benin-keyboard>
```

### 3. Listen for key presses

```ts
const keyboard = document.querySelector('benin-keyboard');
keyboard.addEventListener('bboard-key-press', (e) => {
  console.log(e.detail.char); // the inserted character
});
```

## Configuration

| Attribute               | Type                  | Default            | Description                                                         |
| ----------------------- | --------------------- | ------------------ | ------------------------------------------------------------------- |
| `language`              | `LanguageId`          | `'yoruba'`         | Active language profile                                             |
| `theme`                 | `ThemeId`             | `'auto'`           | Color theme (`light`, `dark`, `auto`)                               |
| `layout-variant`        | `LayoutVariantId`     | `'desktop-azerty'` | Keyboard layout                                                     |
| `modifier-display-mode` | `ModifierDisplayMode` | `'transition'`     | How modifier keys animate (`transition` or `hint`)                  |
| `open`                  | `boolean`             | `true`             | Show or hide the keyboard; set to `false` to collapse it            |
| `disabled`              | `boolean`             | `false`            | Disables all interaction                                            |
| `show-physical-echo`    | `boolean`             | `false`            | Highlights the matching virtual key when a physical key is pressed  |
| `floating`              | `boolean`             | `false`            | Detaches the keyboard into a fixed overlay; draggable by its handle |

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
