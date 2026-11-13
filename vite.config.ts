import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('react') || id.includes('react-dom') || id.includes('react-router')) return 'vendor'
            if (id.includes('@tanstack')) return 'query'
            if (id.includes('@radix-ui')) return 'ui'
            if (id.includes('react-hook-form') || id.includes('zod') || id.includes('@hookform')) return 'forms'
          }
        },
      },
    },
  },
  server: {
    port: 3000,
  },
})
