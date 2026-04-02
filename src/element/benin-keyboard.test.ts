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
});
