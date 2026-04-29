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

| Attribute               | Type                  | Default            | Description                           |
| ----------------------- | --------------------- | ------------------ | ------------------------------------- |
| `language`              | `LanguageId`          | `'yoruba'`         | Active language profile               |
| `theme`                 | `ThemeId`             | `'auto'`           | Color theme (`light`, `dark`, `auto`) |
| `layout-variant`        | `LayoutVariantId`     | `'desktop-azerty'` | Keyboard layout                       |
| `modifier-display-mode` | `ModifierDisplayMode` | `'transition'`     | How modifier keys animate             |
| `open`                  | `boolean`             | `true`             | Whether the keyboard is visible       |
| `disabled`              | `boolean`             | `false`            | Disables all interaction              |
| `show-physical-echo`    | `boolean`             | `false`            | Echoes physical key presses on screen |

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
