import {defineConfig} from 'vitest/config'

export default defineConfig({
  resolve: {alias: {'@shm/ui': new URL('../../packages/ui/src', import.meta.url).pathname}},
  server: {port: 4310, strictPort: true},
  test: {include: ['src/**/*.test.{ts,tsx}', 'verification/**/*.test.ts']},
})
