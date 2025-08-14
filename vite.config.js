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
    minify: 'esbuild', // Usar esbuild en lugar de terser para mayor compatibilidad
    rollupOptions: {
      output: {
        // Separar chunks para mejor caching
        manualChunks: (id) => {
          if (id.includes('node_modules')) {
            if (id.includes('vue') || id.includes('router') || id.includes('pinia')) {
              return 'vendor';
            }
            if (id.includes('primevue') || id.includes('primeicons')) {
              return 'ui';
            }
            if (id.includes('chart.js')) {
              return 'charts';
            }
            if (id.includes('axios') || id.includes('dayjs') || id.includes('crypto-js')) {
              return 'utils';
            }
            return 'vendor';
          }
        }
      }
    },
    // Aumentar el límite de chunk size
    chunkSizeWarningLimit: 1000,
    // Deshabilitar sourcemap para build más rápido
    sourcemap: false
  },
  optimizeDeps: {
    include: ['vue', 'vue-router', 'pinia', 'axios'],
    exclude: []
  }
})

