<script setup lang="ts">
import sdk from '@stackblitz/sdk';
import { onMounted, ref } from 'vue';

const props = defineProps<{
  framework: string;
  height?: number;
}>();

const container = ref<HTMLElement>();

const GITHUB_REPO = 'SoftZenIT/b-board';

const FRAMEWORK_PATHS: Record<string, string> = {
  react: 'examples/react-sample-app',
  vue: 'examples/vue3-sample-app',
  angular: 'examples/angular-sample-app',
  vanilla: 'examples/vanilla',
};

const OPEN_FILES: Record<string, string> = {
  react: 'src/App.tsx',
  vue: 'src/App.vue',
  angular: 'src/app/app.component.ts',
  vanilla: 'src/main.ts',
};

onMounted(() => {
  if (!container.value) return;
  sdk.embedGithubProject(container.value, GITHUB_REPO, {
    openFile: OPEN_FILES[props.framework] ?? 'README.md',
    startScript: 'install,dev',
    view: 'both',
    height: props.height ?? 520,
    theme: 'dark',
  });
});
</script>

<template>
  <div class="sb-embed-wrapper">
    <div ref="container" class="sb-embed" />
    <p class="sb-fallback">
      <a
        :href="`https://stackblitz.com/github/${GITHUB_REPO}/tree/main/${FRAMEWORK_PATHS[framework]}`"
        target="_blank"
        rel="noopener"
      >
        Open in StackBlitz ↗
      </a>
    </p>
  </div>
</template>

<style scoped>
.sb-embed-wrapper {
  margin: 1.5rem 0;
}
.sb-embed {
  border-radius: 10px;
  overflow: hidden;
  border: 1px solid var(--vp-c-divider);
}
.sb-fallback {
  font-size: 0.85rem;
  text-align: right;
  margin-top: 0.5rem;
  color: var(--vp-c-text-2);
}
</style>
