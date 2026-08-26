import {defineConfig} from 'vitest/config'
import path from 'path'
import {fileURLToPath} from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

export default defineConfig({
  resolve: {
    alias: {
      '@shm/shared': path.resolve(__dirname, '../shared/src'),
    },
  },
})
