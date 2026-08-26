import {defineConfig} from 'vitest/config'
import * as path from 'path'
import {fileURLToPath} from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

export default defineConfig({
  resolve: {
    alias: {
      '@seed-hypermedia/client': path.resolve(__dirname, '../client/src'),
    },
  },
})
