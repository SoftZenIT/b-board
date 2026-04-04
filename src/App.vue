<script setup lang="ts">
import { onMounted, ref } from 'vue';
import './element/benin-keyboard.js';

const keyboard = ref<any>(null);
const currentTheme = ref('auto');
const effectiveTheme = ref('');
const lastKey = ref('');
const showEcho = ref(true);

const onThemeChange = (event: any) => {
  currentTheme.value = event.detail.theme;
  effectiveTheme.value = event.detail.effectiveTheme;
};

const onKeyPress = (event: any) => {
  const { keyId, char } = event.detail;
  lastKey.value = char ? `${char}  (${keyId})` : keyId;
};

onMounted(() => {
  if (keyboard.value) {
    keyboard.value.addEventListener('bboard-theme-change', onThemeChange);
    keyboard.value.addEventListener('bboard-key-press', onKeyPress);
    currentTheme.value = keyboard.value.theme;
    effectiveTheme.value = keyboard.value.effectiveTheme;
  }
});
</script>

<template>
  <main>
    <h1>BBoard Keyboard Demo</h1>
    <div class="controls">
      <div class="control-row">
        <span>Theme:</span>
        <button id="btn-light" @click="currentTheme = 'light'">Light</button>
        <button id="btn-dark" @click="currentTheme = 'dark'">Dark</button>
        <button id="btn-auto" @click="currentTheme = 'auto'">Auto</button>
        <span class="meta">({{ effectiveTheme }})</span>
      </div>
      <div class="control-row">
        <span>Physical echo:</span>
        <button @click="showEcho = !showEcho">
          {{ showEcho ? 'On' : 'Off' }}
        </button>
      </div>
      <div class="control-row key-output">
        Last key: <strong id="last-key">{{ lastKey || '—' }}</strong>
      </div>
    </div>
    <benin-keyboard
      ref="keyboard"
      :theme="currentTheme"
      layout-variant="desktop-azerty"
      :show-physical-echo="showEcho"
      modifier-display-mode="hint"
    />
  </main>
</template>

<style>
:root {
  font-family: sans-serif;
}

main {
  padding: 2rem;
}

.controls {
  margin-bottom: 1.5rem;
  padding: 1rem;
  border: 1px solid #ccc;
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.control-row {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.meta {
  color: #666;
  font-size: 0.875rem;
}

.key-output {
  font-size: 1rem;
}

button {
  padding: 0.4rem 0.8rem;
  cursor: pointer;
  border-radius: 4px;
  border: 1px solid #ccc;
}
</style>
