import type {
  KeyId,
  LayerId,
  ModifierDisplayMode,
  ResolvedKey,
  ResolvedLayout,
} from '../../public/index.js';

export interface DesktopRenderState {
  activeLayer: LayerId;
  modifierDisplayMode: ModifierDisplayMode;
  heldPhysicalKeys: ReadonlySet<string>;
  hiddenKeys: ReadonlySet<KeyId>;
  disabledKeys: ReadonlySet<KeyId>;
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
}

export interface DesktopRenderRow {
  keys: DesktopRenderKey[];
}

export interface DesktopRenderModel {
  rows: DesktopRenderRow[];
}

export function createDesktopRenderModel(
  resolvedLayout: ResolvedLayout,
  state: DesktopRenderState
): DesktopRenderModel {
  const layer =
    resolvedLayout.layout.layers.find((entry) => entry.name === state.activeLayer) ??
    resolvedLayout.layout.layers[0];

  return {
    rows:
      layer?.rows.map((row) => ({
        keys: row.slots.map((slot) => {
          const resolvedKey = resolvedLayout.keyMap.get(slot.keyId);
          const activeLabel = resolvedKey?.layers[state.activeLayer]?.char ?? '';
          const primaryLabel = slot.label ?? activeLabel;
          const overrideLabel = slot.label;
          const secondaryLabel = deriveSecondaryLabel({
            activeLayer: state.activeLayer,
            modifierDisplayMode: state.modifierDisplayMode,
            primaryLabel,
            resolvedKey,
            overrideLabel,
          });

          return {
            keyId: slot.keyId,
            width: slot.width,
            primaryLabel,
            secondaryLabel,
            overrideLabel,
            hidden: state.hiddenKeys.has(slot.keyId),
            disabled: state.disabledKeys.has(slot.keyId),
            focused: state.focusedKeyId === slot.keyId,
            active: state.heldPhysicalKeys.has(slot.keyId),
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
