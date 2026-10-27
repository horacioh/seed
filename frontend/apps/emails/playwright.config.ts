import {defineConfig, devices} from '@playwright/test'

export default defineConfig({
  testDir: './tests',
  testMatch: '**/*.spec.ts',
  timeout: 60000,
  outputDir: process.env.A11Y_EMAIL_ARTIFACT_DIR ?? './test-results',
  use: {
    ...devices['Desktop Chrome'],
    viewport: {width: 640, height: 900},
    headless: true,
  },
})
