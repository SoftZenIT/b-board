import { LitElement, html, css } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import {
  type LanguageId,
  type ThemeId,
  type LayoutVariantId,
  type ModifierDisplayMode,
} from '../public/types.js';
import { dispatchBBoardEvent } from './events.js';
import { ThemeManager } from '../theme/theme-manager.js';

@customElement('benin-keyboard')
export class BeninKeyboard extends LitElement {
  @property({ type: String }) language: LanguageId = 'yoruba';
  @property({ type: String }) theme: ThemeId = 'auto';
  @property({ type: String, attribute: 'layout-variant' }) layoutVariant: LayoutVariantId =
    'mobile-default';
  @property({ type: Boolean, reflect: true }) open = false;
  @property({ type: Boolean, reflect: true }) disabled = false;
  @property({ type: Boolean, attribute: 'show-physical-echo' }) showPhysicalEcho = false;
  @property({ type: String, attribute: 'modifier-display-mode' })
  modifierDisplayMode: ModifierDisplayMode = 'transition';

  @state() private _physicalKeysHeld = new Set<string>();

  private _themeManager!: ThemeManager;

  static styles = css`
    :host {
      display: block;
      width: 100%;
      user-select: none;
      -webkit-user-select: none;
      font-family: var(--bboard-font-family);
    }

    .keyboard-container {
      background: var(--bboard-color-surface-base);
      padding: var(--bboard-space-padding);
      border-radius: var(--bboard-size-radius-lg);
      display: flex;
      flex-direction: column;
      gap: var(--bboard-space-gap-row);
      max-width: 1000px;
      margin: 0 auto;
    }

    .keyboard-row {
      display: flex;
      justify-content: center;
      gap: var(--bboard-space-gap-key);
    }

    .key {
      background: var(--bboard-color-surface-key);
      color: var(--bboard-color-text-primary);
      border-radius: var(--bboard-size-radius-md);
      height: var(--bboard-size-key-height);
      flex: 1 1 var(--bboard-size-key-width);
      max-width: 60px; /* Base width constraint */
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: var(--bboard-font-size-base);
      font-weight: var(--bboard-font-weight-label);
      box-shadow: var(--bboard-shadow-key);
      cursor: pointer;
      position: relative;
    }

    /* Active state for keys */
    .key:active,
    .key.active {
      background: var(--bboard-color-surface-active);
      box-shadow: var(--bboard-shadow-key-pressed);
      transform: translateY(1px);
    }

    /* Wide keys */
    .key.wide-2x {
      flex: 2 1 calc(var(--bboard-size-key-width) * 2);
      max-width: 120px;
    }
    .key.wide-3x {
      flex: 3 1 calc(var(--bboard-size-key-width) * 3);
      max-width: 180px;
    }
    .key.space {
      flex: 6 1 auto;
      max-width: 400px;
    }

    /* Action Keys */
    .key.action-key {
      background: var(--bboard-color-surface-special);
    }

    .key.action-primary {
      background: var(--bboard-color-primary-base);
      color: var(--bboard-color-text-on-primary);
    }

    .key.action-primary:active,
    .key.action-primary.active {
      background: var(--bboard-color-primary-active);
    }

    .key svg {
      width: 20px;
      height: 20px;
      fill: currentColor;
    }

    .secondary-label {
      position: absolute;
      top: 4px;
      right: 6px;
      font-size: var(--bboard-font-size-sm);
      color: var(--bboard-color-text-secondary);
    }

    .key.action-primary .secondary-label {
      color: rgba(255, 255, 255, 0.7);
    }

    /* Focus & Disabled */
    .key:focus-visible {
      outline: 2px solid var(--bboard-color-focus-ring);
      outline-offset: 2px;
    }

    .key.disabled {
      opacity: var(--bboard-opacity-disabled);
      pointer-events: none;
      cursor: not-allowed;
    }
  `;

  constructor() {
    super();
    this._themeManager = new ThemeManager();
    this._themeManager.subscribe((detail) => {
      this._applyTheme(detail.effectiveTheme);
      dispatchBBoardEvent(this, 'bboard-theme-change', detail);
    });
  }

  connectedCallback() {
    super.connectedCallback();
    this._applyTheme(this._themeManager.effectiveTheme);
    window.addEventListener('keydown', this._handleKeydown);
    window.addEventListener('keyup', this._handleKeyup);
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    this._themeManager.destroy();
    window.removeEventListener('keydown', this._handleKeydown);
    window.removeEventListener('keyup', this._handleKeyup);
  }

  protected updated(changedProperties: Map<string | number | symbol, unknown>) {
    if (changedProperties.has('language')) {
      dispatchBBoardEvent(this, 'bboard-language-change', { languageId: this.language });
    }
    if (changedProperties.has('theme')) {
      this._themeManager.theme = this.theme;
    }
  }

  private _applyTheme(effectiveTheme: 'light' | 'dark'): void {
    if (effectiveTheme === 'dark') {
      this.classList.add('theme-dark');
    } else {
      this.classList.remove('theme-dark');
    }
  }

  get effectiveTheme(): 'light' | 'dark' {
    return this._themeManager.effectiveTheme;
  }

  setTheme(value: ThemeId): void {
    this.theme = value;
  }

  attach(target: HTMLElement): void {
    console.debug('[BeninKeyboard] attach() called', target);
  }

  detach(): void {
    console.debug('[BeninKeyboard] detach() called');
  }

  openKeyboard(): void {
    this.open = true;
  }

  closeKeyboard(): void {
    this.open = false;
  }

  private _handleKeydown = (e: KeyboardEvent) => {
    const code = e.code.toLowerCase().replace('key', '');
    if (this._physicalKeysHeld.has(code)) return;

    // We create a new Set so Lit recognizes the state change
    const newKeys = new Set(this._physicalKeysHeld);
    newKeys.add(code);
    this._physicalKeysHeld = newKeys;
  };

  private _handleKeyup = (e: KeyboardEvent) => {
    const code = e.code.toLowerCase().replace('key', '');
    const newKeys = new Set(this._physicalKeysHeld);
    newKeys.delete(code);
    this._physicalKeysHeld = newKeys;
  };

  render() {
    // Mock layout for initial rendering foundation
    const rows = [
      ['q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p'],
      ['a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l'],
      ['{shift}', 'z', 'x', 'c', 'v', 'b', 'n', 'm', '{backspace}'],
      ['{altgr}', '{space}', '{enter}'],
    ];

    return html`
      <div class="keyboard-container">
        ${rows.map(
          (row) => html` <div class="keyboard-row">${row.map((key) => this.renderKey(key))}</div> `
        )}
      </div>
    `;
  }

  private renderKey(key: string) {
    let classes = 'key';
    let label: unknown = key;
    let secondaryLabel = '';

    if (key.length === 1 && this.modifierDisplayMode === 'hint') {
      secondaryLabel = key.toUpperCase();
    }

    if (key === '{space}') {
      classes += ' space';
      label = '';
    } else if (key === '{shift}') {
      classes += ' wide-2x action-key';
      label = html`<svg viewBox="0 0 24 24"><path d="M12 4l-8 10h5v6h6v-6h5z" /></svg>`;
    } else if (key === '{backspace}') {
      classes += ' wide-2x action-key';
      label = html`<svg viewBox="0 0 24 24">
        <path
          d="M21 4H8l-7 8 7 8h13V4zM18 15l-1.4 1.4-2.6-2.6-2.6 2.6L10 15l2.6-2.6L10 9.8l1.4-1.4 2.6 2.6 2.6-2.6L18 9.8l-2.6 2.6L18 15z"
        />
      </svg>`;
    } else if (key === '{enter}') {
      classes += ' wide-2x action-key action-primary';
      label = html`<svg viewBox="0 0 24 24">
        <path d="M19 7v4H5.83l3.58-3.59L8 6l-6 6 6 6 1.41-1.41L5.83 13H21V7z" />
      </svg>`;
    } else if (key === '{altgr}') {
      classes += ' wide-2x action-key';
      label = 'AltGr';
    }

    if (this.disabled) {
      classes += ' disabled';
    }

    // Check if held
    if (this.showPhysicalEcho && this._physicalKeysHeld.has(key)) {
      classes += ' active';
    }

    return html`
      <div
        class="${classes}"
        data-key="${key}"
        tabindex="${this.disabled ? -1 : 0}"
        aria-disabled="${this.disabled ? 'true' : 'false'}"
        role="button"
      >
        <span>${label}</span>
        ${secondaryLabel ? html`<span class="secondary-label">${secondaryLabel}</span>` : ''}
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'benin-keyboard': BeninKeyboard;
  }
}
