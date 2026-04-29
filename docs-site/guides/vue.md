---
title: Vue 3 Integration
---

# Vue 3 Integration

This guide covers integrating `<benin-keyboard>` into a Vue 3 application using the Composition API. The keyboard is a Web Component — a small amount of configuration tells Vue to treat it as a native element rather than a Vue component.

## Installation

```bash
npm install b-board
```

## Setup

### 1. Configure Vite to recognize the custom element

Without this, Vue throws `[Vue warn]: Failed to resolve component: benin-keyboard`.

In `vite.config.ts`, tell Vue's template compiler that `<benin-keyboard>` is a custom element:

```ts
// vite.config.ts
import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';

export default defineConfig({
  plugins: [
    vue({
      template: {
        compilerOptions: {
          isCustomElement: (tag) => tag === 'benin-keyboard',
        },
      },
    }),
  ],
});
```

### 2. Register the custom element

Import `b-board` in your entry file to register the element before any component renders:

```ts
// main.ts
import { createApp } from 'vue';
import App from './App.vue';
import 'b-board';

createApp(App).mount('#app');
```

## TypeScript Types

Create `src/bboard.d.ts` to get type-checked attribute binding in Vue templates:

```ts
// src/bboard.d.ts
type LanguageId = 'yoruba' | 'fon-adja' | 'baatonum' | 'dendi';
type ThemeId = 'light' | 'dark' | 'auto';

interface BeninKeyboardProps {
  language?: LanguageId;
  theme?: ThemeId;
  'layout-variant'?: 'desktop-azerty' | 'mobile-default';
  'modifier-display-mode'?: 'transition' | 'hint';
  open?: boolean;
  disabled?: boolean;
  'show-physical-echo'?: boolean;
}

declare module 'vue' {
  interface GlobalComponents {
    'benin-keyboard': BeninKeyboardProps;
  }
}

export {};
```

## Basic Usage

```vue
<script setup lang="ts">
import { ref } from 'vue';

const text = ref('');

function onKeyPress(e: Event) {
  const { char } = (e as CustomEvent<{ char: string }>).detail;
  text.value += char;
}
</script>

<template>
  <textarea :value="text" readonly />
  <benin-keyboard language="yoruba" theme="auto" @bboard-key-press="onKeyPress" />
</template>
```

Vue 3 forwards custom DOM events via `v-on` (or the `@` shorthand) without any extra configuration.

## `v-model` Binding Pattern

`v-model` expects a component to emit `update:modelValue`. Web components don't follow this convention, so `v-model` on `<benin-keyboard>` will not work. Instead, maintain your own reactive ref and update it manually:

```vue
<script setup lang="ts">
import { ref } from 'vue';

const text = ref('');

function onKeyPress(e: Event) {
  text.value += (e as CustomEvent<{ char: string }>).detail.char;
}
</script>

<template>
  <!-- v-model on the textarea is fine -->
  <textarea v-model="text" />
  <!-- Listen for bboard events and update text manually -->
  <benin-keyboard @bboard-key-press="onKeyPress" language="yoruba" />
</template>
```

## Reactive Language Switching

Use a reactive ref for the `language` attribute. Changes to the ref automatically update the DOM attribute:

```vue
<script setup lang="ts">
import { ref } from 'vue';

type LanguageId = 'yoruba' | 'fon-adja' | 'baatonum' | 'dendi';

const language = ref<LanguageId>('yoruba');
const theme = ref<'light' | 'dark' | 'auto'>('auto');
const text = ref('');

function onKeyPress(e: Event) {
  text.value += (e as CustomEvent<{ char: string }>).detail.char;
}
</script>

<template>
  <div class="controls">
    <button @click="language = 'yoruba'">Yoruba</button>
    <button @click="language = 'fon-adja'">Fon / Adja</button>
    <button @click="language = 'baatonum'">Baatɔnum</button>
    <button @click="language = 'dendi'">Dendi</button>
  </div>
  <textarea v-model="text" />
  <benin-keyboard
    :language="language"
    :theme="theme"
    layout-variant="desktop-azerty"
    @bboard-key-press="onKeyPress"
  />
</template>
```

> **Tip:** Always use `:language` (v-bind shorthand) rather than setting the attribute imperatively with `el.setAttribute(...)`. Bypassing Vue's reactive binding means Vue won't track the change and the UI may fall out of sync.

## All Events

| Event                    | Detail                                            | Description                 |
| ------------------------ | ------------------------------------------------- | --------------------------- |
| `bboard-ready`           | `{ state: KeyboardState }`                        | Keyboard engine initialized |
| `bboard-key-press`       | `{ keyId: string, char: string }`                 | A key was pressed           |
| `bboard-language-change` | `{ languageId: string }`                          | Active language changed     |
| `bboard-theme-change`    | `{ theme, effectiveTheme }`                       | Theme changed               |
| `bboard-error`           | `{ code, severity, message, recoverySuggestion }` | Error occurred              |

## CSS Custom Properties

Customize the keyboard's appearance with CSS custom properties:

```vue
<template>
  <benin-keyboard
    language="yoruba"
    theme="dark"
    :style="{
      '--bboard-color-surface-base': '#1e1e1e',
      '--bboard-color-surface-key': '#2d2d2d',
      '--bboard-color-text-primary': '#ffffff',
    }"
  />
</template>
```

## Nuxt 3

For Nuxt 3, configure the Vue compiler in `nuxt.config.ts` and import the package in a client-only plugin:

```ts
// nuxt.config.ts
export default defineNuxtConfig({
  vue: {
    compilerOptions: {
      isCustomElement: (tag) => tag === 'benin-keyboard',
    },
  },
});
```

```ts
// plugins/bboard.client.ts
import 'b-board';
export default defineNuxtPlugin(() => {});
```

Wrap the keyboard in `<ClientOnly>` to prevent SSR errors:

```vue
<template>
  <ClientOnly>
    <benin-keyboard language="yoruba" />
  </ClientOnly>
</template>
```

## Common Pitfalls

| Pitfall                                       | Cause                                           | Fix                                                    |
| --------------------------------------------- | ----------------------------------------------- | ------------------------------------------------------ |
| `Failed to resolve component: benin-keyboard` | Missing `isCustomElement` config                | Add it to `vite.config.ts`                             |
| `v-model` on keyboard doesn't work            | Web components don't emit `update:modelValue`   | Listen to `bboard-key-press` and update a ref manually |
| Language attribute not updating               | Direct `setAttribute` call bypasses Vue         | Use `:language` binding instead                        |
| Slot content ignored                          | `<benin-keyboard>` uses Shadow DOM              | Use CSS custom properties for customization            |
| HMR shows stale keyboard                      | `customElements.define()` can't be called twice | Do a full page reload (Cmd/Ctrl+Shift+R)               |

## Live Demo

<StackBlitzEmbed framework="vue" />

## Standalone Example

A complete working example is available at [`examples/vue3-sample-app/`](https://github.com/b-board/b-board/tree/main/examples/vue3-sample-app).
