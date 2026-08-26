import {defineConfig} from 'vitest/config'
import * as path from 'path'
import {fileURLToPath} from 'node:url'
import stylex from '@stylexjs/unplugin'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

export default defineConfig({
  plugins: [stylex.vite()],
  resolve: {
    alias: {
      '@seed-hypermedia/client': path.resolve(__dirname, '../client/src'),
      '@shm/shared': path.resolve(__dirname, '../shared/src'),
    },
  },
})
