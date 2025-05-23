import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  base: './', // Important for Electron file:// URLs
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks: undefined,
      },
    },
  },
  server: {
    port: 5173, // Use Vite's default port
    proxy: {
      '/api': {
        target: 'http://localhost:3001', // Updated to match backend port
        changeOrigin: true,
        secure: false,
      }
    }
  }
})
