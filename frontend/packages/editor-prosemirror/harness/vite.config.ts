import react from '@vitejs/plugin-react'
import path from 'path'
import {defineConfig} from 'vite'

/** Dev-only harness: loads a real Seed document into the plain ProseMirror editor. */
export default defineConfig({
  root: __dirname,
  plugins: [react()],
  define: {
    // `@shm/shared` constants read `process.env`. `@shm/ui/get-file-url` resolves `ipfs://` links against
    // SEED_ASSET_HOST, exactly like the app, so point it at the harness's default site.
    'process.env': {
      NODE_ENV: 'development',
      VITE_GATEWAY_URL: 'https://hyper.media',
      SEED_ASSET_HOST: process.env.SEED_ASSET_HOST ?? 'https://seed.horacioh.com',
    },
  },
  server: {port: 5183, host: true},
  resolve: {
    alias: {
      '@shm/shared': path.resolve(__dirname, '../../shared/src'),
      '@shm/ui': path.resolve(__dirname, '../../ui/src'),
      '@seed-hypermedia/client': path.resolve(__dirname, '../../client/src'),
    },
  },
})
