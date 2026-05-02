import rawShape from '../../../data/layouts/desktop-azerty.json' with { type: 'json' };
import { validateLayoutShape } from '../_internal/validator.js';
import type { LayoutShape } from '../layout.types.js';

const _base = validateLayoutShape(rawShape);

export const DESKTOP_AZERTY_WINDOWS: LayoutShape = {
  ..._base,
  id: 'desktop-azerty-windows',
};
