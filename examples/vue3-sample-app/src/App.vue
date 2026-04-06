<script setup lang="ts">
import { ref } from 'vue';

type LanguageId = 'yoruba' | 'fon-adja' | 'baatonum' | 'dendi';

const languages = [
  { id: 'yoruba' as const, label: 'Yoruba' },
  { id: 'fon-adja' as const, label: 'Fon / Adja' },
  { id: 'baatonum' as const, label: 'Baatonum' },
  { id: 'dendi' as const, label: 'Dendi' },
];

const language = ref<LanguageId>('yoruba');
const theme = ref<'light' | 'dark'>('light');
const text = ref('');
const error = ref<string | null>(null);

function onKeyPress(e: Event) {
  const detail = (e as CustomEvent).detail as { char: string };
  text.value += detail.char;
}

function onError(e: Event) {
  const detail = (e as CustomEvent).detail as {
    code: string;
    message: string;
    recoverySuggestion: string;
  };
  error.value = `[${detail.code}] ${detail.message} — ${detail.recoverySuggestion}`;
}

function toggleTheme() {
  theme.value = theme.value === 'light' ? 'dark' : 'light';
}
</script>

<template>
  <div :class="['app', theme]">
    <header>
      <h1>BBoard + Vue 3</h1>

      <div class="controls">
        <label for="language-select">Language: </label>
        <select id="language-select" v-model="language" data-testid="language-select">
          <option v-for="l in languages" :key="l.id" :value="l.id">
            {{ l.label }}
          </option>
        </select>

        <button data-testid="theme-toggle" @click="toggleTheme">Theme: {{ theme }}</button>
      </div>
    </header>

    <main>
      <textarea
        v-model="text"
        data-testid="text-output"
        placeholder="Keyboard output appears here…"
        :rows="4"
      />

      <benin-keyboard
        :language="language"
        :theme="theme"
        data-testid="keyboard"
        @bboard-key-press="onKeyPress"
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
.controls {
  display: flex;
  gap: 1rem;
  align-items: center;
  margin: 1rem 0;
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
