import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 3000,
    host: '0.0.0.0',
    allowedHosts: [
      'shoppuda.kro.kr',
    ],
    proxy: {
      '/api': {
        target: 'http://shoppuda.kro.kr:8000',
        changeOrigin: true,
        secure: false,
      },
      '/ws': {
        target: 'ws://shoppuda.kro.kr:8000',
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
        main: path.resolve(__dirname, 'index.html'),
      },
    },
  },
})