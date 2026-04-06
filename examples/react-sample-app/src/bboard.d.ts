// Type declarations for <benin-keyboard> web component in React/JSX
import type { DetailedHTMLProps, HTMLAttributes } from 'react';

type LanguageId = 'yoruba' | 'fon-adja' | 'baatonum' | 'dendi';
type ThemeId = 'light' | 'dark' | 'auto';
type LayoutVariantId = 'desktop-azerty' | 'mobile-default';
type ModifierDisplayMode = 'transition' | 'hint';

interface BeninKeyboardAttributes {
  language?: LanguageId;
  theme?: ThemeId;
  'layout-variant'?: LayoutVariantId;
  'modifier-display-mode'?: ModifierDisplayMode;
  open?: boolean;
  disabled?: boolean;
  'show-physical-echo'?: boolean;
  class?: string;
  style?: React.CSSProperties;
  ref?: React.Ref<HTMLElement>;
}

declare global {
  namespace JSX {
    interface IntrinsicElements {
      'benin-keyboard': DetailedHTMLProps<
        HTMLAttributes<HTMLElement> & BeninKeyboardAttributes,
        HTMLElement
      >;
    }
  }
}
