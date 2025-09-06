import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import { fileURLToPath, URL } from 'node:url'

// https://vitejs.dev/config/
export default defineConfig({
  resolve: {
    alias: [{find: "@/*", replacement: path.resolve(fileURLToPath(new URL('.', import.meta.url)), "src") + "/"}],
  },
  server: {
    port: 3000,
    host: '0.0.0.0',
    allowedHosts: [
      'shoppuda.kro.kr',
    ],
    proxy: {
      '/api': {
        target: 'http://localhost:8000',
        changeOrigin: true,
        secure: false,
      },
      '/ws': {
        target: 'ws://localhost:8000',
        ws: true,
        changeOrigin: true,
      },
    },
  },
  build: {
    outDir: '../static/react',
    emptyOutDir: true,
    manifest: true,
    rollupOptions: {
      input: {
        main: path.resolve(fileURLToPath(new URL('.', import.meta.url)), 'index.html'),
      },
    },
  },
})