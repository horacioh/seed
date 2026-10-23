import {svelte} from '@sveltejs/vite-plugin-svelte'
import react from '@vitejs/plugin-react'
import path from 'path'
import {defineConfig} from 'vite'

/** Dev-only harness: loads a real Seed document into the Svedit editor, hosted by React. */
export default defineConfig({
  root: __dirname,
  plugins: [react(), svelte({configFile: path.resolve(__dirname, '../svelte.config.js')})],
  server: {port: 5182, host: true},
  resolve: {
    alias: {
      '@shm/shared': path.resolve(__dirname, '../../shared/src'),
      '@seed-hypermedia/client': path.resolve(__dirname, '../../client/src'),
    },
  },
})
