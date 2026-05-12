import DefaultTheme from 'vitepress/theme';
import './custom.css';
import StackBlitzEmbed from './components/StackBlitzEmbed.vue';
import type { Theme } from 'vitepress';

export default {
  extends: DefaultTheme,
  enhanceApp({ app }) {
    app.component('StackBlitzEmbed', StackBlitzEmbed);
  },
} satisfies Theme;
