import { html, type TemplateResult } from 'lit';
import type { MobileRenderKey } from './render-model.js';

export function renderMobileKey(key: MobileRenderKey): TemplateResult | null {
  if (key.hidden) return null;

  const classes = [
    'bboard-key',
    'bboard-mobile-key',
    key.isActionKey ? 'bboard-key-action' : 'bboard-key-character',
    key.disabled ? 'is-disabled' : '',
    key.active ? 'is-active' : '',
  ]
    .filter(Boolean)
    .join(' ');

  return html`
    <button
      class=${classes}
      style="--bboard-key-width-multiplier:${key.width};"
      data-key-id=${key.keyId}
      data-thumb-comfort=${key.thumbComfort}
      ?data-has-long-press=${key.hasLongPress}
      aria-label=${key.primaryLabel}
      aria-pressed=${key.active}
      aria-haspopup=${key.hasLongPress ? 'listbox' : 'false'}
      ?disabled=${key.disabled}
      tabindex=${key.tabStop ? 0 : -1}
    >
      <span class="bboard-key__primary">${key.primaryLabel}</span>
      ${key.hasLongPress
        ? html`<span class="bboard-key__long-press-dot" aria-hidden="true">·</span>`
        : null}
    </button>
  `;
}
