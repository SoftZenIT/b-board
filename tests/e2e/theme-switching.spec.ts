import { test, expect } from '@playwright/test';

test.describe('Theme Switching', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should switch to light theme explicitly', async ({ page }) => {
    await page.click('#btn-light');
    await expect(page.locator('#theme-mode')).toHaveText('light');
    await expect(page.locator('#effective-theme')).toHaveText('light');
    await expect(page.locator('benin-keyboard')).not.toHaveClass(/theme-dark/);
  });

  test('should switch to dark theme explicitly', async ({ page }) => {
    await page.click('#btn-dark');
    await expect(page.locator('#theme-mode')).toHaveText('dark');
    await expect(page.locator('#effective-theme')).toHaveText('dark');
    await expect(page.locator('benin-keyboard')).toHaveClass(/theme-dark/);
  });

  test('should switch back to auto theme', async ({ page }) => {
    await page.click('#btn-dark');
    await page.click('#btn-auto');
    await expect(page.locator('#theme-mode')).toHaveText('auto');
    // effective-theme depends on system preference, but we can verify class presence
  });
});
