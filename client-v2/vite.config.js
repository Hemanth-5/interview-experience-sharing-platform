import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig(({ mode }) => {
  const isProduction = mode === 'production';

  return {
    plugins: [
      react(), tailwindcss()
      // Note: Obfuscation disabled due to compatibility issues with modern ES modules
      // You can enable it later when the plugin supports import.meta and other modern syntax
    ],    build: {
      // Output directory
      outDir: 'dist',
      
      // Source maps configuration
      sourcemap: isProduction ? 'hidden' : true,
      
      // Minimize in production
      minify: isProduction ? 'terser' : false,
      
      // Terser options for additional minification
      terserOptions: isProduction ? {
        compress: {
          drop_console: true,
          drop_debugger: true
        }
      } : undefined,
      
      // Rollup options
      rollupOptions: {
        output: {
          // Manual chunk splitting for better caching
          manualChunks: {
            vendor: ['react', 'react-dom'],
            router: ['react-router-dom'],
            utils: ['axios', 'lucide-react']
          }
        }
      }
    },
    
    server: {
      port: 3000,
      host: true,
      // Proxy API calls to backend
      proxy: {
        '/auth': {
          target: 'http://localhost:5000',
          changeOrigin: true,
          secure: false
        },
        '/api': {
          target: 'http://localhost:5000',
          changeOrigin: true,
          secure: false
        }
      }
    },
    
    preview: {
      port: 3000,
      host: true
    },
    
    // Environment variables prefix
    envPrefix: 'VITE_',
    
    // Define global constants
    define: {
      __DEV__: !isProduction,
      'process.env.NODE_ENV': JSON.stringify(mode)
    }
  }
})