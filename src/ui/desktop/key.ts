import { html, type TemplateResult } from 'lit';
import type { DesktopRenderKey } from './render-model.js';

/**
 * Maps well-known action key IDs to human-readable accessible names.
 * Character keys fall back to their `primaryLabel`.
 */
const KEY_ACCESSIBLE_LABELS: Readonly<Record<string, string>> = {
  'key-backspace': 'Backspace',
  'key-tab': 'Tab',
  'key-capslock': 'Caps Lock',
  'key-enter': 'Enter',
  'key-shift': 'Shift',
  'key-shift-right': 'Shift',
  'key-ctrl': 'Control',
  'key-ctrl-right': 'Control',
  'key-alt': 'Alt',
  'key-altgr': 'AltGr',
  'key-win': 'Meta',
  'key-win-right': 'Meta',
  'key-space': 'Space',
  'key-escape': 'Escape',
};

function getAccessibleLabel(keyId: string, primaryLabel: string): string {
  return KEY_ACCESSIBLE_LABELS[keyId] ?? primaryLabel;
}

export function renderDesktopKey(key: DesktopRenderKey): TemplateResult | null {
  if (key.hidden) return null;

  const extraClasses = [
    key.overrideLabel ? 'bboard-key-action' : 'bboard-key-character',
    key.disabled ? 'is-disabled' : '',
    key.focused ? 'is-focused' : '',
    key.active ? 'is-active' : '',
  ]
    .filter(Boolean)
    .join(' ');

  return html`
    <button
      class="bboard-key ${extraClasses}"
      style="--bboard-key-width-multiplier:${key.width};"
      data-key-id=${key.keyId}
      aria-label=${getAccessibleLabel(key.keyId, key.primaryLabel)}
      aria-pressed=${key.active}
      ?disabled=${key.disabled}
      tabindex=${key.tabStop ? 0 : -1}
    >
      <span class="bboard-key__primary">${key.overrideLabel ?? key.primaryLabel}</span>
      ${key.secondaryLabel
        ? html`<span class="bboard-key__secondary">${key.secondaryLabel}</span>`
        : null}
    </button>
  `;
}
