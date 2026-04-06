// Type declarations for <benin-keyboard> in Vue 3 templates

type LanguageId = 'yoruba' | 'fon-adja' | 'baatonum' | 'dendi';
type ThemeId = 'light' | 'dark' | 'auto';
type LayoutVariantId = 'desktop-azerty' | 'mobile-default';
type ModifierDisplayMode = 'transition' | 'hint';

interface BeninKeyboardProps {
  language?: LanguageId;
  theme?: ThemeId;
  'layout-variant'?: LayoutVariantId;
  'modifier-display-mode'?: ModifierDisplayMode;
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
