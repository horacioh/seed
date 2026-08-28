import stylex from '@stylexjs/unplugin'
import react from '@vitejs/plugin-react'
import {resolve} from 'path'
import {defineConfig} from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    stylex.vite({
      // Minify the atomic CSS StyleX appends; Vite's own minifier never sees it.
      lightningcssOptions: {minify: true},
      cssInjectionTarget: (fileName: string) => /(^|\/)(?:index|main)(?:[.\-][A-Za-z0-9_.-]+)?\.css$/.test(fileName),
    }),
    react(),
  ],
  base: './', // Use relative paths
  publicDir: 'public',
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
      },
    },
    // Ensure large performance data files are included
    assetsInlineLimit: 0, // Don't inline any assets as base64
    copyPublicDir: true, // Explicitly enable copying public dir (default is true)
  },
  server: {
    open: true,
  },
})
