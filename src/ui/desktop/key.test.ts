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
    }) as TemplateResult;
    // The active class is dynamic — check via the values array
    expect(result.values).toContain('bboard-key-character is-active');
  });
});
