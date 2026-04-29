<script setup lang="ts">
defineProps<{ framework: string; height?: number }>();
</script>

<template>
  <div class="sb-placeholder">
    <p>Interactive example loading... (StackBlitz embed)</p>
  </div>
</template>

<style scoped>
.sb-placeholder {
  border: 1px dashed var(--vp-c-divider);
  border-radius: 8px;
  padding: 2rem;
  text-align: center;
  color: var(--vp-c-text-2);
  margin: 1rem 0;
}
</style>
