import react from '@vitejs/plugin-react'
import path from 'path'
import {defineConfig} from 'vite'

/** Dev-only harness: loads a real Seed document into the ProseKit editor. */
export default defineConfig({
  root: __dirname,
  plugins: [react()],
  server: {port: 5181, host: true},
  resolve: {
    alias: {
      '@shm/shared': path.resolve(__dirname, '../../shared/src'),
      '@seed-hypermedia/client': path.resolve(__dirname, '../../client/src'),
    },
  },
})
