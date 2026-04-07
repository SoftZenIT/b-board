import { test, expect, type Page } from '@playwright/test';

async function activateMobileKeyboard(page: Page) {
  await page.waitForSelector('benin-keyboard');
  await page.evaluate(() => {
    (document.querySelector('benin-keyboard') as any).layoutVariant = 'mobile-default';
  });
  await page
    .locator('benin-keyboard')
    .locator('.bboard-mobile-keyboard')
    .waitFor({ state: 'visible' });
}

async function dispatchTouchOn(
  page: Page,
  selector: string,
  eventType: 'touchstart' | 'touchend' | 'touchcancel'
) {
  await page.evaluate(
    ({ sel, type }) => {
      const kb = document.querySelector('benin-keyboard')!;
      const el = kb.shadowRoot!.querySelector(sel) as HTMLElement;
      // Use plain Event — the handlers only need e.target (touchstart)
      // or nothing (touchend/touchcancel). Avoids Touch/TouchEvent
      // constructors unsupported in desktop Firefox/WebKit.
      el.dispatchEvent(new Event(type, { bubbles: true, cancelable: true }));
    },
    { sel: selector, type: eventType }
  );
}

test.describe('Mobile keyboard rendering', () => {
  test.beforeEach(async ({ page }) => {
    await page.setViewportSize({ width: 600, height: 844 });
    await page.goto('/');
    await activateMobileKeyboard(page);
  });

  test('renders .bboard-mobile-keyboard container', async ({ page }) => {
    await expect(page.locator('benin-keyboard').locator('.bboard-mobile-keyboard')).toBeVisible();
  });

  test('has 4 rows with class .bboard-mobile-row', async ({ page }) => {
    await expect(page.locator('benin-keyboard').locator('.bboard-mobile-row')).toHaveCount(4);
  });

  test('each key has data-key-id attribute', async ({ page }) => {
    const keys = page.locator('benin-keyboard').locator('.bboard-mobile-key');
    const count = await keys.count();
    expect(count).toBeGreaterThan(0);
    for (let i = 0; i < count; i++) {
      const keyId = await keys.nth(i).getAttribute('data-key-id');
      expect(keyId).toBeTruthy();
    }
  });

  test('all keys meet minimum 44px touch target', async ({ page }) => {
    const sizes = await page
      .locator('benin-keyboard')
      .locator('.bboard-mobile-key')
      .evaluateAll((buttons) =>
        buttons.map((b) => {
          const r = b.getBoundingClientRect();
          return { width: r.width, height: r.height, keyId: b.getAttribute('data-key-id') };
        })
      );

    for (const { width, height, keyId } of sizes) {
      expect(width, `key ${keyId} width ${width}px < 44px`).toBeGreaterThanOrEqual(44);
      expect(height, `key ${keyId} height ${height}px < 44px`).toBeGreaterThanOrEqual(44);
    }
  });
});

test.describe('Tap interaction', () => {
  test.beforeEach(async ({ page }) => {
    await page.setViewportSize({ width: 600, height: 844 });
    await page.goto('/');
    await activateMobileKeyboard(page);
  });

  test('tapping key-a fires bboard-key-press with keyId and char', async ({ page }) => {
    const eventPromise = page.evaluate(() => {
      return new Promise<{ keyId: string; char: string }>((resolve) => {
        document
          .querySelector('benin-keyboard')!
          .addEventListener('bboard-key-press', (e) => resolve((e as CustomEvent).detail), {
            once: true,
          });
      });
    });

    await dispatchTouchOn(page, '[data-key-id="key-a"]', 'touchstart');
    await dispatchTouchOn(page, '[data-key-id="key-a"]', 'touchend');

    const detail = await eventPromise;
    expect(detail.keyId).toBe('key-a');
    expect(detail.char).toBe('a');
  });
});

test.describe('Long-press popup', () => {
  test.beforeEach(async ({ page }) => {
    await page.setViewportSize({ width: 600, height: 844 });
    await page.goto('/');
    await activateMobileKeyboard(page);
  });

  test('holding key-a for 350ms shows .bboard-long-press-popup', async ({ page }) => {
    await dispatchTouchOn(page, '[data-key-id="key-a"]', 'touchstart');
    await page.waitForTimeout(350);
    await expect(page.locator('benin-keyboard').locator('.bboard-long-press-popup')).toBeVisible();
    // Cleanup
    await dispatchTouchOn(page, '[data-key-id="key-a"]', 'touchend');
  });

  test('popup contains correct long-press chars for key-a', async ({ page }) => {
    await dispatchTouchOn(page, '[data-key-id="key-a"]', 'touchstart');
    await page.waitForTimeout(350);

    const popup = page.locator('benin-keyboard').locator('.bboard-long-press-popup');
    await expect(popup).toBeVisible();

    const items = popup.locator('.bboard-long-press-item');
    // key-a in Yoruba has longPress: ["à", "á"]
    await expect(items).toHaveCount(2);
    const texts = (await items.allTextContents()).map((t) => t.trim());
    expect(texts).toContain('à');
    expect(texts).toContain('á');

    // Cleanup
    await dispatchTouchOn(page, '[data-key-id="key-a"]', 'touchend');
  });

  test('touchend after long-press dismisses the popup', async ({ page }) => {
    await dispatchTouchOn(page, '[data-key-id="key-a"]', 'touchstart');
    await page.waitForTimeout(350);
    await expect(page.locator('benin-keyboard').locator('.bboard-long-press-popup')).toBeVisible();

    await dispatchTouchOn(page, '.bboard-mobile-keyboard', 'touchend');

    await expect(
      page.locator('benin-keyboard').locator('.bboard-long-press-popup')
    ).not.toBeVisible();
  });
});

test.describe('Responsive buckets', () => {
  // xs: viewport 320px → keyboard content ~256px < 375 → 'xs'
  // sm: viewport 500px → keyboard content ~436px, 375 <= 436 < 768 → 'sm'

  test('viewport 320px sets data-bucket="xs"', async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 568 });
    await page.goto('/');
    await activateMobileKeyboard(page);
    await page.waitForFunction(() =>
      document.querySelector('benin-keyboard')?.hasAttribute('data-bucket')
    );
    await expect(page.locator('benin-keyboard')).toHaveAttribute('data-bucket', 'xs');
  });

  test('viewport 500px sets data-bucket="sm"', async ({ page }) => {
    await page.setViewportSize({ width: 500, height: 844 });
    await page.goto('/');
    await activateMobileKeyboard(page);
    await page.waitForFunction(() =>
      document.querySelector('benin-keyboard')?.hasAttribute('data-bucket')
    );
    await expect(page.locator('benin-keyboard')).toHaveAttribute('data-bucket', 'sm');
  });
});

test.describe('touchcancel', () => {
  test.beforeEach(async ({ page }) => {
    await page.setViewportSize({ width: 600, height: 844 });
    await page.goto('/');
    await activateMobileKeyboard(page);
  });

  test('touchcancel dismisses popup when visible', async ({ page }) => {
    await dispatchTouchOn(page, '[data-key-id="key-a"]', 'touchstart');
    await page.waitForTimeout(350);
    await expect(page.locator('benin-keyboard').locator('.bboard-long-press-popup')).toBeVisible();

    await dispatchTouchOn(page, '.bboard-mobile-keyboard', 'touchcancel');

    await expect(
      page.locator('benin-keyboard').locator('.bboard-long-press-popup')
    ).not.toBeVisible();
  });
});
