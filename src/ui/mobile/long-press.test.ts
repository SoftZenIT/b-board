import { describe, expect, it } from 'vitest';
import { render } from 'lit';
import { createKeyId } from '../../public/index.js';
import { renderLongPressPopup } from './long-press.js';
import type { LongPressPopupModel } from './render-model.js';

function makePopup(overrides: Partial<LongPressPopupModel> = {}): LongPressPopupModel {
  return {
    anchorKeyId: createKeyId('key-a'),
    items: ['à', 'á', 'â'],
    selectedIndex: 1,
    ...overrides,
  };
}

describe('renderLongPressPopup', () => {
  it('renders a listbox with one option per item', () => {
    const container = document.createElement('div');
    render(renderLongPressPopup(makePopup()), container);
    const listbox = container.querySelector('[role="listbox"]')!;
    expect(listbox).not.toBeNull();
    const options = container.querySelectorAll('[role="option"]');
    expect(options).toHaveLength(3);
  });

  it('marks the selected option with aria-selected=true', () => {
    const container = document.createElement('div');
    render(renderLongPressPopup(makePopup({ selectedIndex: 1 })), container);
    const options = container.querySelectorAll('[role="option"]');
    expect(options[0].getAttribute('aria-selected')).toBe('false');
    expect(options[1].getAttribute('aria-selected')).toBe('true');
    expect(options[2].getAttribute('aria-selected')).toBe('false');
  });

  it('sets data-char on each option', () => {
    const container = document.createElement('div');
    render(renderLongPressPopup(makePopup()), container);
    const options = container.querySelectorAll('[role="option"]');
    expect(options[0].getAttribute('data-char')).toBe('à');
    expect(options[1].getAttribute('data-char')).toBe('á');
    expect(options[2].getAttribute('data-char')).toBe('â');
  });
});
