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
import { type KeyId, type LayerId, createKeyId } from '../public/index.js';
import type { ResolvedLayout } from '../public/index.js';
import { dispatchBBoardEvent } from './events.js';
import { ThemeManager } from '../theme/theme-manager.js';
import { createDataLoader } from '../data/loader.js';
import { createLayoutResolver } from '../data/layout-resolver.js';
import { createDesktopRenderModel } from '../ui/desktop/render-model.js';
import { renderDesktopRows } from '../ui/desktop/rows.js';
import { createDesktopState } from '../ui/state/desktop-state.js';
import { mapPhysicalCodeToLogicalKey } from '../ui/desktop/physical-key-map.js';
import { createFocusController } from '../ui/state/focus-controller.js';

/**
 * Per-layer key IDs follow the convention: base = `key-{name}`, shift = `key-{name}-shift`, altGr = `key-{name}-altgr`.
 * This helper derives the modifier key IDs for a given layer so Shift/AltGr detection works in all layers.
 */
function getModifierKeyIds(layer: LayerId): {
  shiftKey: KeyId;
  shiftRightKey: KeyId;
  altGrKey: KeyId;
} {
  const s = layer === 'base' ? '' : `-${layer}`;
  return {
    shiftKey: createKeyId(`key-shift${s}`),
    shiftRightKey: createKeyId(`key-shift-right${s}`),
    altGrKey: createKeyId(`key-altgr${s}`),
  };
}

@customElement('benin-keyboard')
export class BeninKeyboard extends LitElement {
  @property({ type: String }) language: LanguageId = 'yoruba';
  @property({ type: String }) theme: ThemeId = 'auto';
  @property({ type: String, attribute: 'layout-variant' }) layoutVariant: LayoutVariantId =
    'desktop-azerty';
  @property({ type: Boolean, reflect: true }) open = true;
  @property({ type: Boolean, reflect: true }) disabled = false;
  @property({ type: Boolean, attribute: 'show-physical-echo' }) showPhysicalEcho = false;
  @property({ type: String, attribute: 'modifier-display-mode' })
  modifierDisplayMode: ModifierDisplayMode = 'transition';

  private _themeManager!: ThemeManager;
  private readonly _desktopState = createDesktopState();
  private _resolvedLayout: ResolvedLayout | null = null;
  private _dataLoadPromise: Promise<void> | undefined;
  private _layoutKey = '';
  private _lastSyncedFocusId: KeyId | null = null;

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

    .bboard-key-action {
      background: var(--bboard-color-surface-special);
      font-size: var(--bboard-font-size-sm);
    }

    .bboard-key__secondary {
      position: absolute;
      top: 4px;
      right: 6px;
      font-size: var(--bboard-font-size-sm);
      color: var(--bboard-color-text-secondary);
    }

    /* ── Mobile responsive bucket overrides (host selectors) ─────────── */

    :host([data-bucket='sm']) {
      --bboard-mobile-key-height: 52px;
      --bboard-mobile-row-gap: 12px;
      --bboard-mobile-h-padding: 14px;
    }

    :host([data-bucket='md']) {
      --bboard-mobile-key-height: 60px;
      --bboard-mobile-row-gap: 16px;
      --bboard-mobile-h-padding: 16px;
    }

    /* ── Mobile keyboard container ──────────────────────────────────── */

    .bboard-mobile-keyboard {
      padding-bottom: max(var(--bboard-mobile-row-gap), env(safe-area-inset-bottom, 0px));
      padding-left: max(var(--bboard-mobile-h-padding), env(safe-area-inset-left, 0px));
      padding-right: max(var(--bboard-mobile-h-padding), env(safe-area-inset-right, 0px));
      display: flex;
      flex-direction: column;
      gap: var(--bboard-mobile-row-gap);
      position: relative;
    }

    /* ── Mobile row ─────────────────────────────────────────────────── */

    .bboard-mobile-row {
      display: flex;
      justify-content: center;
      gap: var(--bboard-space-gap-key);
    }

    /* ── Mobile key ─────────────────────────────────────────────────── */

    .bboard-mobile-key {
      flex: var(--bboard-key-width-multiplier, 1);
      min-width: 44px;
      min-height: 44px;
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
      align-self: stretch;
      transition:
        background 80ms ease,
        transform 80ms ease;
    }

    .bboard-mobile-key.is-active {
      background: var(--bboard-color-surface-active);
      box-shadow: var(--bboard-shadow-key-pressed);
      transform: translateY(1px);
    }

    .bboard-mobile-key.is-disabled {
      opacity: var(--bboard-opacity-disabled);
      pointer-events: none;
    }

    .bboard-mobile-key:focus-visible {
      outline: 2px solid var(--bboard-color-focus-ring);
      outline-offset: 2px;
    }

    /* Thumb-zone height scaling */
    .bboard-mobile-key[data-thumb-comfort='high'] {
      align-self: stretch;
      min-height: calc(var(--bboard-mobile-key-height) * 1.05);
    }
    .bboard-mobile-key[data-thumb-comfort='medium'] {
      align-self: stretch;
      min-height: var(--bboard-mobile-key-height);
    }
    .bboard-mobile-key[data-thumb-comfort='low'] {
      align-self: stretch;
      min-height: calc(var(--bboard-mobile-key-height) * 0.92);
    }

    /* Long-press dot indicator */
    .bboard-key__long-press-dot {
      position: absolute;
      bottom: 3px;
      right: 5px;
      font-size: 0.65em;
      color: var(--bboard-color-text-secondary);
      line-height: 1;
    }

    /* ── Long-press popup ───────────────────────────────────────────── */

    .bboard-long-press-popup {
      position: absolute;
      bottom: calc(100% + 8px);
      left: var(--lp-anchor-x, 50%);
      transform: translateX(-50%);
      max-width: 100%;
      background: var(--bboard-color-surface-key);
      border-radius: var(--bboard-size-radius-md);
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.18);
      display: flex;
      gap: 2px;
      padding: 4px;
      z-index: 100;
      white-space: nowrap;
    }

    .bboard-long-press-item {
      padding: 10px 14px;
      font-size: 1.1em;
      border-radius: calc(var(--bboard-size-radius-md) - 2px);
      cursor: pointer;
      color: var(--bboard-color-text-primary);
      transition: background 60ms ease;
    }

    .bboard-long-press-item.is-selected {
      background: var(--bboard-color-surface-active);
      color: #fff;
      font-weight: 600;
    }

    /* ── Reduced motion ─────────────────────────────────────────────── */

    @media (prefers-reduced-motion: reduce) {
      *,
      *::before,
      *::after {
        transition: none !important;
        animation: none !important;
      }
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
    this._syncDomFocus();
  }

  private _syncDomFocus(): void {
    const focusedId = this._desktopState.snapshot().focusedKeyId;
    if (focusedId === this._lastSyncedFocusId) return;
    this._lastSyncedFocusId = focusedId;
    if (focusedId) {
      const btn = this.shadowRoot?.querySelector(
        `[data-key-id="${focusedId}"]`
      ) as HTMLElement | null;
      btn?.focus({ preventScroll: true });
    }
  }

  private _computeFocusGrid(): readonly (readonly KeyId[])[] {
    if (!this._resolvedLayout) return [];
    const snapshot = this._desktopState.snapshot();
    const layer =
      this._resolvedLayout.layout.layers.find((l) => l.name === snapshot.activeLayer) ??
      this._resolvedLayout.layout.layers[0];
    if (!layer) return [];
    return layer.rows.map((row) =>
      row.slots
        .filter(
          (slot) => !snapshot.hiddenKeys.has(slot.keyId) && !snapshot.disabledKeys.has(slot.keyId)
        )
        .map((slot) => slot.keyId)
    );
  }

  private _activateKey(keyId: KeyId): void {
    if (!this._resolvedLayout) return;
    const snapshot = this._desktopState.snapshot();

    // Resolve the character: support layer-specific key IDs (e.g., key-a-shift → base key key-a, shift layer)
    const resolvedKey =
      this._resolvedLayout.keyMap.get(keyId) ??
      this._resolvedLayout.keyMap.get(keyId.replace(/-(shift|altgr|altGr)$/, '') as KeyId);
    const effectiveLayer: LayerId = keyId.endsWith('-shift')
      ? 'shift'
      : keyId.endsWith('-altgr') || keyId.endsWith('-altGr')
        ? 'altGr'
        : snapshot.activeLayer;
    const char = resolvedKey?.layers[effectiveLayer]?.char ?? '';

    dispatchBBoardEvent(this, 'bboard-key-press', { keyId, char });

    const { shiftKey, shiftRightKey, altGrKey } = getModifierKeyIds(snapshot.activeLayer);
    if (keyId === shiftKey || keyId === shiftRightKey) {
      const newLayer: LayerId = snapshot.activeLayer === 'shift' ? 'base' : 'shift';
      this._desktopState.setActiveLayer(newLayer);
    } else if (keyId === altGrKey) {
      const newLayer: LayerId = snapshot.activeLayer === 'altGr' ? 'base' : 'altGr';
      this._desktopState.setActiveLayer(newLayer);
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

    // Navigate/activate only when a key inside the keyboard has browser focus
    if (this.shadowRoot?.activeElement) {
      const key = e.key;
      let direction: string | null = null;
      if (key === 'Tab' && !e.shiftKey) direction = 'tab';
      else if (key === 'Tab' && e.shiftKey) direction = 'shift-tab';
      else if (key === 'ArrowLeft') direction = 'arrow-left';
      else if (key === 'ArrowRight') direction = 'arrow-right';
      else if (key === 'ArrowUp') direction = 'arrow-up';
      else if (key === 'ArrowDown') direction = 'arrow-down';

      if (direction !== null) {
        e.preventDefault();
        const grid = this._computeFocusGrid();
        const controller = createFocusController(grid);
        const next = controller.move(
          direction as Parameters<ReturnType<typeof createFocusController>['move']>[0],
          this._desktopState.snapshot().focusedKeyId
        );
        this._desktopState.setFocusedKey(next);
        this.requestUpdate();
        return;
      }

      if (key === 'Enter' || key === ' ') {
        const focused = this._desktopState.snapshot().focusedKeyId;
        if (focused) {
          e.preventDefault();
          this._activateKey(focused);
          this.requestUpdate();
          return;
        }
      }
    }

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

  private _handleContainerClick = (e: MouseEvent) => {
    const target = (e.target as HTMLElement).closest('[data-key-id]') as HTMLElement | null;
    if (!target) return;
    const keyId = target.getAttribute('data-key-id') as KeyId | null;
    if (!keyId) return;
    this._desktopState.setFocusedKey(keyId);
    this._activateKey(keyId);
    this.requestUpdate();
  };

  render() {
    if (!this.open) {
      return html``;
    }
    if (this._resolvedLayout === null) {
      return html`<div
        class="keyboard-container"
        role="group"
        aria-label="Clavier virtuel"
        aria-busy="true"
      ></div>`;
    }

    const snapshot = this._desktopState.snapshot();
    const heldKeyIds: Set<string> = new Set();
    for (const code of snapshot.heldPhysicalKeys) {
      const keyId = mapPhysicalCodeToLogicalKey(code);
      if (keyId !== null) heldKeyIds.add(keyId);
    }

    // Compute which modifier keys are currently "latched" (active layer indicator)
    const { shiftKey, shiftRightKey, altGrKey } = getModifierKeyIds(snapshot.activeLayer);
    const activeModifierKeyIds = new Set<KeyId>();
    if (snapshot.activeLayer === 'shift') {
      activeModifierKeyIds.add(shiftKey);
      activeModifierKeyIds.add(shiftRightKey);
    } else if (snapshot.activeLayer === 'altGr') {
      activeModifierKeyIds.add(altGrKey);
    }

    const model = createDesktopRenderModel(this._resolvedLayout, {
      activeLayer: snapshot.activeLayer,
      modifierDisplayMode: this.modifierDisplayMode,
      heldPhysicalKeys: this.showPhysicalEcho ? heldKeyIds : new Set(),
      activeModifierKeyIds,
      hiddenKeys: snapshot.hiddenKeys,
      disabledKeys: snapshot.disabledKeys,
      focusedKeyId: snapshot.focusedKeyId,
    });

    return html`
      <div
        class="keyboard-container"
        role="group"
        aria-label="Clavier virtuel"
        @click=${this._handleContainerClick}
      >
        ${renderDesktopRows(model.rows)}
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'benin-keyboard': BeninKeyboard;
  }
}
