import { describe, expect, it } from 'vitest';
import { html, render } from 'lit';
import { renderDesktopRows } from './rows.js';

describe('renderDesktopRows', () => {
  it('should render one row per model row', () => {
    const host = document.createElement('div');
    render(html`${renderDesktopRows([{ keys: [] }, { keys: [] }])}`, host);
    expect(host.querySelectorAll('[data-row-index]')).toHaveLength(2);
  });

  it('should assign sequential data-row-index values', () => {
    const host = document.createElement('div');
    render(html`${renderDesktopRows([{ keys: [] }, { keys: [] }, { keys: [] }])}`, host);
    const rows = host.querySelectorAll('[data-row-index]');
    expect(rows[0].getAttribute('data-row-index')).toBe('0');
    expect(rows[2].getAttribute('data-row-index')).toBe('2');
  });
});
