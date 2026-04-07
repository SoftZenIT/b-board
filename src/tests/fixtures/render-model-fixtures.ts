import {
  createKeyId,
  createLayoutLayer,
  createLayoutRow,
  createLayoutShape,
  createLayoutSlot,
  createLanguageProfile,
  createResolvedKey,
  createResolvedLayout,
  createKeyOutput,
  type ResolvedLayout,
  type LayoutShape,
} from '../../public/index.js';
import type { DesktopRenderState } from '../../ui/desktop/render-model.js';
import type { MobileRenderState } from '../../ui/mobile/render-model.js';
import { yorubaCompositionRules } from './language-fixtures.js';
import { buildCompositionMap } from './composition-fixtures.js';

/** A minimal desktop layout with 2 rows, 4 keys. */
export function desktopLayoutShape(): LayoutShape {
  return createLayoutShape(
    'desktop-azerty',
    'desktop',
    [
      createLayoutLayer('base', [
        createLayoutRow([
          createLayoutSlot(createKeyId('key-a'), 1),
          createLayoutSlot(createKeyId('key-e'), 1),
          createLayoutSlot(createKeyId('key-o'), 1),
        ]),
        createLayoutRow([
          createLayoutSlot(createKeyId('key-shift'), 1.5, '⇧'),
          createLayoutSlot(createKeyId('key-n'), 1),
          createLayoutSlot(createKeyId('key-enter'), 1.5, '⏎'),
        ]),
      ]),
    ],
    'light'
  );
}

/** A minimal mobile layout with 2 rows. */
export function mobileLayoutShape(): LayoutShape {
  return createLayoutShape(
    'mobile-default',
    'mobile',
    [
      createLayoutLayer('base', [
        createLayoutRow([
          createLayoutSlot(createKeyId('key-a'), 1),
          createLayoutSlot(createKeyId('key-e'), 1),
          createLayoutSlot(createKeyId('key-o'), 1),
        ]),
        createLayoutRow([
          createLayoutSlot(createKeyId('key-shift'), 1.5, '⇧'),
          createLayoutSlot(createKeyId('key-n'), 1),
          createLayoutSlot(createKeyId('key-enter'), 1.5, '⏎'),
        ]),
      ]),
    ],
    'light'
  );
}

/** Builds a ResolvedLayout suitable for desktop render model tests. */
export function desktopResolvedLayout(): ResolvedLayout {
  const keyMap = new Map([
    [
      createKeyId('key-a'),
      createResolvedKey(createKeyId('key-a'), {
        base: createKeyOutput('a'),
        shift: createKeyOutput('A'),
        altGr: createKeyOutput('@'),
      }),
    ],
    [
      createKeyId('key-e'),
      createResolvedKey(createKeyId('key-e'), {
        base: createKeyOutput('e'),
        shift: createKeyOutput('E'),
        altGr: createKeyOutput('€'),
      }),
    ],
    [
      createKeyId('key-o'),
      createResolvedKey(createKeyId('key-o'), {
        base: createKeyOutput('o'),
        shift: createKeyOutput('O'),
        altGr: createKeyOutput(''),
      }),
    ],
    [
      createKeyId('key-n'),
      createResolvedKey(createKeyId('key-n'), {
        base: createKeyOutput('n'),
        shift: createKeyOutput('N'),
        altGr: createKeyOutput(''),
      }),
    ],
    [
      createKeyId('key-shift'),
      createResolvedKey(createKeyId('key-shift'), {
        base: createKeyOutput('⇧'),
        shift: createKeyOutput(''),
        altGr: createKeyOutput(''),
      }),
    ],
    [
      createKeyId('key-enter'),
      createResolvedKey(createKeyId('key-enter'), {
        base: createKeyOutput('⏎'),
        shift: createKeyOutput(''),
        altGr: createKeyOutput(''),
      }),
    ],
  ]);

  const profile = createLanguageProfile('yoruba', 'Yoruba', 'Yorùbá', [], yorubaCompositionRules());

  return createResolvedLayout(
    desktopLayoutShape(),
    profile,
    keyMap,
    buildCompositionMap(yorubaCompositionRules())
  );
}

/** Builds a ResolvedLayout suitable for mobile render model tests. */
export function mobileResolvedLayout(): ResolvedLayout {
  const keyMap = new Map([
    [
      createKeyId('key-a'),
      createResolvedKey(
        createKeyId('key-a'),
        {
          base: createKeyOutput('a'),
          shift: createKeyOutput('A'),
          altGr: createKeyOutput(''),
        },
        ['à', 'á', 'â']
      ),
    ],
    [
      createKeyId('key-e'),
      createResolvedKey(
        createKeyId('key-e'),
        {
          base: createKeyOutput('e'),
          shift: createKeyOutput('E'),
          altGr: createKeyOutput(''),
        },
        ['è', 'é', 'ê']
      ),
    ],
    [
      createKeyId('key-o'),
      createResolvedKey(createKeyId('key-o'), {
        base: createKeyOutput('o'),
        shift: createKeyOutput('O'),
        altGr: createKeyOutput(''),
      }),
    ],
    [
      createKeyId('key-n'),
      createResolvedKey(createKeyId('key-n'), {
        base: createKeyOutput('n'),
        shift: createKeyOutput('N'),
        altGr: createKeyOutput(''),
      }),
    ],
    [
      createKeyId('key-shift'),
      createResolvedKey(createKeyId('key-shift'), {
        base: createKeyOutput('⇧'),
        shift: createKeyOutput(''),
        altGr: createKeyOutput(''),
      }),
    ],
    [
      createKeyId('key-enter'),
      createResolvedKey(createKeyId('key-enter'), {
        base: createKeyOutput('⏎'),
        shift: createKeyOutput(''),
        altGr: createKeyOutput(''),
      }),
    ],
  ]);

  const profile = createLanguageProfile('yoruba', 'Yoruba', 'Yorùbá', [], []);

  return createResolvedLayout(mobileLayoutShape(), profile, keyMap, new Map());
}

/** Default desktop render state — base layer, nothing pressed. */
export function defaultDesktopState(
  overrides: Partial<DesktopRenderState> = {}
): DesktopRenderState {
  return {
    activeLayer: 'base',
    modifierDisplayMode: 'hint',
    heldPhysicalKeys: new Set(),
    activeModifierKeyIds: new Set(),
    hiddenKeys: new Set(),
    disabledKeys: new Set(),
    keyboardDisabled: false,
    focusedKeyId: null,
    ...overrides,
  };
}

/** Default mobile render state — base layer, nothing pressed. */
export function defaultMobileState(overrides: Partial<MobileRenderState> = {}): MobileRenderState {
  return {
    activeLayer: 'base',
    hiddenKeys: new Set(),
    disabledKeys: new Set(),
    focusedKeyId: null,
    activeModifierKeyIds: new Set(),
    longPressKeyId: null,
    longPressVisible: false,
    longPressSelectedIndex: 0,
    widthBucket: 'md',
    ...overrides,
  };
}
