import react from '@vitejs/plugin-react'
import path from 'path'
import stylex from '@stylexjs/unplugin'
import {defineConfig} from 'vite'
import tsconfigPaths from 'vite-tsconfig-paths'

export default defineConfig({
  plugins: [
    stylex.vite({
      // Minify the atomic CSS StyleX appends; Vite's own minifier never sees it.
      lightningcssOptions: {minify: true},
      cssInjectionTarget: (fileName: string) => /(^|\/)(?:index|stylex)(?:[.\-][A-Za-z0-9_.-]+)?\.css$/.test(fileName),
    }),
    react(),
    tsconfigPaths({root: path.resolve(__dirname, '../../..')}),
  ],
  root: path.resolve(__dirname, 'test-app'),
  define: {
    // TODO: Define process.env for dependencies
    'process.env': {
      NODE_ENV: JSON.stringify('development'),
      VITE_GATEWAY_URL: JSON.stringify('https://hyper.media'),
    },
  },
  resolve: {
    dedupe: [
      '@shm/shared',
      '@shm/shared/*',
      '@shm/editor',
      '@shm/editor/*',
      '@shm/ui',
      '@shm/ui/*',
      '@seed-hypermedia/client',
      'react',
      'react-dom',
    ],
  },
  server: {
    port: 5180,
    strictPort: true,
  },
})
