import { test, expect, type Page } from '@playwright/test';

async function waitForLayoutReady(page: Page): Promise<void> {
  await page.waitForFunction(
    () => !!(document.querySelector('benin-keyboard') as any)?._resolvedLayout
  );
}

function dispatchKeydown(page: Page, code: string, key: string) {
  return page.evaluate(
    ({ code, key }) => {
      window.dispatchEvent(new KeyboardEvent('keydown', { code, key, bubbles: true }));
    },
    { code, key }
  );
}

/** Arms the composition processor with a dead-key trigger by calling process() directly. */
function armWithTrigger(page: Page, trigger: string) {
  return page.evaluate((t) => {
    const el = document.querySelector('benin-keyboard') as any;
    el._compositionProcessor.process('key-placeholder', t);
  }, trigger);
}

test.describe('Composition engine', () => {
  test.beforeEach(async ({ page }) => {
    await page.setViewportSize({ width: 1366, height: 900 });
    await page.goto('/');
    await page.waitForSelector('benin-keyboard');
    await waitForLayoutReady(page);
  });

  test('dead key press is swallowed — process() returns null and processor becomes armed', async ({
    page,
  }) => {
    await page.evaluate(() => {
      (window as any).__bbKeyPressCount = 0;
      document.querySelector('benin-keyboard')!.addEventListener('bboard-key-press', () => {
        (window as any).__bbKeyPressCount++;
      });
    });

    // Call the processor directly with a dead-key trigger; it must return null
    // (swallowed) and not cause any bboard-key-press side-effect.
    const result = await page.evaluate(() => {
      const el = document.querySelector('benin-keyboard') as any;
      return el._compositionProcessor.process('key-placeholder', '´');
    });

    await page.waitForTimeout(50);

    expect(result).toBeNull();

    const count = await page.evaluate(() => (window as any).__bbKeyPressCount);
    expect(count).toBe(0);

    const isArmed = await page.evaluate(
      () => !!(document.querySelector('benin-keyboard') as any)._compositionProcessor?.isArmed
    );
    expect(isArmed).toBe(true);
  });

  test('dead key + base key → composed char via virtual key activation', async ({ page }) => {
    const eventPromise = page.evaluate(() => {
      return new Promise<{ keyId: string; char: string }>((resolve) => {
        document
          .querySelector('benin-keyboard')!
          .addEventListener('bboard-key-press', (e) => resolve((e as CustomEvent).detail), {
            once: true,
          });
      });
    });

    // Arm with acute trigger '´' (Yoruba rule: ´ + a = á)
    await armWithTrigger(page, '´');

    // Activate key-a (base char 'a') through the virtual-key path
    await page.evaluate(() => {
      (document.querySelector('benin-keyboard') as any)._activateKey('key-a');
    });

    const detail = await eventPromise;
    expect(detail.char).toBe('á');
    expect(detail.keyId).toBe('key-a');
  });

  test('cancel clears pending composition — next key outputs plain char', async ({ page }) => {
    const eventPromise = page.evaluate(() => {
      return new Promise<{ keyId: string; char: string }>((resolve) => {
        document
          .querySelector('benin-keyboard')!
          .addEventListener('bboard-key-press', (e) => resolve((e as CustomEvent).detail), {
            once: true,
          });
      });
    });

    // Arm then immediately cancel
    await page.evaluate(() => {
      const el = document.querySelector('benin-keyboard') as any;
      el._compositionProcessor.process('key-placeholder', '´');
      el._compositionProcessor.cancel();
    });

    // Activating key-a should produce plain 'a', not 'á'
    await page.evaluate(() => {
      (document.querySelector('benin-keyboard') as any)._activateKey('key-a');
    });

    const detail = await eventPromise;
    expect(detail.char).toBe('a');
    expect(detail.keyId).toBe('key-a');
  });

  test('physical keyboard: armed processor composes char on KeyQ press', async ({ page }) => {
    const eventPromise = page.evaluate(() => {
      return new Promise<{ keyId: string; char: string }>((resolve) => {
        document
          .querySelector('benin-keyboard')!
          .addEventListener('bboard-key-press', (e) => resolve((e as CustomEvent).detail), {
            once: true,
          });
      });
    });

    // Arm with acute trigger
    await armWithTrigger(page, '´');

    // Dispatch physical KeyQ → maps to key-a (char 'a') in desktop-azerty; composes to 'á'
    await dispatchKeydown(page, 'KeyQ', 'a');

    const detail = await eventPromise;
    expect(detail.char).toBe('á');
    expect(detail.keyId).toBe('key-a');
  });
});
