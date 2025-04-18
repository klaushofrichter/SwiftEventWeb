import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import pkg from './package.json'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue()],
  base: '/SwiftEventWeb/',
  server: {
    proxy: {
      '/api/api/client/refresh': {
        target: 'https://api.swiftsensors.net',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/api\/client\/refresh/, '/api/token/v2/refresh')
      },
      '/api': {
        target: 'https://api.swiftsensors.net',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, '')
      }
    }
  },
  define: {
    'import.meta.env.VITE_APP_VERSION': JSON.stringify(pkg.version),
    'import.meta.env.VITE_APP_LAST_COMMIT': JSON.stringify(pkg['last-commit'] || '')
  }
})


