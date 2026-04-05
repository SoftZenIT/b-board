import { test, expect, type Page } from '@playwright/test';

async function waitForLayoutReady(page: Page): Promise<void> {
  await page.waitForFunction(
    () => !!(document.querySelector('benin-keyboard') as any)?._resolvedLayout
  );
}

function dispatchKeydown(
  page: Page,
  code: string,
  key: string,
  options: { repeat?: boolean } = {}
) {
  return page.evaluate(
    ({ code, key, repeat }) => {
      window.dispatchEvent(new KeyboardEvent('keydown', { code, key, repeat, bubbles: true }));
    },
    { code, key, repeat: options.repeat ?? false }
  );
}

test.describe('Physical keyboard output', () => {
  test.beforeEach(async ({ page }) => {
    await page.setViewportSize({ width: 1366, height: 900 });
    await page.goto('/');
    await page.waitForSelector('benin-keyboard');
    await waitForLayoutReady(page);
  });

  test('KeyQ fires bboard-key-press with keyId key-a on desktop-azerty', async ({ page }) => {
    const eventPromise = page.evaluate(() => {
      return new Promise<{ keyId: string; char: string }>((resolve) => {
        document
          .querySelector('benin-keyboard')!
          .addEventListener('bboard-key-press', (e) => resolve((e as CustomEvent).detail), {
            once: true,
          });
      });
    });

    await dispatchKeydown(page, 'KeyQ', 'a');

    const detail = await eventPromise;
    expect(detail.keyId).toBe('key-a');
  });

  test('Shift and AltGr keydown do not trigger bboard-key-press', async ({ page }) => {
    await page.evaluate(() => {
      (window as any).__bbKeyPressCount = 0;
      document.querySelector('benin-keyboard')!.addEventListener('bboard-key-press', () => {
        (window as any).__bbKeyPressCount++;
      });
    });

    await dispatchKeydown(page, 'ShiftLeft', 'Shift');
    await dispatchKeydown(page, 'AltRight', 'AltGraph');

    await page.waitForTimeout(100);

    const count = await page.evaluate(() => (window as any).__bbKeyPressCount);
    expect(count).toBe(0);
  });

  test('auto-repeat keydown fires bboard-key-press only once', async ({ page }) => {
    await page.evaluate(() => {
      (window as any).__bbKeyPressEvents = [] as Array<{ keyId: string; char: string }>;
      document.querySelector('benin-keyboard')!.addEventListener('bboard-key-press', (e) => {
        (window as any).__bbKeyPressEvents.push((e as CustomEvent).detail);
      });
    });

    await dispatchKeydown(page, 'KeyQ', 'a', { repeat: false });
    await dispatchKeydown(page, 'KeyQ', 'a', { repeat: true });
    await dispatchKeydown(page, 'KeyQ', 'a', { repeat: true });

    await page.waitForTimeout(100);

    const events = await page.evaluate(
      () => (window as any).__bbKeyPressEvents as Array<{ keyId: string }>
    );
    expect(events).toHaveLength(1);
    expect(events[0].keyId).toBe('key-a');
  });

  test('mobile-default variant does not fire bboard-key-press for physical key press', async ({
    page,
  }) => {
    await page.evaluate(() => {
      (document.querySelector('benin-keyboard') as any).layoutVariant = 'mobile-default';
    });

    await page.evaluate(() => {
      (window as any).__bbKeyPressCount = 0;
      document.querySelector('benin-keyboard')!.addEventListener('bboard-key-press', () => {
        (window as any).__bbKeyPressCount++;
      });
    });

    await dispatchKeydown(page, 'KeyQ', 'a');

    await page.waitForTimeout(100);

    const count = await page.evaluate(() => (window as any).__bbKeyPressCount);
    expect(count).toBe(0);
  });

  test('blur clears held modifiers so KeyQ after ShiftLeft+blur outputs base-layer char', async ({
    page,
  }) => {
    // Hold ShiftLeft so layer becomes 'shift'
    await dispatchKeydown(page, 'ShiftLeft', 'Shift');

    // Trigger window blur — this calls _handleWindowBlur which clears heldPhysicalKeys
    await page.evaluate(() => {
      window.dispatchEvent(new Event('blur'));
    });

    const eventPromise = page.evaluate(() => {
      return new Promise<{ keyId: string; char: string }>((resolve) => {
        document
          .querySelector('benin-keyboard')!
          .addEventListener('bboard-key-press', (e) => resolve((e as CustomEvent).detail), {
            once: true,
          });
      });
    });

    await dispatchKeydown(page, 'KeyQ', 'a');

    const detail = await eventPromise;
    expect(detail.keyId).toBe('key-a');
    // Blur cleared held Shift, so char is base-layer 'a', not shift-layer 'A'
    expect(detail.char).toBe('a');
  });
});
