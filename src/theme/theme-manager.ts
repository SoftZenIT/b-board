import type { ThemeId } from '../public/types.js';

export type EffectiveTheme = 'light' | 'dark';

export interface ThemeChangeDetail {
  theme: ThemeId;
  effectiveTheme: EffectiveTheme;
}

export type ThemeChangeListener = (detail: ThemeChangeDetail) => void;

/**
 * Manages theme detection and switching logic.
 */
export class ThemeManager {
  private _theme: ThemeId = 'auto';
  private _listeners: Set<ThemeChangeListener> = new Set();
  private _mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

  constructor(initialTheme: ThemeId = 'auto') {
    this._theme = initialTheme;
    this._mediaQuery.addEventListener('change', this._handleSystemChange);
  }

  get theme(): ThemeId {
    return this._theme;
  }

  set theme(value: ThemeId) {
    if (this._theme !== value) {
      this._theme = value;
      this._notify();
    }
  }

  get effectiveTheme(): EffectiveTheme {
    if (this._theme === 'auto') {
      return this._mediaQuery.matches ? 'dark' : 'light';
    }
    return this._theme as EffectiveTheme;
  }

  subscribe(listener: ThemeChangeListener): () => void {
    this._listeners.add(listener);
    // Notify immediately with current state
    listener({
      theme: this._theme,
      effectiveTheme: this.effectiveTheme,
    });
    return () => this._listeners.delete(listener);
  }

  destroy(): void {
    this._mediaQuery.removeEventListener('change', this._handleSystemChange);
    this._listeners.clear();
  }

  private _handleSystemChange = (): void => {
    if (this._theme === 'auto') {
      this._notify();
    }
  };

  private _notify(): void {
    const detail: ThemeChangeDetail = {
      theme: this._theme,
      effectiveTheme: this.effectiveTheme,
    };
    this._listeners.forEach((l) => l(detail));
  }
}
