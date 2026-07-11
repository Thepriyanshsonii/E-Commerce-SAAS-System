import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  // Load env variables to make them available in this config file
  const env = loadEnv(mode, process.cwd(), '')

  return {
    plugins: [
      react(),
      tailwindcss()
    ],
    server: {
      // Local dev proxy: forwards /api requests to the local Flask backend.
      // This means you DON'T need VITE_API_BASE_URL set locally.
      proxy: {
        '/api': {
          target: env.VITE_PROXY_TARGET || 'http://localhost:5000',
          changeOrigin: true,
        }
      }
    },
    build: {
      rollupOptions: {
        output: {
          manualChunks(id) {
            if (id.includes('node_modules')) {
              if (id.includes('react') || id.includes('react-dom') || id.includes('react-router-dom')) {
                return 'vendor-react';
              }
              if (id.includes('framer-motion')) {
                return 'vendor-framer-motion';
              }
              if (id.includes('lucide-react')) {
                return 'vendor-lucide';
              }
              return 'vendor-others';
            }
          }
        }
      }
    }
  }
})


