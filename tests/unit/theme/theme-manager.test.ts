import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ThemeManager } from '../../../src/theme/theme-manager.js';

describe('ThemeManager', () => {
  let mediaQuery: { matches: boolean; addEventListener: any; removeEventListener: any };
  let mediaQueryListeners: ((e: any) => void)[] = [];

  beforeEach(() => {
    mediaQueryListeners = [];
    mediaQuery = {
      matches: false,
      addEventListener: vi.fn().mockImplementation((event, listener) => {
        if (event === 'change') mediaQueryListeners.push(listener);
      }),
      removeEventListener: vi.fn(),
    };
    window.matchMedia = vi.fn().mockReturnValue(mediaQuery);
  });

  it('initializes with default auto theme', () => {
    const manager = new ThemeManager();
    expect(manager.theme).toBe('auto');
    expect(manager.effectiveTheme).toBe('light');
  });

  it('detects dark mode from system preference', () => {
    mediaQuery.matches = true;
    const manager = new ThemeManager();
    expect(manager.effectiveTheme).toBe('dark');
  });

  it('switches to explicit themes', () => {
    const manager = new ThemeManager();
    manager.theme = 'dark';
    expect(manager.theme).toBe('dark');
    expect(manager.effectiveTheme).toBe('dark');

    manager.theme = 'light';
    expect(manager.theme).toBe('light');
    expect(manager.effectiveTheme).toBe('light');
  });

  it('notifies subscribers on theme change', () => {
    const manager = new ThemeManager();
    const listener = vi.fn();
    manager.subscribe(listener);

    manager.theme = 'dark';
    expect(listener).toHaveBeenCalledWith({ theme: 'dark', effectiveTheme: 'dark' });
  });

  it('responds to system theme changes in auto mode', () => {
    const manager = new ThemeManager();
    const listener = vi.fn();
    manager.subscribe(listener);

    // Simulate system change to dark
    mediaQuery.matches = true;
    mediaQueryListeners.forEach((l) => l({ matches: true }));

    expect(listener).toHaveBeenCalledWith({ theme: 'auto', effectiveTheme: 'dark' });
  });

  it('does not notify on system change if not in auto mode', () => {
    const manager = new ThemeManager('light');
    const listener = vi.fn();
    manager.subscribe(listener);

    // Clear the initial call from subscribe
    listener.mockClear();

    mediaQueryListeners.forEach((l) => l({ matches: true }));
    expect(listener).not.toHaveBeenCalled();
  });
});
