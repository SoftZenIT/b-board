---
title: Vanilla JS / TS
---

# Vanilla JS / TS

`<benin-keyboard>` works in any environment that supports Web Components — no framework required. This guide shows how to use it with plain JavaScript or TypeScript, covers cursor-position-aware insertion, and lists all available events.

## Installation

```bash
npm install b-board
```

## ESM Import

Register the element once at your app's entry point:

```ts
import 'b-board';
```

After this import the `<benin-keyboard>` custom element is defined and ready to use anywhere on the page.

```html
<textarea id="output"></textarea>
<benin-keyboard language="yoruba" theme="auto"></benin-keyboard>

<script type="module">
  import 'b-board';

  const keyboard = document.querySelector('benin-keyboard');
  const output = document.getElementById('output');

  keyboard.addEventListener('bboard-key-press', (e) => {
    output.value += e.detail.char;
  });
</script>
```

## CDN / UMD Usage

If you are not using a bundler, you can load b-board directly from a CDN:

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <title>b-board CDN example</title>
  </head>
  <body>
    <textarea id="output"></textarea>
    <benin-keyboard language="yoruba" theme="auto"></benin-keyboard>

    <!-- Load from a CDN that supports ESM (e.g. esm.sh or unpkg) -->
    <script type="module">
      import 'https://esm.sh/b-board';

      const keyboard = document.querySelector('benin-keyboard');
      const output = document.getElementById('output');

      keyboard.addEventListener('bboard-key-press', (e) => {
        output.value += e.detail.char;
      });
    </script>
  </body>
</html>
```

## TypeScript Element Type Declaration

TypeScript doesn't know about custom elements by default. Add a global declaration so `querySelector` and `getElementById` return the right type:

```ts
// src/bboard.d.ts
type LanguageId = 'yoruba' | 'fon-adja' | 'baatonum' | 'dendi';
type ThemeId = 'light' | 'dark' | 'auto';

interface BeninKeyboardElement extends HTMLElement {
  language: LanguageId;
  theme: ThemeId;
  'layout-variant': 'desktop-azerty' | 'mobile-default';
  'modifier-display-mode': 'transition' | 'hint';
  open: boolean;
  disabled: boolean;
  'show-physical-echo': boolean;
}

declare global {
  interface HTMLElementTagNameMap {
    'benin-keyboard': BeninKeyboardElement;
  }
}
```

With this declaration `document.querySelector('benin-keyboard')` returns `BeninKeyboardElement | null`, giving you typed access to its properties.

## Cursor Position Handling

Simply appending to `textarea.value` loses the cursor position. Use the selection range API to insert the character exactly where the cursor is:

```ts
import 'b-board';

const output = document.getElementById('output') as HTMLTextAreaElement;
const keyboard = document.getElementById('kb')!;

keyboard.addEventListener('bboard-key-press', (e) => {
  const { char } = (e as CustomEvent<{ char: string }>).detail;

  // Read current cursor / selection
  const start = output.selectionStart ?? output.value.length;
  const end = output.selectionEnd ?? output.value.length;

  // Replace selected text (or insert at cursor when start === end)
  output.value = output.value.slice(0, start) + char + output.value.slice(end);

  // Move cursor to just after the inserted character
  output.selectionStart = output.selectionEnd = start + char.length;

  // Keep focus on the text area
  output.focus();
});
```

This pattern:

- Replaces any selected text with the new character.
- Inserts at the cursor when nothing is selected.
- Restores focus so subsequent key presses land in the right place.

## Language and Theme Switching

Set attributes directly on the element to switch the active language or theme at runtime:

```ts
const keyboard = document.querySelector('benin-keyboard')!;

// Switch language
keyboard.setAttribute('language', 'fon-adja');

// Switch theme
keyboard.setAttribute('theme', 'dark');

// Disable the keyboard
keyboard.setAttribute('disabled', '');

// Re-enable
keyboard.removeAttribute('disabled');
```

Example with `<select>` controls:

```html
<select id="lang-select">
  <option value="yoruba">Yoruba</option>
  <option value="fon-adja">Fon / Adja</option>
  <option value="baatonum">Baatɔnum</option>
  <option value="dendi">Dendi</option>
</select>
<select id="theme-select">
  <option value="auto">Auto</option>
  <option value="light">Light</option>
  <option value="dark">Dark</option>
</select>
<benin-keyboard id="kb" language="yoruba" theme="auto"></benin-keyboard>
```

```ts
const keyboard = document.getElementById('kb')!;
const langSelect = document.getElementById('lang-select') as HTMLSelectElement;
const themeSelect = document.getElementById('theme-select') as HTMLSelectElement;

langSelect.addEventListener('change', () => {
  keyboard.setAttribute('language', langSelect.value);
});

themeSelect.addEventListener('change', () => {
  keyboard.setAttribute('theme', themeSelect.value);
});
```

## All Events

Listen for any event with `addEventListener`. All events bubble and are composed (they cross Shadow DOM boundaries).

| Event                    | Detail                                                                            | Description                                           |
| ------------------------ | --------------------------------------------------------------------------------- | ----------------------------------------------------- |
| `bboard-ready`           | `{ state: KeyboardState }`                                                        | Engine initialized — safe to read keyboard properties |
| `bboard-key-press`       | `{ keyId: string, char: string }`                                                 | A key was pressed; `char` is the composed character   |
| `bboard-language-change` | `{ languageId: string }`                                                          | Active language switched                              |
| `bboard-theme-change`    | `{ theme: string, effectiveTheme: string }`                                       | Theme changed (`effectiveTheme` resolves `'auto'`)    |
| `bboard-error`           | `{ code: string, severity: string, message: string, recoverySuggestion: string }` | An error occurred                                     |

```ts
const keyboard = document.querySelector('benin-keyboard')!;

keyboard.addEventListener('bboard-ready', (e) => {
  console.log('Keyboard ready', (e as CustomEvent).detail.state);
});

keyboard.addEventListener('bboard-language-change', (e) => {
  console.log('Language changed to', (e as CustomEvent).detail.languageId);
});

keyboard.addEventListener('bboard-error', (e) => {
  const { code, message, recoverySuggestion } = (e as CustomEvent).detail;
  console.error(`[${code}] ${message}. ${recoverySuggestion}`);
});
```

## CSS Custom Properties

Customize the keyboard's visual appearance with CSS custom properties:

```css
benin-keyboard {
  --bboard-color-surface-base: #f5f5f5;
  --bboard-color-surface-key: #ffffff;
  --bboard-color-text-primary: #1a1a1a;
}
```

Or inline via JavaScript:

```ts
const keyboard = document.querySelector('benin-keyboard') as HTMLElement;
keyboard.style.setProperty('--bboard-color-surface-base', '#1e1e1e');
```

## Live Demo

<StackBlitzEmbed framework="vanilla" />

## Standalone Example

A complete working example is available at [`examples/vanilla/`](https://github.com/b-board/b-board/tree/main/examples/vanilla).
