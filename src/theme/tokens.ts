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
    SURFACE_SUNKEN: '--bboard-color-surface-sunken',
    SURFACE_KEY: '--bboard-color-surface-key',
    SURFACE_SPECIAL: '--bboard-color-surface-special',
    SURFACE_ACTIVE: '--bboard-color-surface-active',
    TEXT_PRIMARY: '--bboard-color-text-primary',
    TEXT_SECONDARY: '--bboard-color-text-secondary',
    TEXT_ON_PRIMARY: '--bboard-color-text-on-primary',
    PRIMARY_BASE: '--bboard-color-primary-base',
    PRIMARY_HOVER: '--bboard-color-primary-hover',
    PRIMARY_ACTIVE: '--bboard-color-primary-active',
    BORDER_SUBTLE: '--bboard-color-border-subtle',
    BORDER_STRONG: '--bboard-color-border-strong',
    FOCUS_RING: '--bboard-color-focus-ring',
    STATUS_ERROR: '--bboard-color-status-error',
    STATUS_SUCCESS: '--bboard-color-status-success',
  },
  SIZE: {
    TOUCH_MIN: '--bboard-size-touch-min',
    KEY_HEIGHT: '--bboard-size-key-height',
    KEY_WIDTH: '--bboard-size-key-width',
    RADIUS_SM: '--bboard-size-radius-sm',
    RADIUS_MD: '--bboard-size-radius-md',
    RADIUS_LG: '--bboard-size-radius-lg',
  },
  SPACE: {
    GAP_ROW: '--bboard-space-gap-row',
    GAP_KEY: '--bboard-space-gap-key',
    PADDING: '--bboard-space-padding',
    INSET_SM: '--bboard-space-inset-sm',
    INSET_MD: '--bboard-space-inset-md',
  },
  FONT: {
    FAMILY: '--bboard-font-family',
    SIZE_BASE: '--bboard-font-size-base',
    SIZE_SM: '--bboard-font-size-sm',
    SIZE_LG: '--bboard-font-size-lg',
    WEIGHT_LABEL: '--bboard-font-weight-label',
    WEIGHT_BOLD: '--bboard-font-weight-bold',
  },
  SHADOW: {
    KEY: '--bboard-shadow-key',
    KEY_PRESSED: '--bboard-shadow-key-pressed',
    POPUP: '--bboard-shadow-popup',
  },
  OPACITY: {
    DISABLED: '--bboard-opacity-disabled',
  },
} as const;
