import {
  isLanguageId,
  type LanguageId,
  isThemeId,
  type ThemeId,
  isLayoutVariantId,
  type LayoutVariantId,
  type TargetKind,
} from '../public/types.js';
import { dispatchBBoardEvent } from './events.js';
import { ThemeManager } from '../theme/theme-manager.js';

export class BeninKeyboard extends HTMLElement {
  private _language: LanguageId = 'yoruba';
  private _themeManager: ThemeManager;
  private _layoutVariant: LayoutVariantId = 'mobile-default';
  private _open = false;
  private _disabled = false;
  private _showPhysicalEcho = false;
  private _activeTargetKind: TargetKind | null = null;

  constructor() {
    super();
    this._themeManager = new ThemeManager();
    this._themeManager.subscribe((detail) => {
      this._applyTheme(detail.effectiveTheme);
      dispatchBBoardEvent(this, 'bboard-theme-change', detail);
    });
  }

  static get observedAttributes(): string[] {
    return ['language', 'theme', 'layout-variant', 'open', 'disabled', 'show-physical-echo'];
  }

  connectedCallback(): void {
    // Apply initial theme
    this._applyTheme(this._themeManager.effectiveTheme);
    // Engine initialization will happen here
  }

  disconnectedCallback(): void {
    this._themeManager.destroy();
  }

  attributeChangedCallback(name: string, oldValue: string | null, newValue: string | null): void {
    if (oldValue === newValue) return;

    switch (name) {
      case 'language':
        if (isLanguageId(newValue)) this.language = newValue;
        break;
      case 'theme':
        if (isThemeId(newValue)) this.theme = newValue;
        break;
      case 'layout-variant':
        if (isLayoutVariantId(newValue)) this.layoutVariant = newValue;
        break;
      case 'open':
        this.open = newValue !== null;
        break;
      case 'disabled':
        this.disabled = newValue !== null;
        break;
      case 'show-physical-echo':
        this.showPhysicalEcho = newValue !== null;
        break;
    }
  }

  get language(): LanguageId {
    return this._language;
  }

  set language(value: LanguageId) {
    if (isLanguageId(value) && this._language !== value) {
      this._language = value;
      this.setAttribute('language', value);
      dispatchBBoardEvent(this, 'bboard-language-change', { languageId: value });
    }
  }

  get theme(): ThemeId {
    return this._themeManager.theme;
  }

  /**
   * The actual theme currently applied (light or dark).
   */
  get effectiveTheme(): 'light' | 'dark' {
    return this._themeManager.effectiveTheme;
  }

  set theme(value: ThemeId) {
    if (isThemeId(value)) {
      this._themeManager.theme = value;
      this.setAttribute('theme', value);
    }
  }

  private _applyTheme(effectiveTheme: 'light' | 'dark'): void {
    if (effectiveTheme === 'dark') {
      this.classList.add('theme-dark');
    } else {
      this.classList.remove('theme-dark');
    }
  }

  get layoutVariant(): LayoutVariantId {
    return this._layoutVariant;
  }

  set layoutVariant(value: LayoutVariantId) {
    if (isLayoutVariantId(value) && this._layoutVariant !== value) {
      this._layoutVariant = value;
      this.setAttribute('layout-variant', value);
    }
  }

  get open(): boolean {
    return this._open;
  }

  set open(value: boolean) {
    if (this._open !== value) {
      this._open = value;
      if (value) {
        this.setAttribute('open', '');
      } else {
        this.removeAttribute('open');
      }
    }
  }

  get disabled(): boolean {
    return this._disabled;
  }

  set disabled(value: boolean) {
    if (this._disabled !== value) {
      this._disabled = value;
      if (value) {
        this.setAttribute('disabled', '');
      } else {
        this.removeAttribute('disabled');
      }
    }
  }

  get showPhysicalEcho(): boolean {
    return this._showPhysicalEcho;
  }

  set showPhysicalEcho(value: boolean) {
    if (this._showPhysicalEcho !== value) {
      this._showPhysicalEcho = value;
      if (value) {
        this.setAttribute('show-physical-echo', '');
      } else {
        this.removeAttribute('show-physical-echo');
      }
    }
  }

  get activeTargetKind(): TargetKind | null {
    return this._activeTargetKind;
  }

  /**
   * Sets the keyboard theme.
   * @param value The theme ID ('light', 'dark', or 'auto').
   */
  setTheme(value: ThemeId): void {
    this.theme = value;
  }

  /**
   * Attaches the keyboard to a specific DOM target.
   * @param target The HTML element to receive input.
   */
  attach(target: HTMLElement): void {
    // Will delegate to engine.setSubstates({ attachment: 'attached' })
    // and dispatcher logic once fully wired.
    console.debug('[BeninKeyboard] attach() called', target);
  }

  /**
   * Detaches the keyboard from the current target.
   */
  detach(): void {
    console.debug('[BeninKeyboard] detach() called');
  }

  /**
   * Opens the virtual keyboard UI.
   */
  openKeyboard(): void {
    console.debug('[BeninKeyboard] openKeyboard() called');
  }

  /**
   * Closes the virtual keyboard UI.
   */
  closeKeyboard(): void {
    console.debug('[BeninKeyboard] closeKeyboard() called');
  }
}

if (!customElements.get('benin-keyboard')) {
  customElements.define('benin-keyboard', BeninKeyboard);
}
