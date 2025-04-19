import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import pkg from './package.json'
import { execSync } from 'child_process'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    {
      name: 'prepare-package-json',
      closeBundle: async () => {
        // Run our script after the bundle is created
        execSync('node scripts/prepare-dist-package.js', { stdio: 'inherit' })
      }
    }
  ],
  base: '/SwiftEventWeb/',
  server: {
    proxy: {
      '/proxy': {
        target: 'https://api.swiftsensors.net',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/proxy/, '')
      }
    }
  },
  define: {
    'import.meta.env.VITE_APP_VERSION': JSON.stringify(pkg.version),
    'import.meta.env.VITE_APP_LAST_COMMIT': JSON.stringify(pkg['last-commit'] || '')
  }
})
