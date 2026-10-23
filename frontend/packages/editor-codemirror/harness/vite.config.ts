import react from '@vitejs/plugin-react'
import path from 'path'
import {defineConfig} from 'vite'

/** Dev-only harness: loads a real Seed document into the CodeMirror editor. */
export default defineConfig({
  root: __dirname,
  plugins: [react()],
  server: {port: 5184, host: true},
  // @shm/shared/constants reads process.env as a fallback for Electron/Node.
  define: {'process.env': '{}'},
  resolve: {
    alias: {
      '@shm/shared': path.resolve(__dirname, '../../shared/src'),
      '@seed-hypermedia/client': path.resolve(__dirname, '../../client/src'),
      '@shm/ui': path.resolve(__dirname, '../../ui/src'),
    },
  },
})
