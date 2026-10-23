import react from '@vitejs/plugin-react'
import path from 'path'
import {defineConfig} from 'vite'

/** Dev-only harness: loads a real Seed document into the Tiptap editor. */
export default defineConfig({
  root: __dirname,
  plugins: [react()],
  server: {port: 5185, host: true},
  // `@shm/ui/get-file-url` pulls in `@shm/shared`, which reads `process.env`.
  define: {'process.env': {}},
  resolve: {
    alias: {
      '@shm/shared': path.resolve(__dirname, '../../shared/src'),
      '@seed-hypermedia/client': path.resolve(__dirname, '../../client/src'),
      '@shm/ui': path.resolve(__dirname, '../../ui/src'),
    },
  },
})
