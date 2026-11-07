import react from '@vitejs/plugin-react'
import path from 'path'
import {defineConfig, type Plugin} from 'vite'
import {fileToIpfsBlobs} from '../../client/src/file-to-ipfs'

/**
 * Stand-in for the app's IPFS upload: `POST /ipfs` stores the body under its
 * real UnixFS CID and `GET /ipfs/<cid>` serves it (with Range support for
 * video), falling back to the `site` gateway from the page URL for other CIDs.
 */
function ipfsStandIn(): Plugin {
  const files = new Map<string, {data: Buffer; type: string}>()
  return {
    name: 'ipfs-stand-in',
    configureServer(server) {
      server.middlewares.use('/ipfs', async (req, res) => {
        if (req.method === 'POST') {
          const chunks: Buffer[] = []
          for await (const chunk of req) chunks.push(chunk as Buffer)
          const data = Buffer.concat(chunks)
          const {cid} = await fileToIpfsBlobs(data)
          files.set(cid, {data, type: req.headers['content-type'] || 'application/octet-stream'})
          res.end(JSON.stringify({link: `ipfs://${cid}`}))
          return
        }
        const cid = (req.url ?? '').slice(1).split(/[/?]/)[0]!
        const file = files.get(cid)
        if (!file) {
          const site =
            new URL(req.headers.referer || 'http://x').searchParams.get('site') || 'https://seed.horacioh.com'
          const upstream = await fetch(`${site}/ipfs/${cid}`)
          res.statusCode = upstream.status
          res.setHeader('content-type', upstream.headers.get('content-type') || 'application/octet-stream')
          res.end(Buffer.from(await upstream.arrayBuffer()))
          return
        }
        const range = /bytes=(\d*)-(\d*)/.exec(req.headers.range || '')
        const start = range?.[1] ? Number(range[1]) : 0
        const end = range?.[2] ? Number(range[2]) : file.data.length - 1
        res.statusCode = range ? 206 : 200
        res.setHeader('content-type', file.type)
        res.setHeader('accept-ranges', 'bytes')
        if (range) res.setHeader('content-range', `bytes ${start}-${end}/${file.data.length}`)
        res.end(file.data.subarray(start, end + 1))
      })
    },
  }
}

/** Dev-only harness: loads a real Seed document into the Lexical editor. */
export default defineConfig({
  root: __dirname,
  plugins: [react(), ipfsStandIn()],
  server: {port: 5182, host: true},
  // `@shm/shared/constants` (used by `@shm/ui/get-file-url`) reads `process.env`.
  define: {'process.env': {}},
  resolve: {
    alias: {
      '@shm/shared': path.resolve(__dirname, '../../shared/src'),
      '@shm/ui': path.resolve(__dirname, '../../ui/src'),
      '@seed-hypermedia/client': path.resolve(__dirname, '../../client/src'),
    },
  },
})
