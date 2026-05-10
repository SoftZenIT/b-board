import { html, type TemplateResult } from 'lit';
import type { LongPressPopupModel } from './render-model.js';

/** Returns a visible label for a character in the long-press popup. */
export function displayLabel(char: string): string {
  if (char === ' ') return '⎵'; // non-breaking space — show visible symbol
  return char;
}

export function renderLongPressPopup(popup: LongPressPopupModel): TemplateResult {
  return html`
    <div
      class="bboard-long-press-popup"
      role="listbox"
      aria-label="Alternate characters"
      data-anchor-key=${popup.anchorKeyId}
    >
      ${popup.items.map(
        (char, index) => html`
          <div
            id="lp-${popup.anchorKeyId}-${index}"
            role="option"
            class="bboard-long-press-item ${index === popup.selectedIndex ? 'is-selected' : ''}"
            aria-selected=${index === popup.selectedIndex ? 'true' : 'false'}
            data-char=${char}
            data-index=${index}
          >
            ${displayLabel(char)}
          </div>
        `
      )}
    </div>
  `;
}
