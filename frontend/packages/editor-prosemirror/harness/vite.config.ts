import react from '@vitejs/plugin-react'
import path from 'path'
import {defineConfig} from 'vite'

// `@shm/ui/get-file-url` resolves `ipfs://` links against SEED_ASSET_HOST,
// exactly like the app. Point it at the harness's default site.
process.env.SEED_ASSET_HOST ??= 'https://seed.horacioh.com'

/** Dev-only harness: loads a real Seed document into the plain ProseMirror editor. */
export default defineConfig({
  root: __dirname,
  plugins: [react()],
  envPrefix: ['VITE_', 'SEED_ASSET_HOST'],
  server: {port: 5183, host: true},
  resolve: {
    alias: {
      '@shm/shared': path.resolve(__dirname, '../../shared/src'),
      '@shm/ui': path.resolve(__dirname, '../../ui/src'),
      '@seed-hypermedia/client': path.resolve(__dirname, '../../client/src'),
    },
  },
})
