import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vite.dev/config/
export default defineConfig({
  base: '/SwiftEventWeb/', 
  plugins: [vue()],
  server: {
    proxy: {
      '/api': {
        target: 'https://api.swiftsensors.net',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, '')
      }
    }
  },
  preview: {
    proxy: {
      '/api': {
        target: 'https://api.swiftsensors.net',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, '')
      }
    }
  }
})
