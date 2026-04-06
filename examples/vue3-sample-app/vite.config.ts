import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';

export default defineConfig({
  plugins: [
    vue({
      template: {
        compilerOptions: {
          // Treat <benin-keyboard> as a custom element (not a Vue component)
          isCustomElement: (tag) => tag === 'benin-keyboard',
        },
      },
    }),
  ],
  server: {
    port: 5175,
  },
});
