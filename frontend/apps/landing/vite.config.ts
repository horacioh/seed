import stylex from '@stylexjs/unplugin'
import react from '@vitejs/plugin-react'
import {defineConfig} from 'vite'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    stylex.vite({
      cssInjectionTarget: (fileName: string) => /(^|\/)index(?:[.\-][A-Za-z0-9_.-]+)?\.css$/.test(fileName),
    }),
    react(),
  ],
  publicDir: 'public',
  build: {
    assetsDir: 'landing-assets',
    rollupOptions: {
      output: {
        entryFileNames: 'landing-assets/[name].[hash].js',
        chunkFileNames: 'landing-assets/[name].[hash].js',
        assetFileNames: 'landing-assets/[name].[hash][extname]',
      },
    },
  },
})
