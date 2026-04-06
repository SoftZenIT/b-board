# Vue 3 Common Pitfalls

Common issues when using `<benin-keyboard>` in Vue 3 applications and how to fix them.

## 1. Missing `isCustomElement` Config

**Problem:** Without the `isCustomElement` configuration, Vue treats `<benin-keyboard>` as a Vue component and throws a resolution warning.

```
[Vue warn]: Failed to resolve component: benin-keyboard
```

**Solution:** Configure the Vue compiler in `vite.config.ts`:

```ts
// ✅ Correct
vue({
  template: {
    compilerOptions: {
      isCustomElement: (tag) => tag === 'benin-keyboard',
    },
  },
});
```

For Nuxt 3, add it in `nuxt.config.ts`:

```ts
export default defineNuxtConfig({
  vue: {
    compilerOptions: {
      isCustomElement: (tag) => tag === 'benin-keyboard',
    },
  },
});
```

## 2. v-model Does Not Work

**Problem:** `v-model` expects the component to emit `update:modelValue` or `input` events. Web components don't follow this convention.

```vue
<!-- ❌ Wrong — v-model won't work -->
<benin-keyboard v-model="text" />
```

**Solution:** Listen for the `bboard-key-press` event and update the value manually:

```vue
<!-- ✅ Correct — manual event handling -->
<script setup>
import { ref } from 'vue';
const text = ref('');

function onKeyPress(e) {
  text.value += e.detail.char;
}
</script>

<template>
  <textarea v-model="text" />
  <benin-keyboard @bboard-key-press="onKeyPress" />
</template>
```

## 3. Slot Content Not Rendering in Shadow DOM

**Problem:** Passing slot content to the keyboard element doesn't work because the web component uses Shadow DOM with specific slot definitions.

```vue
<!-- ❌ Wrong — content is ignored -->
<benin-keyboard>
  <div>Custom header</div>
</benin-keyboard>
```

**Solution:** `<benin-keyboard>` does not accept slotted content. Customize the keyboard's appearance using CSS custom properties instead:

```vue
<!-- ✅ Correct — use CSS custom properties for customization -->
<benin-keyboard
  :style="{
    '--bboard-color-surface-base': '#f5f5f5',
  }"
/>
```

## 4. Vue DevTools Not Inspecting Custom Element Internals

**Problem:** Vue DevTools shows `<benin-keyboard>` as a native element without exposing its internal state or reactive properties.

**Explanation:** This is expected behavior. Vue DevTools only inspect Vue components, not native custom elements. The keyboard manages its own internal state via Lit's reactive system.

**Workaround:** Use the browser's built-in DevTools:

1. Right-click the keyboard → Inspect
2. In the Elements panel, select the `benin-keyboard` element
3. In the console, run `$0.language` or `$0.theme` to inspect properties
4. Use the "Event Listeners" tab to see attached event listeners

## 5. HMR Not Updating Custom Element Definitions

**Problem:** When modifying code that affects the keyboard, Vite's HMR doesn't re-register the custom element. You see stale behavior after code changes.

**Explanation:** `customElements.define()` can only be called once per tag name. Re-defining throws an error. Lit elements register themselves on first import.

**Solution:** When making changes that affect the keyboard integration, do a full page reload:

```
# In the browser
Ctrl+Shift+R (or Cmd+Shift+R on macOS)
```

Or configure Vite to always full-reload when b-board files change:

```ts
// vite.config.ts — force full reload for b-board changes
export default defineConfig({
  server: {
    watch: {
      // Full reload is triggered automatically when node_modules change
    },
  },
});
```

## 6. Reactive Property Not Updating the Element

**Problem:** Setting a property on the keyboard element imperatively doesn't trigger Vue's reactivity.

```vue
<!-- ❌ Wrong — direct DOM manipulation bypasses Vue -->
<script setup>
import { onMounted, ref } from 'vue';
const kbRef = ref<HTMLElement>();

onMounted(() => {
  kbRef.value!.setAttribute('language', 'fon-adja');
});
</script>
```

**Solution:** Use Vue's `:attribute` binding so changes are reactive:

```vue
<!-- ✅ Correct — reactive binding -->
<script setup>
import { ref } from 'vue';
const language = ref('yoruba');
</script>

<template>
  <benin-keyboard :language="language" />
  <button @click="language = 'fon-adja'">Switch to Fon</button>
</template>
```
