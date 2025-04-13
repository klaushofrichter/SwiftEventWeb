import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { version, lastCommit } from './package.json'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue()],
  base: '/SwiftEventWeb/',
  server: {
    proxy: {
      '/api': {
        target: 'https://api.swiftsensors.net',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, '')
      }
    }
  },
  define: {
    'import.meta.env.VITE_APP_VERSION': JSON.stringify(version),
    'import.meta.env.VITE_APP_LAST_COMMIT': JSON.stringify(lastCommit || '')
  }
})
