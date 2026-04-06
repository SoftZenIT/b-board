import { html, nothing, type TemplateResult } from 'lit';
import type { DesktopRenderKey } from './render-model.js';
import { getAccessibleLabel } from '../accessible-labels.js';

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
      aria-pressed=${key.isToggle ? key.active : nothing}
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
