import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { visualizer } from 'rollup-plugin-visualizer'
import path from 'path'

// https://vite.dev/config/
export default defineConfig(({ command }) => ({
  resolve: command === 'build' ? {
    alias: {
      'msw/browser': path.resolve(__dirname, './src/mocks/emptyMock.ts'),
      'msw': path.resolve(__dirname, './src/mocks/emptyMock.ts'),
    }
  } : {},
  plugins: [
    react(),
    tailwindcss(),
    visualizer({
      filename: 'dist/stats.html',
      open: false,
      gzipSize: true,
      brotliSize: true,
      template: 'treemap'
    })
  ],
  build: {
    target: 'es2023',
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: false,
        drop_debugger: true,
        pure_funcs: ['console.log'],
      },
    },
    chunkSizeWarningLimit: 150,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules/react/') || id.includes('node_modules/react-dom/')) {
            return 'react-vendor';
          }
          if (id.includes('node_modules/react-router/') || id.includes('node_modules/react-router-dom/') || id.includes('node_modules/@react-router/')) {
            return 'router-vendor';
          }
          if (id.includes('node_modules/lucide-react/')) {
            return 'icons';
          }
          if (id.includes('node_modules/axios/')) {
            return 'network';
          }
          return undefined;
        },
      },
    },
  },
}))



