import { bench, describe } from 'vitest';
import { createDesktopRenderModel } from '../../ui/desktop/render-model.js';
import { createMobileRenderModel } from '../../ui/mobile/render-model.js';
import {
  desktopResolvedLayout,
  mobileResolvedLayout,
  defaultDesktopState,
  defaultMobileState,
} from '../fixtures/index.js';
import { createKeyId } from '../../public/index.js';

const desktopLayout = desktopResolvedLayout();
const mobileLayout = mobileResolvedLayout();

describe('Render Model Benchmarks', () => {
  bench('createDesktopRenderModel — base layer', () => {
    createDesktopRenderModel(desktopLayout, defaultDesktopState());
  });

  bench('createDesktopRenderModel — shift layer', () => {
    createDesktopRenderModel(desktopLayout, defaultDesktopState({ activeLayer: 'shift' }));
  });

  bench('createDesktopRenderModel — with focused key', () => {
    createDesktopRenderModel(
      desktopLayout,
      defaultDesktopState({ focusedKeyId: createKeyId('key-a') })
    );
  });

  bench('createDesktopRenderModel — with hidden keys', () => {
    createDesktopRenderModel(
      desktopLayout,
      defaultDesktopState({
        hiddenKeys: new Set([createKeyId('key-o'), createKeyId('key-n')]),
      })
    );
  });

  bench('createMobileRenderModel — base layer', () => {
    createMobileRenderModel(mobileLayout, defaultMobileState());
  });

  bench('createMobileRenderModel — with long-press', () => {
    createMobileRenderModel(
      mobileLayout,
      defaultMobileState({
        longPressKeyId: createKeyId('key-a'),
        longPressVisible: true,
        longPressSelectedIndex: 0,
      })
    );
  });

  bench('createMobileRenderModel — xs width bucket', () => {
    createMobileRenderModel(mobileLayout, defaultMobileState({ widthBucket: 'xs' }));
  });
});
