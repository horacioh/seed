import {svelte} from '@sveltejs/vite-plugin-svelte'
import path from 'path'
import {defineConfig} from 'vitest/config'

export default defineConfig({
  plugins: [svelte()],
  test: {
    environment: 'jsdom',
    include: ['__tests__/**/*.test.ts'],
    server: {deps: {inline: ['svedit']}},
  },
  resolve: {
    conditions: ['browser'],
    alias: {
      '@shm/shared': path.resolve(__dirname, '../shared/src'),
      '@seed-hypermedia/client': path.resolve(__dirname, '../client/src'),
    },
  },
})
