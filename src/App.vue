<script setup lang="ts">
import { onMounted, ref } from 'vue';
import './element/benin-keyboard.js';

const keyboard = ref<any>(null);
const currentTheme = ref('auto');
const effectiveTheme = ref('');

const onThemeChange = (event: any) => {
  currentTheme.value = event.detail.theme;
  effectiveTheme.value = event.detail.effectiveTheme;
};

onMounted(() => {
  if (keyboard.value) {
    keyboard.value.addEventListener('bboard-theme-change', onThemeChange);
    // Get initial state
    currentTheme.value = keyboard.value.theme;
    effectiveTheme.value = keyboard.value.effectiveTheme;
  }
});
</script>

<template>
  <main>
    <h1>BBoard Keyboard Demo</h1>
    <div class="controls">
      <p>
        Theme Mode: <span id="theme-mode">{{ currentTheme }}</span>
      </p>
      <p>
        Effective Theme: <span id="effective-theme">{{ effectiveTheme }}</span>
      </p>
      <button id="btn-light" @click="currentTheme = 'light'">Light</button>
      <button id="btn-dark" @click="currentTheme = 'dark'">Dark</button>
      <button id="btn-auto" @click="currentTheme = 'auto'">Auto</button>
    </div>
    <benin-keyboard ref="keyboard" :theme="currentTheme" />
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
  margin-bottom: 2rem;
  padding: 1rem;
  border: 1px solid #ccc;
  border-radius: 8px;
}

button {
  margin-right: 0.5rem;
  padding: 0.5rem 1rem;
  cursor: pointer;
}
</style>
