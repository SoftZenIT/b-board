import { html, type TemplateResult } from 'lit';
import type { MobileRenderRow } from './render-model.js';
import { renderMobileKey } from './key.js';

export function renderMobileRows(rows: MobileRenderRow[]): TemplateResult {
  return html`${rows.map(
    (row, index) =>
      html`<div
        class="bboard-row bboard-mobile-row"
        data-row-index=${index}
        style="height:${row.height}px;"
      >
        ${row.keys.map((key) => renderMobileKey(key))}
      </div>`
  )}`;
}
