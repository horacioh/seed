import {svelte} from '@sveltejs/vite-plugin-svelte'
import react from '@vitejs/plugin-react'
import fs from 'fs'
import path from 'path'
import {defineConfig} from 'vite'

/** Dev-only harness: loads a real Seed document into the Svedit editor, hosted by React. */
export default defineConfig({
  root: __dirname,
  plugins: [
    react(),
    svelte({configFile: path.resolve(__dirname, '../svelte.config.js')}),
    {
      // A stand-in IPFS gateway: `/ipfs/<cid>` serves `public/ipfs/<cid>` when the
      // harness has that file, otherwise redirects to the site's `/ipfs/<cid>`.
      name: 'harness-ipfs-gateway',
      configureServer(server) {
        server.middlewares.use('/ipfs', (req, res, next) => {
          const url = new URL(req.url ?? '/', 'http://harness')
          const cid = url.pathname.slice(1)
          if (/^\w+$/.test(cid) && fs.existsSync(path.resolve(__dirname, 'public/ipfs', cid))) return next()
          res.statusCode = 302
          res.setHeader('Location', `${url.searchParams.get('site') || 'https://seed.horacioh.com'}/ipfs/${cid}`)
          res.end()
        })
      },
    },
  ],
  server: {port: 5182, host: true},
  // `@shm/shared/constants` (imported by `@shm/ui/get-file-url`) reads `process.env`; same as the editor e2e harness.
  define: {'process.env': {NODE_ENV: JSON.stringify('development')}},
  resolve: {
    alias: {
      '@shm/shared': path.resolve(__dirname, '../../shared/src'),
      '@shm/ui': path.resolve(__dirname, '../../ui/src'),
      '@seed-hypermedia/client': path.resolve(__dirname, '../../client/src'),
    },
  },
})
