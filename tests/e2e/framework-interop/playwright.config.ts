import { defineConfig, devices } from '@playwright/test';

/**
 * Playwright config for cross-framework consistency tests.
 * Runs against React (5174), Vue (5175), and Angular (5176) dev servers.
 * These servers must be started externally (e.g., by the CI workflow).
 */
export default defineConfig({
  testDir: '.',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  reporter: 'html',
  use: {
    trace: 'on-first-retry',
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
});
