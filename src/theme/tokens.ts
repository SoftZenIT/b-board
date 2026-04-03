/**
 * TypeScript constants for design tokens.
 * Use these instead of raw strings to ensure type-safety and autocompletion.
 *
 * @example
 * element.style.setProperty(BBOARD_TOKENS.COLOR.SURFACE_KEY, '#fff');
 */
export const BBOARD_TOKENS = {
  COLOR: {
    SURFACE_BASE: '--bboard-color-surface-base',
    SURFACE_KEY: '--bboard-color-surface-key',
    SURFACE_SPECIAL: '--bboard-color-surface-special',
    TEXT_PRIMARY: '--bboard-color-text-primary',
    TEXT_SECONDARY: '--bboard-color-text-secondary',
    PRIMARY_BASE: '--bboard-color-primary-base',
    PRIMARY_HOVER: '--bboard-color-primary-hover',
    BORDER_SUBTLE: '--bboard-color-border-subtle',
    FOCUS_RING: '--bboard-color-focus-ring',
  },
  SIZE: {
    TOUCH_MIN: '--bboard-size-touch-min',
    KEY_HEIGHT: '--bboard-size-key-height',
    RADIUS_SM: '--bboard-size-radius-sm',
    RADIUS_MD: '--bboard-size-radius-md',
  },
  SPACE: {
    GAP_ROW: '--bboard-space-gap-row',
    GAP_KEY: '--bboard-space-gap-key',
    PADDING: '--bboard-space-padding',
  },
  FONT: {
    FAMILY: '--bboard-font-family',
    SIZE_BASE: '--bboard-font-size-base',
    WEIGHT_LABEL: '--bboard-font-weight-label',
  },
  SHADOW: {
    KEY: '--bboard-shadow-key',
    KEY_PRESSED: '--bboard-shadow-key-pressed',
  },
} as const;
