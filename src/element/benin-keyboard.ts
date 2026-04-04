import { LitElement, html, css } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import {
  type LanguageId,
  type ThemeId,
  type LayoutVariantId,
  type ModifierDisplayMode,
  isLayoutVariantId,
  isLanguageId,
} from '../public/types.js';
import type { ResolvedLayout } from '../public/index.js';
import { dispatchBBoardEvent } from './events.js';
import { ThemeManager } from '../theme/theme-manager.js';
import { createDataLoader } from '../data/loader.js';
import { createLayoutResolver } from '../data/layout-resolver.js';
import { createDesktopRenderModel } from '../ui/desktop/render-model.js';
import { renderDesktopRows } from '../ui/desktop/rows.js';
import { createDesktopState } from '../ui/state/desktop-state.js';
import { mapPhysicalCodeToLogicalKey } from '../ui/desktop/physical-key-map.js';

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

  private _themeManager!: ThemeManager;
  private readonly _desktopState = createDesktopState();
  private _resolvedLayout: ResolvedLayout | null = null;
  private _dataLoadPromise: Promise<void> | undefined;
  private _layoutKey = '';

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

    .bboard-row {
      display: flex;
      justify-content: center;
      gap: var(--bboard-space-gap-key);
    }

    .bboard-key {
      flex: 0 0 calc(var(--bboard-size-key-width) * var(--bboard-key-width-multiplier, 1));
      min-height: var(--bboard-size-key-height);
      border-radius: var(--bboard-size-radius-md);
      background: var(--bboard-color-surface-key);
      color: var(--bboard-color-text-primary);
      box-shadow: var(--bboard-shadow-key);
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      font-size: var(--bboard-font-size-base);
      font-weight: var(--bboard-font-weight-label);
      border: none;
      cursor: pointer;
      position: relative;
    }

    .bboard-key.is-active {
      background: var(--bboard-color-surface-active);
      box-shadow: var(--bboard-shadow-key-pressed);
      transform: translateY(1px);
    }

    .bboard-key.is-disabled {
      opacity: var(--bboard-opacity-disabled);
      pointer-events: none;
    }

    .bboard-key:focus-visible,
    .bboard-key.is-focused {
      outline: 2px solid var(--bboard-color-focus-ring);
      outline-offset: 2px;
    }

    .bboard-key__secondary {
      position: absolute;
      top: 4px;
      right: 6px;
      font-size: var(--bboard-font-size-sm);
      color: var(--bboard-color-text-secondary);
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

  protected override async scheduleUpdate(): Promise<unknown> {
    const newKey = `${this.layoutVariant}:${this.language}`;
    if (newKey !== this._layoutKey) {
      this._layoutKey = newKey;
      this._dataLoadPromise = this._loadLayout(newKey);
    }
    await this._dataLoadPromise;
    return super.scheduleUpdate();
  }

  private async _loadLayout(expectedKey: string): Promise<void> {
    if (!isLayoutVariantId(this.layoutVariant) || !isLanguageId(this.language)) {
      return;
    }
    const loader = createDataLoader();
    const [shape, profile, catalog] = await Promise.all([
      loader.loadLayoutShape(this.layoutVariant),
      loader.loadLanguageProfile(this.language),
      loader.loadCompositionRules(),
    ]);
    if (`${this.layoutVariant}:${this.language}` === expectedKey) {
      const resolver = createLayoutResolver();
      this._resolvedLayout = resolver.resolve(
        shape,
        profile,
        catalog,
        this.layoutVariant,
        this.language
      );
    }
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
    this._desktopState.pressPhysicalCode(e.code);
    if (this.showPhysicalEcho) {
      this.requestUpdate();
    }
  };

  private _handleKeyup = (e: KeyboardEvent) => {
    this._desktopState.releasePhysicalCode(e.code);
    if (this.showPhysicalEcho) {
      this.requestUpdate();
    }
  };

  render() {
    if (this._resolvedLayout === null) {
      return html`<div class="keyboard-container" aria-busy="true"></div>`;
    }

    const snapshot = this._desktopState.snapshot();
    const heldKeyIds: Set<string> = new Set();
    for (const code of snapshot.heldPhysicalKeys) {
      const keyId = mapPhysicalCodeToLogicalKey(code);
      if (keyId !== null) heldKeyIds.add(keyId);
    }

    const model = createDesktopRenderModel(this._resolvedLayout, {
      activeLayer: snapshot.activeLayer,
      modifierDisplayMode: this.modifierDisplayMode,
      heldPhysicalKeys: this.showPhysicalEcho ? heldKeyIds : new Set(),
      hiddenKeys: snapshot.hiddenKeys,
      disabledKeys: snapshot.disabledKeys,
      focusedKeyId: snapshot.focusedKeyId,
    });

    return html`<div class="keyboard-container">${renderDesktopRows(model.rows)}</div>`;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'benin-keyboard': BeninKeyboard;
  }
}
