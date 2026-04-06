import { describe, expect, it } from 'vitest';
import { type TemplateResult } from 'lit';
import { renderDesktopKey } from './key.js';

describe('renderDesktopKey', () => {
  it('should render action and character keys from the render model', () => {
    const result = renderDesktopKey({
      keyId: 'key-enter' as never,
      width: 1.5,
      primaryLabel: '⏎',
      secondaryLabel: '',
      overrideLabel: '⏎',
      hidden: false,
      disabled: false,
      focused: false,
      active: false,
      tabStop: true,
    });
    expect(String((result as TemplateResult).strings?.[0] ?? '')).toContain('bboard-key');
  });

  it('should return null for hidden keys', () => {
    const result = renderDesktopKey({
      keyId: 'key-z' as never,
      width: 1,
      primaryLabel: 'z',
      secondaryLabel: '',
      hidden: true,
      disabled: false,
      focused: false,
      active: false,
      tabStop: false,
    });
    expect(result).toBeNull();
  });

  it('should include is-active class when key is active', () => {
    const result = renderDesktopKey({
      keyId: 'key-a' as never,
      width: 1,
      primaryLabel: 'a',
      secondaryLabel: 'A',
      hidden: false,
      disabled: false,
      focused: false,
      active: true,
      tabStop: false,
    }) as TemplateResult;
    // The active class is dynamic — check via the values array
    expect(result.values).toContain('bboard-key-character is-active');
  });

  it('should use human-readable aria-label for known action key IDs', () => {
    const result = renderDesktopKey({
      keyId: 'key-enter' as never,
      width: 1.5,
      primaryLabel: '⏎',
      secondaryLabel: '',
      overrideLabel: '⏎',
      hidden: false,
      disabled: false,
      focused: false,
      active: false,
      tabStop: true,
    }) as TemplateResult;
    // aria-label should be the accessible name "Enter", not the icon glyph "⏎"
    expect(result.values).toContain('Enter');
  });

  it('should fall back to primaryLabel for aria-label on unknown key IDs', () => {
    const result = renderDesktopKey({
      keyId: 'key-a' as never,
      width: 1,
      primaryLabel: 'a',
      secondaryLabel: '',
      hidden: false,
      disabled: false,
      focused: false,
      active: false,
      tabStop: true,
    }) as TemplateResult;
    expect(result.values).toContain('a');
  });

  it('should render the overrideLabel visually while using accessible label for aria-label', () => {
    const result = renderDesktopKey({
      keyId: 'key-shift' as never,
      width: 1.25,
      primaryLabel: '⇧',
      secondaryLabel: '',
      overrideLabel: '⇧',
      hidden: false,
      disabled: false,
      focused: false,
      active: false,
      tabStop: false,
    }) as TemplateResult;
    // aria-label should be "Shift", not "⇧"
    expect(result.values).toContain('Shift');
    // Visual span should still show "⇧"
    expect(result.values).toContain('⇧');
  });
});
