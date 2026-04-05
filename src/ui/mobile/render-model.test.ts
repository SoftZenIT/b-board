import { describe, expect, it } from 'vitest';
import {
  createKeyId,
  createLayoutLayer,
  createLayoutRow,
  createLayoutShape,
  createLayoutSlot,
  createResolvedKey,
  createResolvedLayout,
  createKeyOutput,
  type ResolvedLayout,
} from '../../public/index.js';
import { createMobileRenderModel } from './render-model.js';
import type { MobileRenderState } from './render-model.js';

function makeLayout(): ResolvedLayout {
  const rows = [
    createLayoutRow([
      createLayoutSlot(createKeyId('key-a'), 1),
      createLayoutSlot(createKeyId('key-e'), 1),
    ]),
    createLayoutRow([
      createLayoutSlot(createKeyId('key-shift'), 1.5, '⇧'),
      createLayoutSlot(createKeyId('key-space'), 5, ' '),
    ]),
    createLayoutRow([createLayoutSlot(createKeyId('key-enter'), 2, '⏎')]),
  ];
  const shape = createLayoutShape(
    'mobile-default',
    'mobile',
    [createLayoutLayer('base', rows)],
    'auto'
  );
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
        ['à', 'á']
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
        ['è', 'é']
      ),
    ],
    [
      createKeyId('key-shift'),
      createResolvedKey(createKeyId('key-shift'), {
        base: createKeyOutput(''),
        shift: createKeyOutput(''),
        altGr: createKeyOutput(''),
      }),
    ],
    [
      createKeyId('key-space'),
      createResolvedKey(createKeyId('key-space'), {
        base: createKeyOutput(' '),
        shift: createKeyOutput(' '),
        altGr: createKeyOutput(' '),
      }),
    ],
    [
      createKeyId('key-enter'),
      createResolvedKey(createKeyId('key-enter'), {
        base: createKeyOutput(''),
        shift: createKeyOutput(''),
        altGr: createKeyOutput(''),
      }),
    ],
  ]);
  return createResolvedLayout(
    shape,
    {
      languageId: 'yoruba',
      name: 'Yoruba',
      nativeName: 'Yorùbá',
      characters: [],
      compositionRules: [],
    },
    keyMap,
    new Map()
  );
}

const baseState: MobileRenderState = {
  activeLayer: 'base',
  hiddenKeys: new Set(),
  disabledKeys: new Set(),
  focusedKeyId: null,
  activeModifierKeyIds: new Set(),
  longPressKeyId: null,
  longPressVisible: false,
  longPressSelectedIndex: 0,
  widthBucket: 'sm',
};

describe('createMobileRenderModel', () => {
  it('produces one row per layout row', () => {
    const model = createMobileRenderModel(makeLayout(), baseState);
    expect(model.rows).toHaveLength(3);
  });

  it('assigns thumbComfort low/medium/high by row index', () => {
    const model = createMobileRenderModel(makeLayout(), baseState);
    expect(model.rows[0].keys[0].thumbComfort).toBe('low');
    expect(model.rows[1].keys[0].thumbComfort).toBe('medium');
    expect(model.rows[2].keys[0].thumbComfort).toBe('high');
  });

  it('marks keys with longPress data', () => {
    const model = createMobileRenderModel(makeLayout(), baseState);
    const keyA = model.rows[0].keys.find((k) => k.keyId === 'key-a')!;
    expect(keyA.hasLongPress).toBe(true);
    expect(keyA.longPressChars).toEqual(['à', 'á']);
  });

  it('marks action keys correctly', () => {
    const model = createMobileRenderModel(makeLayout(), baseState);
    const shift = model.rows[1].keys.find((k) => k.keyId === 'key-shift')!;
    const space = model.rows[1].keys.find((k) => k.keyId === 'key-space')!;
    const a = model.rows[0].keys.find((k) => k.keyId === 'key-a')!;
    expect(shift.isActionKey).toBe(true);
    expect(space.isActionKey).toBe(true);
    expect(a.isActionKey).toBe(false);
  });

  it('sets tabStop on the first focusable key when none is focused', () => {
    const model = createMobileRenderModel(makeLayout(), baseState);
    const tabStops = model.rows.flatMap((r) => r.keys).filter((k) => k.tabStop);
    expect(tabStops).toHaveLength(1);
    expect(tabStops[0].keyId).toBe('key-a');
  });

  it('sets tabStop on the focused key when one is focused', () => {
    const state: MobileRenderState = { ...baseState, focusedKeyId: createKeyId('key-e') };
    const model = createMobileRenderModel(makeLayout(), state);
    const tabStops = model.rows.flatMap((r) => r.keys).filter((k) => k.tabStop);
    expect(tabStops).toHaveLength(1);
    expect(tabStops[0].keyId).toBe('key-e');
  });

  it('produces longPressPopup when longPressVisible is true', () => {
    const state: MobileRenderState = {
      ...baseState,
      longPressKeyId: createKeyId('key-a'),
      longPressVisible: true,
      longPressSelectedIndex: 1,
    };
    const model = createMobileRenderModel(makeLayout(), state);
    expect(model.longPressPopup).not.toBeNull();
    expect(model.longPressPopup?.anchorKeyId).toBe('key-a');
    expect(model.longPressPopup?.items).toEqual(['à', 'á']);
    expect(model.longPressPopup?.selectedIndex).toBe(1);
  });

  it('produces no longPressPopup when longPressVisible is false', () => {
    const state: MobileRenderState = {
      ...baseState,
      longPressKeyId: createKeyId('key-a'),
      longPressVisible: false,
    };
    const model = createMobileRenderModel(makeLayout(), state);
    expect(model.longPressPopup).toBeNull();
  });

  it('passes widthBucket through to the model', () => {
    const state: MobileRenderState = { ...baseState, widthBucket: 'xs' };
    const model = createMobileRenderModel(makeLayout(), state);
    expect(model.widthBucket).toBe('xs');
  });
});
