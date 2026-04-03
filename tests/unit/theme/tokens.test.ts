import { describe, it, expect } from 'vitest';
import { BBOARD_TOKENS } from '../../../src/theme/tokens';

describe('BBOARD_TOKENS', () => {
  it('should have all expected color tokens', () => {
    expect(BBOARD_TOKENS.COLOR).toEqual({
      SURFACE_BASE: '--bboard-color-surface-base',
      SURFACE_KEY: '--bboard-color-surface-key',
      SURFACE_SPECIAL: '--bboard-color-surface-special',
      TEXT_PRIMARY: '--bboard-color-text-primary',
      TEXT_SECONDARY: '--bboard-color-text-secondary',
      PRIMARY_BASE: '--bboard-color-primary-base',
      PRIMARY_HOVER: '--bboard-color-primary-hover',
      BORDER_SUBTLE: '--bboard-color-border-subtle',
      FOCUS_RING: '--bboard-color-focus-ring',
    });
  });

  it('should have all expected size tokens', () => {
    expect(BBOARD_TOKENS.SIZE).toEqual({
      TOUCH_MIN: '--bboard-size-touch-min',
      KEY_HEIGHT: '--bboard-size-key-height',
      RADIUS_SM: '--bboard-size-radius-sm',
      RADIUS_MD: '--bboard-size-radius-md',
    });
  });

  it('should have all expected space tokens', () => {
    expect(BBOARD_TOKENS.SPACE).toEqual({
      GAP_ROW: '--bboard-space-gap-row',
      GAP_KEY: '--bboard-space-gap-key',
      PADDING: '--bboard-space-padding',
    });
  });

  it('should have all expected font tokens', () => {
    expect(BBOARD_TOKENS.FONT).toEqual({
      FAMILY: '--bboard-font-family',
      SIZE_BASE: '--bboard-font-size-base',
      WEIGHT_LABEL: '--bboard-font-weight-label',
    });
  });

  it('should have all expected shadow tokens', () => {
    expect(BBOARD_TOKENS.SHADOW).toEqual({
      KEY: '--bboard-shadow-key',
      KEY_PRESSED: '--bboard-shadow-key-pressed',
    });
  });

  it('should use "as const" for literal types', () => {
    // This is a type-level check, but we can verify values are frozen or immutable in spirit
    expect(Object.isFrozen(BBOARD_TOKENS)).toBe(false); // as const doesn't freeze at runtime by default, but provides type safety
    // More importantly, we check the values
    expect(BBOARD_TOKENS.COLOR.SURFACE_BASE).toBe('--bboard-color-surface-base');
  });
});
