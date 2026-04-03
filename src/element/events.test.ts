import { describe, it, expect, vi } from 'vitest';
import { dispatchBBoardEvent } from './events.js';

describe('Event Emitter', () => {
  it('dispatches bboard-ready event', () => {
    const el = document.createElement('div');
    const listener = vi.fn();
    el.addEventListener('bboard-ready', listener);

    dispatchBBoardEvent(el, 'bboard-ready', { state: 'ready' });

    expect(listener).toHaveBeenCalled();
    const event = listener.mock.calls[0][0] as CustomEvent;
    expect(event.detail.state).toBe('ready');
    expect(event.bubbles).toBe(true);
    expect(event.composed).toBe(true);
  });

  it('dispatches bboard-language-change event', () => {
    const el = document.createElement('div');
    const listener = vi.fn();
    el.addEventListener('bboard-language-change', listener);

    dispatchBBoardEvent(el, 'bboard-language-change', { languageId: 'yoruba' });

    expect(listener).toHaveBeenCalled();
    const event = listener.mock.calls[0][0] as CustomEvent;
    expect(event.detail.languageId).toBe('yoruba');
  });

  it('dispatches bboard-error event', () => {
    const el = document.createElement('div');
    const listener = vi.fn();
    el.addEventListener('bboard-error', listener);

    dispatchBBoardEvent(el, 'bboard-error', { severity: 'fatal', message: 'Test error' });

    expect(listener).toHaveBeenCalled();
    const event = listener.mock.calls[0][0] as CustomEvent;
    expect(event.detail.severity).toBe('fatal');
    expect(event.detail.message).toBe('Test error');
  });
});
