import react from '@vitejs/plugin-react'
import {defineConfig} from 'vite'

const extensions = ['.web.tsx', '.tsx', '.web.ts', '.ts', '.web.jsx', '.jsx', '.web.js', '.js', '.css', '.json', '.mjs']

// Minimal config for loading window - no tsConfigPaths, no sentry
export default defineConfig(() => ({
  build: {
    sourcemap: !(process.platform === 'win32' && process.env.CI),
    rollupOptions: {
      input: {
        app: './loading.html',
      },
    },
  },
  plugins: [react()],
  resolve: {
    extensions,
  },
  optimizeDeps: {
    esbuildOptions: {
      resolveExtensions: extensions,
    },
  },
  // Define environment variables for the loading renderer
  define: {
    // Define process object for the renderer process (browser environment)
    process: JSON.stringify({
      env: {},
      platform: process.platform,
      arch: process.arch,
      versions: process.versions,
    }),
    global: 'globalThis',
  },
}))
