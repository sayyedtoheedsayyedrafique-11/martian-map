import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api/nasa-raw': {
        target: 'https://mars.nasa.gov',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/nasa-raw/, ''),
      },
    },
  },
  build: {
    chunkSizeWarningLimit: 1500,
  },
})
