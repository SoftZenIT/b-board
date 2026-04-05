import { describe, expect, it } from 'vitest';
import { render } from 'lit';
import { createKeyId } from '../../public/index.js';
import { renderMobileKey } from './key.js';
import type { MobileRenderKey } from './render-model.js';

function makeKey(overrides: Partial<MobileRenderKey> = {}): MobileRenderKey {
  return {
    keyId: createKeyId('key-a'),
    width: 1,
    primaryLabel: 'a',
    hidden: false,
    disabled: false,
    active: false,
    tabStop: true,
    thumbComfort: 'medium',
    isActionKey: false,
    hasLongPress: true,
    longPressChars: ['à', 'á'],
    ...overrides,
  };
}

describe('renderMobileKey', () => {
  it('returns null for hidden keys', () => {
    expect(renderMobileKey(makeKey({ hidden: true }))).toBeNull();
  });

  it('renders a button with data-key-id', () => {
    const container = document.createElement('div');
    render(renderMobileKey(makeKey())!, container);
    const btn = container.querySelector('button')!;
    expect(btn.getAttribute('data-key-id')).toBe('key-a');
  });

  it('sets tabindex=0 when tabStop is true', () => {
    const container = document.createElement('div');
    render(renderMobileKey(makeKey({ tabStop: true }))!, container);
    expect(container.querySelector('button')!.getAttribute('tabindex')).toBe('0');
  });

  it('sets tabindex=-1 when tabStop is false', () => {
    const container = document.createElement('div');
    render(renderMobileKey(makeKey({ tabStop: false }))!, container);
    expect(container.querySelector('button')!.getAttribute('tabindex')).toBe('-1');
  });

  it('adds bboard-key-action class for action keys', () => {
    const container = document.createElement('div');
    render(renderMobileKey(makeKey({ isActionKey: true }))!, container);
    expect(container.querySelector('button')!.classList.contains('bboard-key-action')).toBe(true);
  });

  it('adds is-active class when active', () => {
    const container = document.createElement('div');
    render(renderMobileKey(makeKey({ active: true }))!, container);
    expect(container.querySelector('button')!.classList.contains('is-active')).toBe(true);
  });

  it('sets data-thumb-comfort attribute', () => {
    const container = document.createElement('div');
    render(renderMobileKey(makeKey({ thumbComfort: 'high' }))!, container);
    expect(container.querySelector('button')!.getAttribute('data-thumb-comfort')).toBe('high');
  });

  it('adds data-has-long-press when hasLongPress is true', () => {
    const container = document.createElement('div');
    render(renderMobileKey(makeKey({ hasLongPress: true }))!, container);
    expect(container.querySelector('button')!.hasAttribute('data-has-long-press')).toBe(true);
  });
});
