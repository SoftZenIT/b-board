import { test, expect } from '@playwright/test';

test.describe('Auto Theme Detection', () => {
  test('should detect light mode by default', async ({ page }) => {
    await page.emulateMedia({ colorScheme: 'light' });
    await page.goto('/');

    // Wait for keyboard to fully render
    await page.locator('benin-keyboard .bboard-row').first().waitFor();

    await expect(page.locator('benin-keyboard')).not.toHaveClass(/theme-dark/);
  });

  test('should detect dark mode from system preference', async ({ page }) => {
    await page.emulateMedia({ colorScheme: 'dark' });
    await page.goto('/');

    // Wait for keyboard to fully render
    await page.locator('benin-keyboard .bboard-row').first().waitFor();

    await expect(page.locator('benin-keyboard')).toHaveClass(/theme-dark/);
  });

  test('should respond to dynamic system theme changes', async ({ page }) => {
    await page.emulateMedia({ colorScheme: 'light' });
    await page.goto('/');

    // Wait for keyboard to fully render
    await page.locator('benin-keyboard .bboard-row').first().waitFor();

    await expect(page.locator('benin-keyboard')).not.toHaveClass(/theme-dark/);

    await page.emulateMedia({ colorScheme: 'dark' });
    await expect(page.locator('benin-keyboard')).toHaveClass(/theme-dark/);
  });
});
