import { html, type TemplateResult } from 'lit';
import type { DesktopRenderRow } from './render-model.js';
import { renderDesktopKey } from './key.js';

export function renderDesktopRows(rows: DesktopRenderRow[]): TemplateResult {
  return html`${rows.map(
    (row, index) =>
      html`<div class="bboard-row" data-row-index=${index}>
        ${row.keys.map((key) => renderDesktopKey(key))}
      </div>`
  )}`;
}
