import path from 'path'
import {defineConfig} from 'vitest/config'

export default defineConfig({
  test: {environment: 'jsdom', include: ['__tests__/**/*.test.ts?(x)']},
  resolve: {
    alias: {
      '@shm/shared': path.resolve(__dirname, '../shared/src'),
      '@seed-hypermedia/client': path.resolve(__dirname, '../client/src'),
    },
  },
})
