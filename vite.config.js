import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { fileURLToPath, URL } from 'node:url'

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    },
  },
  server: {
    port: 5173
  },
  build: {
    // Optimizaciones de build
    target: 'esnext',
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
      },
    },
    rollupOptions: {
      output: {
        // Separar chunks para mejor caching
        manualChunks: {
          vendor: ['vue', 'vue-router', 'pinia'],
          ui: ['primevue'],
          charts: ['chart.js'],
          utils: ['axios', 'dayjs', 'crypto-js']
        }
      }
    },
    // Aumentar el límite de chunk size
    chunkSizeWarningLimit: 1000,
    // Habilitar compresión
    sourcemap: false
  },
  optimizeDeps: {
    include: ['vue', 'vue-router', 'pinia', 'axios'],
    exclude: ['primevue']
  }
})

