# Troubleshooting

This guide covers the most common problems encountered when integrating b-board and explains how to diagnose and fix each one.

## 1. Keyboard Not Appearing

**Symptoms:** The `<benin-keyboard>` element is in the HTML but renders as an empty box, a blank space, or nothing at all.

### Check 1 — The package is imported

The custom element must be registered before the browser can render it. Import b-board once in your application entry point:

```javascript
import 'b-board'; // registers <benin-keyboard>
```

Without this import, the browser treats `<benin-keyboard>` as an unknown HTML element and renders nothing.

### Check 2 — CSS is not hiding it

`display: none` or `visibility: hidden` on `benin-keyboard` or an ancestor element will hide the keyboard. Use the `open` attribute to control visibility instead:

```html
<!-- Visible -->
<benin-keyboard open language="yoruba"></benin-keyboard>

<!-- Hidden (but still in the accessibility tree) -->
<benin-keyboard language="yoruba"></benin-keyboard>
```

Check for inherited `overflow: hidden` or zero height on parent containers as well.

### Check 3 — The `language` attribute is valid

The `language` attribute must be one of the registered language IDs: `yoruba`, `fon-adja`, `baatonum`, or `dendi`. An invalid value causes the element to emit a `bboard-error` event and render an error state:

```html
<!-- Valid -->
<benin-keyboard language="yoruba"></benin-keyboard>

<!-- Invalid — will trigger INVALID_LANGUAGE error -->
<benin-keyboard language="french"></benin-keyboard>
```

---

## 2. Characters Not Inserting into the Input

**Symptoms:** The keyboard renders and keys appear to respond to clicks/taps, but nothing appears in the text field.

### Check 1 — The keyboard is connected to the input

b-board needs to know which input element to write to. Pass the target element's ID via the `input-id` attribute, or connect programmatically:

```html
<input id="my-input" type="text" />
<benin-keyboard input-id="my-input" language="yoruba"></benin-keyboard>
```

Without a connection, key presses fire `bboard-key-press` events but no characters are inserted automatically.

### Check 2 — The input is not disabled or readonly

b-board respects the `disabled` and `readonly` states of connected inputs. If the input is disabled or readonly, characters will not be inserted:

```html
<!-- This input will not receive characters -->
<input id="my-input" type="text" disabled />
<benin-keyboard input-id="my-input" language="yoruba"></benin-keyboard>
```

Remove `disabled` or `readonly` from the input, or listen for `bboard-key-press` and handle insertion manually.

---

## 3. Tone Marks Not Composing

**Symptoms:** Pressing a tone modifier key followed by a vowel inserts two separate characters (e.g. `` ` `` then `a`) instead of the composed character (`à`).

### Cause — Composition rule missing in the language profile

The composition engine can only produce composed characters for which a `CompositionRule` exists in the active language profile. If the rule for a particular trigger/base pair is absent, the engine falls back to inserting both characters separately.

### Fix

Open `data/languages/<language-id>.json` and add the missing rule to `compositionRules`:

```json
{
  "compositionRules": [
    { "trigger": "`", "base": "a", "result": "à", "mode": "tone" },
    { "trigger": "`", "base": "A", "result": "À", "mode": "tone" }
  ]
}
```

Then run `npm run validate:data` to confirm the profile is valid.

See the [Language Customization Guide](../guides/language-customization.md) for a full explanation of how composition rules work.

---

## 4. `bboard-error` Fires on Startup with `DATA_LOAD_FAILED`

**Symptoms:** The keyboard emits a `bboard-error` event immediately on load with `code: "DATA_NOT_FOUND"`, `"HTTP_ERROR"`, or `"NETWORK_ERROR"`. An error banner appears inside the keyboard.

### Cause — Data files not being served

b-board fetches language profile and layout JSON files at runtime. By default it looks for them relative to the page URL. If your build pipeline does not copy the `data/` directory to the web root, the fetch will fail.

### Fix — Copy data files to your web root

Ensure the `data/` directory is served alongside your application. With Vite:

```javascript
// vite.config.js
import { defineConfig } from 'vite';
import { viteStaticCopy } from 'vite-plugin-static-copy';

export default defineConfig({
  plugins: [
    viteStaticCopy({
      targets: [{ src: 'node_modules/b-board/data', dest: '.' }],
    }),
  ],
});
```

### Fix — Set a custom `base-url`

If your data files are hosted at a different path or on a CDN, set the `base-url` attribute:

```html
<benin-keyboard language="yoruba" base-url="https://cdn.example.com/b-board/"></benin-keyboard>
```

Listen for the error event to display a user-facing message:

```javascript
document.querySelector('benin-keyboard').addEventListener('bboard-error', (e) => {
  console.error(`[${e.detail.code}] ${e.detail.message}`);
  console.info('Suggestion:', e.detail.recoverySuggestion);
});
```

---

## 5. React: Custom Events Not Firing

**Symptoms:** Assigning `onBboardKeyPress` in JSX never calls the handler.

### Cause

React 18 does not forward custom DOM events through its synthetic event system. `onBboardKeyPress` only works in React 19+.

### Fix — Use a ref with addEventListener

```tsx
import { useRef, useEffect } from 'react';

function MyComponent() {
  const kbRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = kbRef.current;
    if (!el) return;

    const handler = (e: Event) => {
      const { char } = (e as CustomEvent).detail;
      console.log('Key pressed:', char);
    };

    el.addEventListener('bboard-key-press', handler);
    return () => el.removeEventListener('bboard-key-press', handler);
  }, []);

  return <benin-keyboard ref={kbRef} language="yoruba" />;
}
```

Always return the cleanup function from `useEffect` to avoid duplicate handlers on re-render.

See [React Pitfalls](../guides/react.md) for more React-specific issues.

---

## 6. Vue: `<benin-keyboard>` Treated as Unknown Component

**Symptoms:** Vue console warning: `[Vue warn]: Failed to resolve component: benin-keyboard`

### Cause

Vue's template compiler tries to resolve every tag as a Vue component. Without the `isCustomElement` configuration, it warns and may mangle the element.

### Fix

In `vite.config.ts`, configure the Vue plugin:

```typescript
import vue from '@vitejs/plugin-vue';

export default {
  plugins: [
    vue({
      template: {
        compilerOptions: {
          isCustomElement: (tag) => tag === 'benin-keyboard',
        },
      },
    }),
  ],
};
```

For Nuxt 3, add it in `nuxt.config.ts`:

```typescript
export default defineNuxtConfig({
  vue: {
    compilerOptions: {
      isCustomElement: (tag) => tag === 'benin-keyboard',
    },
  },
});
```

---

## 7. Angular: Template Binding Error

**Symptoms:** Angular build or runtime error: `'benin-keyboard' is not a known element`

### Cause

Angular's template compiler validates all element names against its component registry. Web components are not registered there by default.

### Fix

Add `CUSTOM_ELEMENTS_SCHEMA` to every component (standalone) or module that uses `<benin-keyboard>`:

```typescript
import { Component, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import 'b-board';

@Component({
  selector: 'app-keyboard-demo',
  standalone: true,
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  template: `<benin-keyboard [attr.language]="lang"></benin-keyboard>`,
})
export class KeyboardDemoComponent {
  lang = 'yoruba';
}
```

For NgModule-based apps, add the schema to the module:

```typescript
@NgModule({
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class AppModule {}
```

Use `[attr.language]` (not `[language]`) to set the HTML attribute rather than a DOM property — this is more reliable across all web components.

---

## 8. Performance: Slow First Render

**Symptoms:** The keyboard takes several seconds to appear on first load, especially on slow connections.

### Cause

b-board fetches JSON data files the first time a language is loaded. Without caching headers, every page load re-fetches these files.

### Fix — Set long-lived cache headers on data files

The data files are versioned and content-addressed — they do not change without a version bump. Configure your CDN or server to serve them with long cache lifetimes:

```
Cache-Control: public, max-age=31536000, immutable
```

### Fix — Use the CDN build

If you are loading b-board from a CDN, it ships with a pre-configured `base-url` that points to the CDN data endpoint. Requests are served from edge nodes close to the user and cached aggressively.

### Fix — Preload the data file

Add a `<link rel="preload">` in the `<head>` for the language you expect to load first:

```html
<link rel="preload" href="/data/languages/yoruba.json" as="fetch" crossorigin="anonymous" />
```

---

## 9. Enabling Debug Logging

If you need detailed logs of the composition engine, data loading, and state machine transitions, enable debug mode via `localStorage`:

```javascript
localStorage.setItem('bboard:debug', 'true');
```

Then reload the page. b-board will write structured log entries to the browser console. To disable:

```javascript
localStorage.removeItem('bboard:debug');
```

Debug mode is never active in production builds that do not detect the `localStorage` key — there is no performance cost when it is off.
