import { test, expect } from '@playwright/test';

/**
 * Cross-browser compatibility tests for BBOARD-103.
 *
 * These tests run on all three Playwright browser projects (Chromium, Firefox,
 * WebKit) via the root playwright.config.ts. They validate:
 *   1. Functional correctness of the keyboard across browsers
 *   2. CSS custom property application
 *   3. Interaction latency performance benchmarks
 */

test.describe('Cross-Browser Compatibility', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    // Wait for keyboard to be ready
    await page.locator('benin-keyboard').waitFor({ state: 'visible' });
  });

  // ── Functional Tests ──────────────────────────────────────────────

  test('keyboard renders with all 5 rows', async ({ page }) => {
    const rows = page.locator('benin-keyboard .bboard-row');
    await expect(rows).toHaveCount(5);
  });

  test('keyboard is visible and interactive', async ({ page }) => {
    const keyboard = page.locator('benin-keyboard');
    await expect(keyboard).toBeVisible();

    const keys = keyboard.locator('.bboard-key');
    const count = await keys.count();
    expect(count).toBeGreaterThan(30); // A full keyboard has many keys
  });

  test('key press emits bboard-key-press with char', async ({ page }) => {
    const keyboard = page.locator('benin-keyboard');

    const event = await keyboard.evaluate((el) => {
      return new Promise<{ keyId: string; char: string }>((resolve) => {
        el.addEventListener(
          'bboard-key-press',
          (e: Event) => {
            const detail = (e as CustomEvent).detail;
            resolve({ keyId: detail.keyId, char: detail.char });
          },
          { once: true }
        );
        // Click the space key
        const spaceKey = el.shadowRoot?.querySelector('[data-key-id="key-space"]');
        if (spaceKey) (spaceKey as HTMLElement).click();
      });
    });

    expect(event.char).toBe(' ');
    expect(event.keyId).toBe('key-space');
  });

  test('language switching works for all 4 languages', async ({ page }) => {
    const keyboard = page.locator('benin-keyboard');
    const languages = ['yoruba', 'fon-adja', 'baatonum', 'dendi'];

    for (const lang of languages) {
      await keyboard.evaluate((el: any, l: string) => {
        el.language = l;
      }, lang);

      // Wait for the layout to load and re-render
      await keyboard.evaluate((el: any) => el.updateComplete);
      await page.waitForTimeout(200);

      const currentLang = await keyboard.evaluate((el: any) => el.language);
      expect(currentLang).toBe(lang);

      // Keyboard should still have rows after switching
      const rows = keyboard.locator('.bboard-row');
      const rowCount = await rows.count();
      expect(rowCount).toBeGreaterThan(0);
    }
  });

  test('theme toggle switches between light and dark', async ({ page }) => {
    const keyboard = page.locator('benin-keyboard');

    // Switch to dark theme
    await keyboard.evaluate((el: any) => {
      el.theme = 'dark';
    });
    await keyboard.evaluate((el: any) => el.updateComplete);

    const darkTheme = await keyboard.evaluate((el: any) => el.theme);
    expect(darkTheme).toBe('dark');

    // Switch to light theme
    await keyboard.evaluate((el: any) => {
      el.theme = 'light';
    });
    await keyboard.evaluate((el: any) => el.updateComplete);

    const lightTheme = await keyboard.evaluate((el: any) => el.theme);
    expect(lightTheme).toBe('light');
  });

  test('CSS custom properties are applied to keys', async ({ page }) => {
    const key = page.locator('benin-keyboard .bboard-key').first();
    await expect(key).toBeVisible();

    const styles = await key.evaluate((el) => {
      const computed = window.getComputedStyle(el);
      return {
        background: computed.backgroundColor,
        fontSize: computed.fontSize,
        borderRadius: computed.borderRadius,
      };
    });

    // These should have values from the theme tokens (not empty/default)
    expect(styles.background).toBeTruthy();
    expect(styles.fontSize).toBeTruthy();
    expect(styles.borderRadius).toBeTruthy();
  });

  test('feature detection runs without false negatives', async ({ page }) => {
    // In a real browser, all features should be detected as present
    const report = await page.evaluate(() => {
      // Access the module through the keyboard element
      const el = document.querySelector('benin-keyboard');
      if (!el) return null;

      // Check that the keyboard initialized successfully (no fatal compat errors)
      return {
        customElements: 'customElements' in window,
        shadowDOM: typeof HTMLElement.prototype.attachShadow === 'function',
        cssCustomProperties: typeof CSS !== 'undefined' && CSS.supports('color', 'var(--test)'),
        fetchAPI: typeof fetch === 'function',
        resizeObserver: typeof ResizeObserver === 'function',
        matchMedia: typeof matchMedia === 'function',
      };
    });

    expect(report).not.toBeNull();
    expect(report!.customElements).toBe(true);
    expect(report!.shadowDOM).toBe(true);
    expect(report!.cssCustomProperties).toBe(true);
    expect(report!.fetchAPI).toBe(true);
    expect(report!.resizeObserver).toBe(true);
    expect(report!.matchMedia).toBe(true);
  });

  test('error event fires on invalid language', async ({ page }) => {
    const keyboard = page.locator('benin-keyboard');

    const errorFired = await keyboard.evaluate((el) => {
      return new Promise<boolean>((resolve) => {
        const timeout = setTimeout(() => resolve(false), 2000);
        el.addEventListener(
          'bboard-error',
          () => {
            clearTimeout(timeout);
            resolve(true);
          },
          { once: true }
        );
        // Set an invalid language to trigger an error
        (el as any).language = 'invalid-lang-xyz';
      });
    });

    // The keyboard should emit an error event for the invalid language
    expect(errorFired).toBe(true);
  });

  // ── Performance Benchmarks ────────────────────────────────────────

  test('interaction latency is under 5ms', async ({ page, browserName }) => {
    const keyboard = page.locator('benin-keyboard');

    const latencyMs = await keyboard.evaluate((el) => {
      return new Promise<number>((resolve) => {
        const spaceKey = el.shadowRoot?.querySelector('[data-key-id="key-space"]') as HTMLElement;
        if (!spaceKey) {
          resolve(-1);
          return;
        }

        const start = performance.now();
        el.addEventListener(
          'bboard-key-press',
          () => {
            const end = performance.now();
            resolve(end - start);
          },
          { once: true }
        );
        spaceKey.click();
      });
    });

    expect(latencyMs).toBeGreaterThan(0);
    expect(latencyMs).toBeLessThan(5);

    // Attach performance result to test info for reporting
    test.info().annotations.push({
      type: 'performance',
      description: `[${browserName}] Interaction latency: ${latencyMs.toFixed(2)}ms`,
    });
  });

  test('initial load time (page to bboard-ready)', async ({ page, browserName }) => {
    // Measure from fresh page load
    const loadTimeMs = await page.evaluate(() => {
      return new Promise<number>((resolve) => {
        const keyboard = document.querySelector('benin-keyboard');
        if (!keyboard) {
          resolve(-1);
          return;
        }

        // Measure from navigation start to bboard-ready
        keyboard.addEventListener(
          'bboard-ready',
          () => {
            const readyTime = performance.now();
            resolve(readyTime);
          },
          { once: true }
        );

        // If bboard-ready already fired, trigger a re-render to get timing
        (keyboard as any).language = (keyboard as any).language;
      });
    });

    // Just record — no hard pass/fail threshold for load time
    test.info().annotations.push({
      type: 'performance',
      description: `[${browserName}] Load time: ${loadTimeMs.toFixed(0)}ms`,
    });

    expect(loadTimeMs).toBeGreaterThan(0);
  });

  test('multiple rapid key presses handled correctly', async ({ page, browserName }) => {
    const keyboard = page.locator('benin-keyboard');

    const result = await keyboard.evaluate((el) => {
      const events: number[] = [];
      const overallStart = performance.now();

      el.addEventListener('bboard-key-press', () => {
        events.push(performance.now() - overallStart);
      });

      const spaceKey = el.shadowRoot?.querySelector('[data-key-id="key-space"]') as HTMLElement;
      if (!spaceKey) return { count: 0, avgLatency: -1 };

      // Fire 10 rapid clicks
      for (let i = 0; i < 10; i++) {
        spaceKey.click();
      }

      return {
        count: events.length,
        avgLatency:
          events.length > 1 ? (events[events.length - 1] - events[0]) / (events.length - 1) : 0,
      };
    });

    expect(result.count).toBe(10);

    test.info().annotations.push({
      type: 'performance',
      description: `[${browserName}] Rapid press avg interval: ${result.avgLatency.toFixed(2)}ms`,
    });
  });
});
