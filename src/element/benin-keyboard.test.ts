import { describe, it, expect, vi } from 'vitest';
import './benin-keyboard.js';

describe('BeninKeyboard Custom Element', () => {
  it('registers <benin-keyboard> with the browser', () => {
    const el = document.createElement('benin-keyboard');
    expect(el).toBeInstanceOf(HTMLElement);
    expect(el.tagName.toLowerCase()).toBe('benin-keyboard');
  });

  it('initializes default state on creation', () => {
    const el = document.createElement('benin-keyboard') as any;
    expect(el.language).toBe('yoruba');
  });

  it('updates language property when attribute changes', async () => {
    const el = document.createElement('benin-keyboard') as any;
    document.body.appendChild(el);
    el.setAttribute('language', 'baatonum');

    await el.updateComplete;

    expect(el.language).toBe('baatonum');
    document.body.removeChild(el);
  });

  it('exposes attach and detach methods', () => {
    const el = document.createElement('benin-keyboard') as any;
    const target = document.createElement('input');

    expect(typeof el.attach).toBe('function');
    expect(typeof el.detach).toBe('function');

    expect(() => el.attach(target)).not.toThrow();
  });

  it('should render the canonical desktop layout row count', async () => {
    const el = document.createElement('benin-keyboard') as any;
    el.layoutVariant = 'desktop-azerty';
    document.body.appendChild(el);
    await el.updateComplete;

    expect(el.shadowRoot.querySelectorAll('[data-row-index]')).toHaveLength(4);
    document.body.removeChild(el);
  });

  it('should attach and remove global keyboard listeners safely', () => {
    const addSpy = vi.spyOn(window, 'addEventListener');
    const removeSpy = vi.spyOn(window, 'removeEventListener');
    const el = document.createElement('benin-keyboard') as any;
    document.body.appendChild(el);
    document.body.removeChild(el);

    expect(addSpy).toHaveBeenCalledWith('keydown', expect.any(Function));
    expect(removeSpy).toHaveBeenCalledWith('keydown', expect.any(Function));
  });
});
