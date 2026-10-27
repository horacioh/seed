import {defineConfig} from '@playwright/test'

const isDesktop = process.env.A11Y_SCREEN_READER_SURFACE === 'desktop'
const voiceoverProject = {
  name: 'voiceover',
  testMatch: ['**/*.voiceover.spec.ts'],
  use: {browserName: 'webkit' as const},
}
const nvdaProject = {
  name: 'nvda',
  testMatch: ['**/*.nvda.spec.ts'],
  use: {browserName: 'chromium' as const},
}
const allProjects = [voiceoverProject, nvdaProject]
const platformProjects =
  process.platform === 'darwin' ? [voiceoverProject] : process.platform === 'win32' ? [nvdaProject] : []
const projects = process.env.SR_PROJECTS === 'all' ? allProjects : platformProjects

export default defineConfig({
  testDir: './screen-reader',
  testMatch: ['**/*.spec.ts'],
  fullyParallel: false,
  workers: 1,
  timeout: 120_000,
  expect: {timeout: 15_000},
  outputDir: './screen-reader/test-results',
  use: {
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
  },
  projects,
  webServer: isDesktop
    ? undefined
    : [
        {
          name: 'reader-site',
          command: 'bun screen-reader/start-reader-site.ts',
          stdout: 'pipe',
          stderr: 'pipe',
          url: 'http://localhost:3000',
          timeout: 300_000,
          reuseExistingServer: !process.env.CI,
        },
        {
          name: 'editor-harness',
          command: 'pnpm --dir ../editor test:harness -- --host 0.0.0.0',
          stdout: 'pipe',
          stderr: 'pipe',
          url: 'http://localhost:5180',
          reuseExistingServer: !process.env.CI,
        },
        {
          name: 'vault',
          command: 'bun run --cwd ../../../vault dev',
          stdout: 'pipe',
          stderr: 'pipe',
          url: 'http://localhost:3030/vault',
          reuseExistingServer: !process.env.CI,
        },
      ],
})
