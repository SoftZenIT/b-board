import { describe, it, expect } from 'vitest';
import './benin-keyboard.js'; // Imports and registers the element

describe('BeninKeyboard Custom Element', () => {
  it('registers <benin-keyboard> with the browser', () => {
    const el = document.createElement('benin-keyboard');
    expect(el).toBeInstanceOf(HTMLElement);
    expect(el.constructor.name).toBe('BeninKeyboard');
  });

  it('initializes default state on creation', () => {
    const el = document.createElement('benin-keyboard') as any;
    expect(el.language).toBe('yoruba'); // default
  });

  it('reflects language property to attribute', () => {
    const el = document.createElement('benin-keyboard') as any;
    el.language = 'fon-adja';
    expect(el.getAttribute('language')).toBe('fon-adja');
  });

  it('updates language property when attribute changes', () => {
    const el = document.createElement('benin-keyboard') as any;
    el.setAttribute('language', 'baatonum');
    expect(el.language).toBe('baatonum');
  });

  it('ignores invalid language attributes', () => {
    const el = document.createElement('benin-keyboard') as any;
    el.language = 'yoruba';
    el.setAttribute('language', 'invalid-lang');
    expect(el.language).toBe('yoruba'); // Remains unchanged
  });

  it('exposes attach and detach methods', () => {
    const el = document.createElement('benin-keyboard') as any;
    const target = document.createElement('input');

    // Just verifying existence and signature for now
    expect(typeof el.attach).toBe('function');
    expect(typeof el.detach).toBe('function');

    expect(() => el.attach(target)).not.toThrow();
  });
});
