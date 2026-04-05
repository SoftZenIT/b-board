import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';
import { createKeyId } from '../../public/index.js';
import { createMobileState } from './mobile-state.js';

describe('createMobileState', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  it('starts with base layer, sm bucket, no long-press', () => {
    const state = createMobileState();
    const snap = state.snapshot();
    expect(snap.activeLayer).toBe('base');
    expect(snap.widthBucket).toBe('sm');
    expect(snap.longPressKeyId).toBeNull();
    expect(snap.longPressVisible).toBe(false);
  });

  it('setActiveLayer changes the active layer', () => {
    const state = createMobileState();
    state.setActiveLayer('shift');
    expect(state.snapshot().activeLayer).toBe('shift');
  });

  it('setWidthBucket updates the bucket', () => {
    const state = createMobileState();
    state.setWidthBucket('xs');
    expect(state.snapshot().widthBucket).toBe('xs');
  });

  it('startLongPress begins timer; showLongPress fires after 300ms', () => {
    const state = createMobileState();
    const onShow = vi.fn();
    state.startLongPress(createKeyId('key-a'), onShow);
    expect(state.snapshot().longPressKeyId).toBe('key-a');
    expect(state.snapshot().longPressVisible).toBe(false);
    vi.advanceTimersByTime(300);
    expect(onShow).toHaveBeenCalledOnce();
  });

  it('cancelLongPress clears timer and resets state', () => {
    const state = createMobileState();
    const onShow = vi.fn();
    state.startLongPress(createKeyId('key-a'), onShow);
    state.cancelLongPress();
    vi.advanceTimersByTime(300);
    expect(onShow).not.toHaveBeenCalled();
    expect(state.snapshot().longPressKeyId).toBeNull();
  });

  it('setLongPressVisible sets visibility', () => {
    const state = createMobileState();
    state.startLongPress(createKeyId('key-a'), () => {});
    vi.advanceTimersByTime(300);
    state.setLongPressVisible(true);
    expect(state.snapshot().longPressVisible).toBe(true);
  });

  it('setLongPressSelectedIndex updates the selected index', () => {
    const state = createMobileState();
    state.setLongPressSelectedIndex(2);
    expect(state.snapshot().longPressSelectedIndex).toBe(2);
  });

  it('dismissLongPress hides popup and resets keyId', () => {
    const state = createMobileState();
    state.startLongPress(createKeyId('key-a'), () => {});
    vi.advanceTimersByTime(300);
    state.setLongPressVisible(true);
    state.dismissLongPress();
    const snap = state.snapshot();
    expect(snap.longPressVisible).toBe(false);
    expect(snap.longPressKeyId).toBeNull();
  });
});
