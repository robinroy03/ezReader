import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0',
    port: 5173,
    // Configure headers for PDF files and other assets
    headers: {
      'Cross-Origin-Embedder-Policy': 'credentialless',
      'Cross-Origin-Opener-Policy': 'same-origin'
    }
  },
  publicDir: 'public',
  assetsInclude: ['**/*.pdf'],
  build: {
    rollupOptions: {
      input: {
        main: './index.html'
      }
    }
  }
})
