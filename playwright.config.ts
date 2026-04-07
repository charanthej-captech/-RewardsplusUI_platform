import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  testMatch: '**/*.spec.ts',
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 1,
  workers: process.env.CI ? 1 : undefined,

  reporter: [
    ['html', { outputFolder: 'playwright-report', open: 'never' }],
    ['json', { outputFile: 'test-results/results.json' }],
    ['./reporters/slack-reporter.js'],
    ['allure-playwright', {
      detail: true,
      outputFolder: 'allure-results',
      suiteTitle: true,
      environmentInfo: {
        client: process.env.CLIENT ?? 'unknown',
        env:    process.env.ENV    ?? 'unknown',
      },
    }],
  ],

  use: {
    headless: !!process.env.CI,
    screenshot: 'on',
    video: 'retain-on-failure',
    trace: 'on-first-retry',
  },

  projects: [
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
        // Maximised window locally; fixed viewport in CI (no display server)
        ...(process.env.CI
          ? { viewport: { width: 1920, height: 1080 } }
          : { viewport: null, deviceScaleFactor: undefined, launchOptions: { args: ['--start-maximized'] } }
        ),
      },
    },
  ],
});
