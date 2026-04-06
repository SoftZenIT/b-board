import type {
  KeyId,
  LayerId,
  ModifierDisplayMode,
  ResolvedKey,
  ResolvedLayout,
} from '../../public/index.js';

const TOGGLE_KEY_IDS: ReadonlySet<string> = new Set([
  'key-shift',
  'key-shift-right',
  'key-altgr',
  'key-capslock',
]);

export interface DesktopRenderState {
  activeLayer: LayerId;
  modifierDisplayMode: ModifierDisplayMode;
  heldPhysicalKeys: ReadonlySet<string>;
  activeModifierKeyIds: ReadonlySet<KeyId>;
  hiddenKeys: ReadonlySet<KeyId>;
  disabledKeys: ReadonlySet<KeyId>;
  keyboardDisabled: boolean;
  focusedKeyId: KeyId | null;
}

export interface DesktopRenderKey {
  keyId: KeyId;
  width: number;
  primaryLabel: string;
  secondaryLabel: string;
  overrideLabel?: string;
  hidden: boolean;
  disabled: boolean;
  focused: boolean;
  active: boolean;
  tabStop: boolean;
  isToggle: boolean;
}

export interface DesktopRenderRow {
  keys: DesktopRenderKey[];
}

export interface DesktopRenderModel {
  rows: DesktopRenderRow[];
}

/**
 * Layer-specific key IDs follow the convention `key-{name}-{layer}` (e.g., `key-a-shift`).
 * This helper resolves such IDs back to their base key and determines which layer's char to show.
 * If the key ID has no layer suffix, the base key is the same and the active layer is used.
 */
function resolveLayerKey(
  keyId: string,
  activeLayer: LayerId
): { baseKeyId: string; effectiveLayer: LayerId } {
  if (keyId.endsWith('-shift')) {
    return { baseKeyId: keyId.slice(0, -'-shift'.length), effectiveLayer: 'shift' };
  }
  if (keyId.endsWith('-altgr') || keyId.endsWith('-altGr')) {
    const suffix = keyId.endsWith('-altgr') ? '-altgr' : '-altGr';
    return { baseKeyId: keyId.slice(0, -suffix.length), effectiveLayer: 'altGr' };
  }
  return { baseKeyId: keyId, effectiveLayer: activeLayer };
}

export function createDesktopRenderModel(
  resolvedLayout: ResolvedLayout,
  state: DesktopRenderState
): DesktopRenderModel {
  const layer =
    resolvedLayout.layout.layers.find((entry) => entry.name === state.activeLayer) ??
    resolvedLayout.layout.layers[0];

  // For roving tabindex: if no key is focused, the first non-hidden, non-disabled key is the tab stop
  let firstFocusableFound = false;

  return {
    rows:
      layer?.rows.map((row) => ({
        keys: row.slots.map((slot) => {
          const { baseKeyId, effectiveLayer } = resolveLayerKey(slot.keyId, state.activeLayer);
          const resolvedKey =
            resolvedLayout.keyMap.get(slot.keyId) ?? resolvedLayout.keyMap.get(baseKeyId as KeyId);
          const activeLabel = resolvedKey?.layers[effectiveLayer]?.char ?? '';
          const primaryLabel = slot.label ?? activeLabel;
          const overrideLabel = slot.label;
          const secondaryLabel = deriveSecondaryLabel({
            activeLayer: effectiveLayer,
            modifierDisplayMode: state.modifierDisplayMode,
            primaryLabel,
            resolvedKey,
            overrideLabel,
          });

          const hidden = state.hiddenKeys.has(slot.keyId);
          const disabled = state.keyboardDisabled || state.disabledKeys.has(slot.keyId);
          const focused = state.focusedKeyId === slot.keyId;
          const active =
            state.heldPhysicalKeys.has(slot.keyId) || state.activeModifierKeyIds.has(slot.keyId);

          // Roving tabindex: focused key gets 0, otherwise first focusable gets 0
          let tabStop = false;
          if (focused) {
            tabStop = true;
          } else if (!hidden && !disabled && state.focusedKeyId === null && !firstFocusableFound) {
            tabStop = true;
            firstFocusableFound = true;
          }

          return {
            keyId: slot.keyId,
            width: slot.width,
            primaryLabel,
            secondaryLabel,
            overrideLabel,
            hidden,
            disabled,
            focused,
            active,
            tabStop,
            isToggle: TOGGLE_KEY_IDS.has(slot.keyId),
          };
        }),
      })) ?? [],
  };
}

function deriveSecondaryLabel(options: {
  activeLayer: LayerId;
  modifierDisplayMode: ModifierDisplayMode;
  primaryLabel: string;
  resolvedKey: ResolvedKey | undefined;
  overrideLabel?: string;
}): string {
  const { activeLayer, modifierDisplayMode, primaryLabel, resolvedKey, overrideLabel } = options;

  if (modifierDisplayMode !== 'hint' || overrideLabel !== undefined) {
    return '';
  }

  const logicalLayers: LayerId[] = ['base', 'shift', 'altGr'];
  const activeLayerIndex = logicalLayers.indexOf(activeLayer);
  const orderedCandidates = [
    ...(activeLayerIndex >= 0 ? logicalLayers.slice(activeLayerIndex + 1) : logicalLayers),
    ...(activeLayerIndex >= 0 ? logicalLayers.slice(0, activeLayerIndex) : []),
  ];

  for (const layerId of orderedCandidates) {
    const candidate = resolvedKey?.layers[layerId]?.char ?? '';
    if (candidate !== '' && candidate !== primaryLabel) {
      return candidate;
    }
  }

  return '';
}
