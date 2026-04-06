import { LitElement, html, css, nothing } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import {
  type LanguageId,
  type ThemeId,
  type LayoutVariantId,
  type ModifierDisplayMode,
  isLayoutVariantId,
  isLanguageId,
} from '../public/types.js';
import { type KeyId, type LayerId, type ResolvedLayout, createKeyId } from '../public/index.js';
import { dispatchBBoardEvent } from './events.js';
import { ThemeManager } from '../theme/theme-manager.js';
import { createDataLoader } from '../data/loader.js';
import { createLayoutResolver } from '../data/layout-resolver.js';
import { createDesktopRenderModel } from '../ui/desktop/render-model.js';
import { renderDesktopRows } from '../ui/desktop/rows.js';
import { createDesktopState } from '../ui/state/desktop-state.js';
import {
  mapPhysicalCodeToLogicalKey,
  computePhysicalLayer,
  MODIFIER_KEY_IDS,
} from '../ui/desktop/physical-key-map.js';
import { createCompositionProcessor } from '../composition/index.js';
import type { CompositionProcessor } from '../composition/index.js';
import { createFocusController } from '../ui/state/focus-controller.js';
import { createMobileRenderModel } from '../ui/mobile/render-model.js';
import { renderMobileRows } from '../ui/mobile/rows.js';
import { renderLongPressPopup } from '../ui/mobile/long-press.js';
import { createMobileState } from '../ui/mobile/mobile-state.js';
import {
  createErrorHandler,
  type ErrorHandler,
  type KeyboardError,
} from '../core/_internal/error-handler.js';
import { validateBrowser, supportsResizeObserver } from '../core/_internal/browser-compat.js';
import { logger } from '../utils/logger.js';

const BCP47_MAP: Readonly<Record<LanguageId, string>> = {
  yoruba: 'yo',
  'fon-adja': 'fon',
  baatonum: 'bba',
  dendi: 'ddn',
};

const LANGUAGE_DISPLAY_NAMES: Readonly<Record<LanguageId, string>> = {
  yoruba: 'Yoruba',
  'fon-adja': 'Fon / Adja',
  baatonum: 'Baatɔnum',
  dendi: 'Dendi',
};

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

  @state() private _errorState: KeyboardError | null = null;

  private readonly _errorHandler: ErrorHandler = createErrorHandler();
  private readonly _themeManager!: ThemeManager;
  private readonly _desktopState = createDesktopState();
  private readonly _mobileState = createMobileState();
  private _resizeObserver: ResizeObserver | null = null;
  private _resizeFallbackHandler: (() => void) | null = null;
  private _longPressAnchorX = 0;
  private _touchStartKeyId: KeyId | null = null;
  private _resolvedLayout: ResolvedLayout | null = null;
  private _compositionProcessor: CompositionProcessor | null = null;
  private _dataLoadPromise: Promise<void> | undefined;
  private _layoutKey = '';
  private _lastSyncedFocusId: KeyId | null = null;
  private _politeMessage = '';
  private _assertiveMessage = '';

  static readonly styles = css`
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
      flex: 0 0
        calc(
          var(--bboard-size-key-width) * var(--bboard-key-width-multiplier, 1) +
            var(--bboard-space-gap-key) * (var(--bboard-key-width-multiplier, 1) - 1)
        );
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

    :host([data-bucket='xs']) {
      --bboard-mobile-key-height: 44px;
      --bboard-mobile-row-gap: 8px;
      --bboard-mobile-h-padding: 12px;
    }

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

<<<<<<< HEAD
    /* ── Error banner ──────────────────────────────────────────────── */

    .bboard-error-banner {
      padding: 24px 20px;
      border-radius: var(--bboard-size-radius-lg);
      text-align: center;
      font-family: var(--bboard-font-family);
    }

    .bboard-error-banner--warning {
      background: #fef3cd;
      color: #856404;
      border: 1px solid #ffc107;
    }

    .bboard-error-banner--fatal {
      background: #f8d7da;
      color: #721c24;
      border: 1px solid #f5c6cb;
    }

    .bboard-error-banner__message {
      font-size: var(--bboard-font-size-base, 16px);
      margin: 0 0 12px;
    }

    .bboard-error-banner__retry {
      padding: 8px 20px;
      border-radius: var(--bboard-size-radius-md);
      border: 1px solid currentColor;
      background: transparent;
      color: inherit;
      font-size: var(--bboard-font-size-sm, 14px);
      cursor: pointer;
      font-weight: 600;
    }

    .bboard-error-banner__retry:hover {
      opacity: 0.8;
    }

    .bboard-error-banner__retry:focus-visible {
      outline: 2px solid var(--bboard-color-focus-ring, #005fcc);
      outline-offset: 2px;
    }

    /* ── Screen-reader-only (live regions) ──────────────────────────── */

    .bboard-sr-only {
      position: absolute;
      width: 1px;
      height: 1px;
      padding: 0;
      margin: -1px;
      overflow: hidden;
      clip: rect(0, 0, 0, 0);
      white-space: nowrap;
      border: 0;
    }

    /* ── High contrast mode ────────────────────────────────────────── */

    @media (prefers-contrast: more) {
      .bboard-error-banner--warning {
        background: #fff;
        color: #000;
        border: 2px solid #000;
      }
      .bboard-error-banner--fatal {
        background: #fff;
        color: #000;
        border: 3px solid #000;
      }

      .bboard-key,
      .bboard-mobile-key {
        border: 1px solid currentColor;
        font-weight: 600;
      }

      .bboard-key:focus-visible,
      .bboard-key.is-focused,
      .bboard-mobile-key:focus-visible {
        outline-width: 3px;
      }

      .bboard-long-press-item.is-selected {
        border: 2px solid currentColor;
      }
    }

    @media (forced-colors: active) {
      .bboard-error-banner {
        border: 2px solid ButtonText;
      }
      .bboard-error-banner__retry {
        border: 1px solid ButtonText;
      }

      .bboard-key,
      .bboard-mobile-key {
        forced-color-adjust: none;
        border: 1px solid ButtonText;
        background: ButtonFace;
        color: ButtonText;
      }

      .bboard-key.is-active,
      .bboard-mobile-key.is-active {
        background: Highlight;
        color: HighlightText;
      }

      .bboard-key:focus-visible,
      .bboard-key.is-focused,
      .bboard-mobile-key:focus-visible {
        outline: 3px solid Highlight;
      }

      .bboard-key-action {
        background: ButtonFace;
      }

      .bboard-long-press-item {
        color: ButtonText;
      }

      .bboard-long-press-item.is-selected {
        background: Highlight;
        color: HighlightText;
        border: 2px solid HighlightText;
      }

      .keyboard-container,
      .bboard-mobile-keyboard {
        background: Canvas;
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

    // Browser compatibility check — emits errors for missing APIs
    const compatErrors = validateBrowser();
    for (const ke of compatErrors) {
      if (ke.severity === 'fatal') {
        this._errorState = ke;
        logger.error(ke.message);
        this._emitErrorEvent(ke);
        return; // Stop initialization — core APIs missing
      }
      // Log recoverable issues but continue
      logger.error(ke.message);
      this._emitErrorEvent(ke);
    }

    this._applyTheme(this._themeManager.effectiveTheme);
    window.addEventListener('keydown', this._handleKeydown);
    window.addEventListener('keyup', this._handleKeyup);
    window.addEventListener('blur', this._handleWindowBlur);
    if (this.layoutVariant.startsWith('mobile-')) {
      this._startResizeObserver();
    }
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    this._resizeObserver?.disconnect();
    this._resizeObserver = null;
    if (this._resizeFallbackHandler) {
      window.removeEventListener('resize', this._resizeFallbackHandler);
      this._resizeFallbackHandler = null;
    }
    this._themeManager.destroy();
    window.removeEventListener('keydown', this._handleKeydown);
    window.removeEventListener('keyup', this._handleKeyup);
    window.removeEventListener('blur', this._handleWindowBlur);
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

  /** Retry loading after a recoverable error. Clears the error state and re-triggers layout loading. */
  retry(): void {
    if (!this._errorState) return;
    if (!this._errorHandler.isRecoverable(this._errorState)) return;
    this._errorState = null;
    this._layoutKey = '';
    this.requestUpdate();
  }

  private async _loadLayout(expectedKey: string): Promise<void> {
    if (!isLayoutVariantId(this.layoutVariant) || !isLanguageId(this.language)) {
      return;
    }

    this._errorState = null;

    try {
      const result = await this._tryLoadOnce(expectedKey);
      if (result) return;
    } catch (firstError) {
      // Discard errors for superseded layout requests
      if (this._layoutKey !== expectedKey) return;

      if (!this._errorHandler.isRecoverable(this._errorHandler.handle(firstError))) {
        this._handleFatalError(firstError);
        return;
      }

      // Auto-retry once after 1s for recoverable errors
      await new Promise((r) => setTimeout(r, 1000));

      // Re-check staleness after delay
      if (this._layoutKey !== expectedKey) return;

      try {
        const retryResult = await this._tryLoadOnce(expectedKey);
        if (retryResult) return;
      } catch (retryError) {
        // Discard errors for superseded layout requests
        if (this._layoutKey !== expectedKey) return;
        this._handleRecoverableError(retryError);
        return;
      }
    }
  }

  private async _tryLoadOnce(expectedKey: string): Promise<boolean> {
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
      this._compositionProcessor = createCompositionProcessor(this._resolvedLayout);
      return true;
    }
    return false;
  }

  private _handleRecoverableError(error: unknown): void {
    const ke = this._errorHandler.handle(error);
    this._errorState = ke;
    logger.error(ke.message);
    this._emitErrorEvent(ke);
  }

  private _handleFatalError(error: unknown): void {
    const ke = this._errorHandler.handle(error, 'fatal');
    this._errorState = ke;
    logger.error(ke.message);
    this._emitErrorEvent(ke);
  }

  private _emitErrorEvent(ke: KeyboardError): void {
    dispatchBBoardEvent(this, 'bboard-error', {
      code: ke.code,
      severity: ke.severity,
      message: ke.message,
      recoverySuggestion: ke.suggestion,
      ...(ke.cause instanceof Error && { cause: ke.cause }),
    });
  }

  protected updated(changedProperties: Map<string | number | symbol, unknown>) {
    this.toggleAttribute('data-composition-armed', this._compositionProcessor?.isArmed ?? false);
    if (changedProperties.has('language')) {
      dispatchBBoardEvent(this, 'bboard-language-change', { languageId: this.language });
      const displayName = LANGUAGE_DISPLAY_NAMES[this.language] ?? this.language;
      this._announcePolite(`Langue : ${displayName}`);
    }
    if (changedProperties.has('theme')) {
      this._themeManager.theme = this.theme;
    }
    if (changedProperties.has('layoutVariant')) {
      if (this.layoutVariant.startsWith('mobile-')) {
        this._startResizeObserver();
      } else {
        this._resizeObserver?.disconnect();
        this._resizeObserver = null;
      }
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

  private _announcePolite(message: string): void {
    // Clear then set to ensure screen readers re-announce identical messages
    this._politeMessage = '';
    this._assertiveMessage = '';
    this.requestUpdate();
    this.updateComplete.then(() => {
      this._politeMessage = message;
      this.requestUpdate();
    });
  }

  private _announceAssertive(message: string): void {
    this._politeMessage = '';
    this._assertiveMessage = '';
    this.requestUpdate();
    this.updateComplete.then(() => {
      this._assertiveMessage = message;
      this.requestUpdate();
    });
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

  private _bucketFromWidth(width: number): 'xs' | 'sm' | 'md' {
    if (width < 375) return 'xs';
    if (width < 768) return 'sm';
    return 'md';
  }

  private _startResizeObserver(): void {
    if (this._resizeObserver || this._resizeFallbackHandler) return;

    if (supportsResizeObserver()) {
      this._resizeObserver = new ResizeObserver((entries) => {
        const width = entries[0]?.contentRect.width ?? 0;
        const bucket = this._bucketFromWidth(width);
        this._mobileState.setWidthBucket(bucket);
        this.dataset['bucket'] = bucket;
        this.requestUpdate();
      });
      this.updateComplete.then(() => {
        const container = this.shadowRoot?.querySelector('.bboard-mobile-keyboard');
        if (container) this._resizeObserver?.observe(container);
      });
    } else {
      // Fallback: debounced window resize listener
      let timer: ReturnType<typeof setTimeout> | null = null;
      this._resizeFallbackHandler = () => {
        if (timer) clearTimeout(timer);
        timer = setTimeout(() => {
          const width = this.clientWidth;
          const bucket = this._bucketFromWidth(width);
          this._mobileState.setWidthBucket(bucket);
          this.dataset['bucket'] = bucket;
          this.requestUpdate();
        }, 100);
      };
      window.addEventListener('resize', this._resizeFallbackHandler);
      // Trigger initial measurement
      this._resizeFallbackHandler();
    }
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
    const wasArmed = this._compositionProcessor?.isArmed ?? false;
    const armedTrigger = this._compositionProcessor?.armedTrigger ?? null;
    const composed = this._compositionProcessor?.process(keyId, char) ?? char;
    if (composed === null) {
      // Dead key was swallowed — announce composition armed state
      if (this._compositionProcessor?.isArmed) {
        const mode = this._compositionProcessor.armedMode;
        if (mode === 'tone') {
          this._announcePolite('Modificateur de ton activé');
        } else if (mode === 'nasal') {
          this._announcePolite('Modificateur nasal activé');
        }
      } else if (wasArmed) {
        // Was armed but process returned null and is no longer armed → invalid
        this._announceAssertive('Combinaison invalide');
      }
      this.requestUpdate();
      return;
    }
    // Successful composition of a previously armed dead key
    if (wasArmed && composed !== char) {
      this._announcePolite(`${composed}`);
    } else if (wasArmed && armedTrigger !== null) {
      // Was armed but produced the original char → invalid combination
      this._announceAssertive('Combinaison invalide');
    }
    dispatchBBoardEvent(this, 'bboard-key-press', { keyId, char: composed });

    const { shiftKey, shiftRightKey, altGrKey } = getModifierKeyIds(snapshot.activeLayer);
    if (keyId === shiftKey || keyId === shiftRightKey) {
      const newLayer: LayerId = snapshot.activeLayer === 'shift' ? 'base' : 'shift';
      this._desktopState.setActiveLayer(newLayer);
    } else if (keyId === altGrKey) {
      const newLayer: LayerId = snapshot.activeLayer === 'altGr' ? 'base' : 'altGr';
      this._desktopState.setActiveLayer(newLayer);
    }
  }

  private _activateMobileKey(keyId: KeyId): void {
    if (!this._resolvedLayout) return;
    const snap = this._mobileState.snapshot();
    const resolvedKey =
      this._resolvedLayout.keyMap.get(keyId) ??
      this._resolvedLayout.keyMap.get(keyId.replace(/-(shift|altgr|altGr)$/, '') as KeyId);
    const effectiveLayer: LayerId = keyId.endsWith('-shift')
      ? 'shift'
      : keyId.endsWith('-altgr') || keyId.endsWith('-altGr')
        ? 'altGr'
        : snap.activeLayer;
    const char = resolvedKey?.layers[effectiveLayer]?.char ?? '';
    const wasArmed = this._compositionProcessor?.isArmed ?? false;
    const armedTrigger = this._compositionProcessor?.armedTrigger ?? null;
    const composed = this._compositionProcessor?.process(keyId, char) ?? char;
    if (composed === null) {
      if (this._compositionProcessor?.isArmed) {
        const mode = this._compositionProcessor.armedMode;
        if (mode === 'tone') {
          this._announcePolite('Modificateur de ton activé');
        } else if (mode === 'nasal') {
          this._announcePolite('Modificateur nasal activé');
        }
      } else if (wasArmed) {
        this._announceAssertive('Combinaison invalide');
      }
      this.requestUpdate();
      return;
    }
    if (wasArmed && composed !== char) {
      this._announcePolite(`${composed}`);
    } else if (wasArmed && armedTrigger !== null) {
      this._announceAssertive('Combinaison invalide');
    }
    dispatchBBoardEvent(this, 'bboard-key-press', { keyId, char: composed });

    const { shiftKey, shiftRightKey, altGrKey } = getModifierKeyIds(snap.activeLayer);
    if (keyId === shiftKey || keyId === shiftRightKey) {
      this._mobileState.setActiveLayer(snap.activeLayer === 'shift' ? 'base' : 'shift');
    } else if (keyId === altGrKey) {
      this._mobileState.setActiveLayer(snap.activeLayer === 'altGr' ? 'base' : 'altGr');
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
    this._compositionProcessor?.cancel();
  }

  openKeyboard(): void {
    this.open = true;
  }

  closeKeyboard(): void {
    this.open = false;
  }

  private readonly _handleWindowBlur = () => {
    this._desktopState.clearHeldPhysicalKeys();
    const wasArmed = this._compositionProcessor?.isArmed ?? false;
    this._compositionProcessor?.cancel();
    if (wasArmed) {
      this._announcePolite('Modificateur annulé');
    }
    if (this.showPhysicalEcho || wasArmed) this.requestUpdate();
  };

  private readonly _handleKeydown = (e: KeyboardEvent) => {
    // Gap fix: skip pressPhysicalCode on auto-repeat (idempotent but creates needless Set allocations)
    if (!e.repeat) this._desktopState.pressPhysicalCode(e.code);

    if (e.key === 'Escape' && this._mobileState.snapshot().longPressVisible) {
      this._mobileState.dismissLongPress();
      this.requestUpdate();
      return;
    }

    if (e.key === 'Escape' && this._compositionProcessor?.isArmed) {
      this._compositionProcessor.cancel();
      this._announcePolite('Modificateur annulé');
      this.requestUpdate();
      return;
    }

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

    // BBOARD-141/140/142: physical key output — always-on for desktop variants
    // Hold-based modifier layer: computed from heldPhysicalKeys, not UI toggle state
    // Auto-repeat guard: e.repeat events are skipped (BBOARD-142)
    if (!e.repeat && this.layoutVariant.startsWith('desktop-') && this._resolvedLayout) {
      const keyId = mapPhysicalCodeToLogicalKey(e.code);
      if (keyId !== null && !MODIFIER_KEY_IDS.has(keyId)) {
        const heldKeys = this._desktopState.snapshot().heldPhysicalKeys;
        const layer = computePhysicalLayer(heldKeys);
        const resolvedKey = this._resolvedLayout.keyMap.get(keyId);
        // Fall back to base layer if the computed layer has no entry for this key
        const char = resolvedKey?.layers[layer]?.char ?? resolvedKey?.layers['base']?.char ?? '';
        const composed = this._compositionProcessor?.process(keyId, char) ?? char;
        if (composed !== null) {
          dispatchBBoardEvent(this, 'bboard-key-press', { keyId, char: composed });
        }
      }
    }

    // Visual echo: only update on first press (repeat doesn't change held-key state)
    if (this.showPhysicalEcho && !e.repeat) this.requestUpdate();
  };

  private readonly _handleKeyup = (e: KeyboardEvent) => {
    this._desktopState.releasePhysicalCode(e.code);
    if (this.showPhysicalEcho) {
      this.requestUpdate();
    }
  };

  private readonly _handleContainerClick = (e: MouseEvent) => {
    const target = (e.target as HTMLElement).closest('[data-key-id]') as HTMLElement | null;
    if (!target) return;
    const keyId = target.getAttribute('data-key-id') as KeyId | null;
    if (!keyId) return;
    this._desktopState.setFocusedKey(keyId);
    this._activateKey(keyId);
    this.requestUpdate();
  };

  private readonly _handleFocusIn = (e: FocusEvent) => {
    const target = (e.target as HTMLElement).closest('[data-key-id]') as HTMLElement | null;
    if (!target) return;
    const keyId = target.getAttribute('data-key-id') as KeyId | null;
    if (!keyId) return;
    this._desktopState.setFocusedKey(keyId);
    this.requestUpdate();
  };

  private readonly _handleTouchStart = (e: TouchEvent) => {
    const target = (e.target as HTMLElement).closest('[data-key-id]') as HTMLElement | null;
    if (!target) return;
    const keyId = target.getAttribute('data-key-id') as KeyId | null;
    if (!keyId) return;

    this._touchStartKeyId = keyId;

    const rect = target.getBoundingClientRect();
    const containerRect = this.shadowRoot
      ?.querySelector('.bboard-mobile-keyboard')
      ?.getBoundingClientRect();
    this._longPressAnchorX = containerRect
      ? rect.left - containerRect.left + rect.width / 2
      : rect.left + rect.width / 2;

    this._mobileState.startLongPress(keyId, () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (navigator as any).vibrate?.(10);
      this._mobileState.setLongPressVisible(true);
      this.requestUpdate();
    });
  };

  private readonly _handleTouchMove = (e: TouchEvent) => {
    const snap = this._mobileState.snapshot();
    if (!snap.longPressVisible || !snap.longPressKeyId) return;
    e.preventDefault();

    const touch = e.touches[0];
    if (!touch) return;
    const popup = this.shadowRoot?.querySelector('.bboard-long-press-popup');
    if (!popup) return;

    const items = popup.querySelectorAll('[data-index]');
    let closestIndex = snap.longPressSelectedIndex;
    let closestDist = Infinity;
    items.forEach((item) => {
      const r = item.getBoundingClientRect();
      const centerX = r.left + r.width / 2;
      const dist = Math.abs(touch.clientX - centerX);
      if (dist < closestDist) {
        closestDist = dist;
        closestIndex = Number(item.getAttribute('data-index') ?? 0);
      }
    });
    this._mobileState.setLongPressSelectedIndex(closestIndex);
    this.requestUpdate();
  };

  private readonly _handleTouchEnd = () => {
    const snap = this._mobileState.snapshot();
    if (snap.longPressVisible && snap.longPressKeyId !== null) {
      const resolvedKey = this._resolvedLayout?.keyMap.get(snap.longPressKeyId);
      if (resolvedKey?.longPress?.length) {
        const safeIndex = Math.max(
          0,
          Math.min(snap.longPressSelectedIndex, resolvedKey.longPress.length - 1)
        );
        const char = resolvedKey.longPress[safeIndex] ?? '';
        dispatchBBoardEvent(this, 'bboard-key-press', { keyId: snap.longPressKeyId, char });
      }
      this._mobileState.dismissLongPress();
      this._touchStartKeyId = null;
      this.requestUpdate();
      return;
    }
    this._mobileState.cancelLongPress();
    const keyId = this._touchStartKeyId;
    this._touchStartKeyId = null;
    if (keyId) {
      this._activateMobileKey(keyId);
      this.requestUpdate();
    }
  };

  private readonly _handleTouchCancel = () => {
    this._mobileState.cancelLongPress();
    this._touchStartKeyId = null;
    this.requestUpdate();
  };

  render() {
    if (!this.open) {
      return html``;
    }

    // ── Error banner (replaces the key grid) ────────────────────────────
    if (this._errorState) {
      const isRecoverable = this._errorHandler.isRecoverable(this._errorState);
      const bannerClass = isRecoverable
        ? 'bboard-error-banner--warning'
        : 'bboard-error-banner--fatal';
      const message = isRecoverable
        ? 'Le clavier n\u2019a pas pu se charger.'
        : 'Le clavier a rencontré une erreur critique.';

      return html`<div class="bboard-error-banner ${bannerClass}" role="alert">
        <p class="bboard-error-banner__message">${message}</p>
        ${isRecoverable
          ? html`<button class="bboard-error-banner__retry" @click=${() => this.retry()}>
              Réessayer
            </button>`
          : nothing}
      </div>`;
    }

    if (this._resolvedLayout === null) {
      return html`<div
        class="keyboard-container"
        role="group"
        aria-label="Clavier virtuel"
        aria-busy="true"
      ></div>`;
    }

    const bcp47 = BCP47_MAP[this.language] ?? nothing;
    const srInstructions =
      'Utilisez Tab et les touches fléchées pour naviguer, Entrée ou Espace pour activer une touche';
    const liveRegions = html`
      <div class="bboard-sr-only" aria-live="polite" aria-atomic="true">${this._politeMessage}</div>
      <div class="bboard-sr-only" aria-live="assertive" aria-atomic="true">
        ${this._assertiveMessage}
      </div>
    `;

    // ── Mobile branch ────────────────────────────────────────────────────
    if (this.layoutVariant.startsWith('mobile-')) {
      const snap = this._mobileState.snapshot();
      const { shiftKey, shiftRightKey, altGrKey } = getModifierKeyIds(snap.activeLayer);
      const activeModifierKeyIds = new Set<KeyId>();
      if (snap.activeLayer === 'shift') {
        activeModifierKeyIds.add(shiftKey);
        activeModifierKeyIds.add(shiftRightKey);
      } else if (snap.activeLayer === 'altGr') {
        activeModifierKeyIds.add(altGrKey);
      }

      const model = createMobileRenderModel(this._resolvedLayout, {
        ...snap,
        activeModifierKeyIds,
      });

      return html`
        <div
          class="bboard-mobile-keyboard"
          role="group"
          aria-label="Clavier virtuel"
          aria-description=${srInstructions}
          lang=${bcp47}
          style="--lp-anchor-x:${this._longPressAnchorX}px;"
          @touchstart=${this._handleTouchStart}
          @touchmove=${this._handleTouchMove}
          @touchend=${this._handleTouchEnd}
          @touchcancel=${this._handleTouchCancel}
        >
          ${renderMobileRows(model.rows)}
          ${model.longPressPopup ? renderLongPressPopup(model.longPressPopup) : null} ${liveRegions}
        </div>
      `;
    }

    // ── Desktop branch ──────────────────────────────────────────────────
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
      keyboardDisabled: this.disabled,
    });

    return html`
      <div
        class="keyboard-container"
        role="group"
        aria-label="Clavier virtuel"
        aria-description=${srInstructions}
        lang=${bcp47}
        @click=${this._handleContainerClick}
        @focusin=${this._handleFocusIn}
      >
        ${renderDesktopRows(model.rows)} ${liveRegions}
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'benin-keyboard': BeninKeyboard;
  }
}
