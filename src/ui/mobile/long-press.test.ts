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

  it('sets data-index on each option', () => {
    const container = document.createElement('div');
    render(renderLongPressPopup(makePopup()), container);
    const options = container.querySelectorAll('[role="option"]');
    expect(options[0].getAttribute('data-index')).toBe('0');
    expect(options[1].getAttribute('data-index')).toBe('1');
    expect(options[2].getAttribute('data-index')).toBe('2');
  });

  it('adds is-selected class to the selected option', () => {
    const container = document.createElement('div');
    render(renderLongPressPopup(makePopup({ selectedIndex: 2 })), container);
    const options = container.querySelectorAll('[role="option"]');
    expect(options[0].classList.contains('is-selected')).toBe(false);
    expect(options[1].classList.contains('is-selected')).toBe(false);
    expect(options[2].classList.contains('is-selected')).toBe(true);
  });

  it('listbox has aria-label "Alternate characters"', () => {
    const container = document.createElement('div');
    render(renderLongPressPopup(makePopup()), container);
    expect(container.querySelector('[role="listbox"]')!.getAttribute('aria-label')).toBe(
      'Alternate characters'
    );
  });
});
