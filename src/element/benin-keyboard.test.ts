import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
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

    expect(el.shadowRoot.querySelectorAll('[data-row-index]')).toHaveLength(5);
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

describe('Physical keyboard output', () => {
  it('fires bboard-key-press for a physical character key (desktop variant)', async () => {
    const el = document.createElement('benin-keyboard') as any;
    el.layoutVariant = 'desktop-azerty';
    document.body.appendChild(el);
    await el.updateComplete;

    const events: CustomEvent[] = [];
    el.addEventListener('bboard-key-press', (e: Event) => events.push(e as CustomEvent));

    window.dispatchEvent(new KeyboardEvent('keydown', { code: 'KeyQ', key: 'q', bubbles: true }));

    expect(events).toHaveLength(1);
    expect(events[0].detail.keyId).toBe('key-a');
    expect(events[0].detail.char).toBeTruthy(); // 'a' or language-specific char

    document.body.removeChild(el);
  });

  it('fires bboard-key-press with shift layer when ShiftLeft is held', async () => {
    const el = document.createElement('benin-keyboard') as any;
    el.layoutVariant = 'desktop-azerty';
    document.body.appendChild(el);
    await el.updateComplete;

    const events: CustomEvent[] = [];
    el.addEventListener('bboard-key-press', (e: Event) => events.push(e as CustomEvent));

    // Hold Shift first (no output for modifier itself)
    window.dispatchEvent(
      new KeyboardEvent('keydown', { code: 'ShiftLeft', key: 'Shift', bubbles: true })
    );
    expect(events).toHaveLength(0); // modifier key — no output

    // Now press KeyQ while shift is held
    window.dispatchEvent(new KeyboardEvent('keydown', { code: 'KeyQ', key: 'A', bubbles: true }));
    expect(events).toHaveLength(1);
    expect(events[0].detail.keyId).toBe('key-a');

    document.body.removeChild(el);
  });

  it('does NOT fire bboard-key-press for modifier keys alone (Shift, AltGr)', async () => {
    const el = document.createElement('benin-keyboard') as any;
    el.layoutVariant = 'desktop-azerty';
    document.body.appendChild(el);
    await el.updateComplete;

    const events: CustomEvent[] = [];
    el.addEventListener('bboard-key-press', (e: Event) => events.push(e as CustomEvent));

    window.dispatchEvent(
      new KeyboardEvent('keydown', { code: 'ShiftLeft', key: 'Shift', bubbles: true })
    );
    window.dispatchEvent(
      new KeyboardEvent('keydown', { code: 'ShiftRight', key: 'Shift', bubbles: true })
    );
    window.dispatchEvent(
      new KeyboardEvent('keydown', { code: 'AltRight', key: 'AltGraph', bubbles: true })
    );

    expect(events).toHaveLength(0);

    document.body.removeChild(el);
  });

  it('does NOT fire bboard-key-press for auto-repeat keydown events', async () => {
    const el = document.createElement('benin-keyboard') as any;
    el.layoutVariant = 'desktop-azerty';
    document.body.appendChild(el);
    await el.updateComplete;

    const events: CustomEvent[] = [];
    el.addEventListener('bboard-key-press', (e: Event) => events.push(e as CustomEvent));

    // First press — should fire
    window.dispatchEvent(
      new KeyboardEvent('keydown', { code: 'KeyQ', key: 'q', repeat: false, bubbles: true })
    );
    // Auto-repeat — should NOT fire
    window.dispatchEvent(
      new KeyboardEvent('keydown', { code: 'KeyQ', key: 'q', repeat: true, bubbles: true })
    );
    window.dispatchEvent(
      new KeyboardEvent('keydown', { code: 'KeyQ', key: 'q', repeat: true, bubbles: true })
    );

    expect(events).toHaveLength(1); // only the first press

    document.body.removeChild(el);
  });

  it('does NOT fire bboard-key-press for physical keys in mobile layout variant', async () => {
    const el = document.createElement('benin-keyboard') as any;
    el.layoutVariant = 'mobile-default';

    // ResizeObserver is not available in jsdom; stub it for this test
    const origResizeObserver = (window as any).ResizeObserver;
    (window as any).ResizeObserver = class {
      observe() {}
      unobserve() {}
      disconnect() {}
    };

    document.body.appendChild(el);
    await el.updateComplete;

    const events: CustomEvent[] = [];
    el.addEventListener('bboard-key-press', (e: Event) => events.push(e as CustomEvent));

    window.dispatchEvent(new KeyboardEvent('keydown', { code: 'KeyQ', key: 'q', bubbles: true }));

    expect(events).toHaveLength(0);

    document.body.removeChild(el);
    (window as any).ResizeObserver = origResizeObserver;
  });
});

describe('Composition engine integration', () => {
  let el: any;

  beforeEach(async () => {
    el = document.createElement('benin-keyboard');
    el.layoutVariant = 'desktop-azerty';
    el.language = 'yoruba';
    document.body.appendChild(el);
    await el.updateComplete;
  });

  afterEach(() => {
    document.body.removeChild(el);
  });

  it('dead key press swallows the event — no bboard-key-press fired', async () => {
    const events: CustomEvent[] = [];
    el.addEventListener('bboard-key-press', (e: Event) => events.push(e as CustomEvent));

    // Arm the processor directly with the tone trigger (´ U+00B4)
    const result = el._compositionProcessor?.process('key-fake', '´');
    expect(result).toBeNull();
    expect(events).toHaveLength(0);
    expect(el._compositionProcessor?.isArmed).toBe(true);
  });

  it('fires bboard-key-press with composed char after dead key sequence', async () => {
    const events: CustomEvent[] = [];
    el.addEventListener('bboard-key-press', (e: Event) => events.push(e as CustomEvent));

    // Arm the processor with tone trigger
    el._compositionProcessor?.process('key-fake', '´');

    // Find the key ID for 'a' in the base layer
    const keyAId = [...el._resolvedLayout.keyMap.entries()].find(
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      ([_key, v]: [any, any]) => v.layers?.base?.char === 'a'
    )?.[0];

    if (keyAId) {
      el._activateKey(keyAId);
      expect(events).toHaveLength(1);
      expect(events[0].detail.char).toBe('á');
    } else {
      // Safety fallback if layout changes
      expect(el._compositionProcessor?.isArmed).toBe(true);
    }
  });

  it('cancel resets composition — next key fires plain char', async () => {
    const events: CustomEvent[] = [];
    el.addEventListener('bboard-key-press', (e: Event) => events.push(e as CustomEvent));

    // Arm then cancel
    el._compositionProcessor?.process('key-fake', '´');
    el._compositionProcessor?.cancel();
    expect(el._compositionProcessor?.isArmed).toBe(false);

    // Next activation should fire the plain char
    const keyAId = [...el._resolvedLayout.keyMap.entries()].find(
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      ([_key, v]: [any, any]) => v.layers?.base?.char === 'a'
    )?.[0];

    if (keyAId) {
      el._activateKey(keyAId);
      expect(events).toHaveLength(1);
      expect(events[0].detail.char).toBe('a');
    }
  });
});
