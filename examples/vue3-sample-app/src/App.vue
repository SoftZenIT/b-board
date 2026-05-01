<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';

type LanguageId = 'yoruba' | 'fon-adja' | 'baatonum' | 'dendi';
type ThemeId = 'light' | 'dark' | 'auto';
type LayoutVariantId = 'desktop-azerty' | 'mobile-default';
type ModifierDisplayMode = 'transition' | 'hint';

const languages = [
  { id: 'yoruba' as const, label: 'Yoruba' },
  { id: 'fon-adja' as const, label: 'Fon / Adja' },
  { id: 'baatonum' as const, label: 'Baatonum' },
  { id: 'dendi' as const, label: 'Dendi' },
];

const language = ref<LanguageId>('yoruba');
const theme = ref<ThemeId>('light');
const layoutVariant = ref<LayoutVariantId>('desktop-azerty');
const modifierDisplayMode = ref<ModifierDisplayMode>('transition');
const open = ref(true);
const disabled = ref(false);
const showPhysicalEcho = ref(false);
const floating = ref(false);
const error = ref<string | null>(null);
const keyboardEl = ref<HTMLElement | null>(null);
const textareaEl = ref<HTMLTextAreaElement | null>(null);

onMounted(() => {
  const kb = keyboardEl.value as any;
  const ta = textareaEl.value;
  if (kb && ta) kb.attach(ta);
});

onUnmounted(() => {
  const kb = keyboardEl.value as any;
  if (kb) kb.detach();
});

function onError(e: Event) {
  const detail = (e as CustomEvent).detail as {
    code: string;
    message: string;
    recoverySuggestion: string;
  };
  error.value = `[${detail.code}] ${detail.message} — ${detail.recoverySuggestion}`;
}
</script>

<template>
  <div :class="['app', theme]">
    <header>
      <h1>BBoard + Vue 3</h1>

      <div class="controls">
        <label>
          Language:
          <select id="language-select" v-model="language" data-testid="language-select">
            <option v-for="l in languages" :key="l.id" :value="l.id">{{ l.label }}</option>
          </select>
        </label>

        <label>
          Theme:
          <select v-model="theme" data-testid="theme-select">
            <option value="light">Light</option>
            <option value="dark">Dark</option>
            <option value="auto">Auto</option>
          </select>
        </label>

        <label>
          Layout:
          <select v-model="layoutVariant" data-testid="layout-select">
            <option value="desktop-azerty">Desktop AZERTY</option>
            <option value="mobile-default">Mobile</option>
          </select>
        </label>

        <label>
          Modifier mode:
          <select v-model="modifierDisplayMode" data-testid="modifier-mode-select">
            <option value="transition">Transition</option>
            <option value="hint">Hint</option>
          </select>
        </label>

        <label> <input v-model="open" type="checkbox" data-testid="open-toggle" /> Open </label>

        <label>
          <input v-model="disabled" type="checkbox" data-testid="disabled-toggle" /> Disabled
        </label>

        <label>
          <input v-model="showPhysicalEcho" type="checkbox" data-testid="echo-toggle" /> Physical
          echo
        </label>

        <label>
          <input v-model="floating" type="checkbox" data-testid="floating-toggle" /> Floating
        </label>
      </div>
    </header>

    <main>
      <textarea
        ref="textareaEl"
        data-testid="text-output"
        placeholder="Keyboard output appears here…"
        :rows="4"
      />

      <benin-keyboard
        ref="keyboardEl"
        :language="language"
        :theme="theme"
        :layout-variant="layoutVariant"
        :modifier-display-mode="modifierDisplayMode"
        :open="open"
        :disabled="disabled"
        :show-physical-echo="showPhysicalEcho"
        :floating="floating"
        data-testid="keyboard"
        @bboard-error="onError"
      />

      <div v-if="error" class="error-banner" data-testid="error-display" role="alert">
        {{ error }}
        <button @click="error = null">Dismiss</button>
      </div>
    </main>
  </div>
</template>

<style>
.app {
  font-family: system-ui, sans-serif;
  max-width: 900px;
  margin: 0 auto;
  padding: 1rem;
}
.app.dark {
  background: #1a1a1a;
  color: #e0e0e0;
}
.app.dark textarea,
.app.dark select,
.app.dark input[type='text'] {
  background: #2a2a2a;
  color: #e0e0e0;
  border-color: #444;
}
.controls {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem 1.25rem;
  align-items: center;
  margin: 1rem 0;
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 6px;
}
.app.dark .controls {
  border-color: #444;
}
textarea {
  width: 100%;
  font-size: 1.1rem;
  padding: 0.5rem;
  margin-bottom: 1rem;
  box-sizing: border-box;
}
.error-banner {
  background: #fee;
  border: 1px solid #c00;
  color: #900;
  padding: 0.75rem;
  border-radius: 4px;
  margin-top: 1rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
}
</style>
