import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { nodePolyfills } from 'vite-plugin-node-polyfills'
import path from 'path'
import { mcpBridgePlugin } from './src/plugins/mcp-bridge-plugin'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    nodePolyfills({
      // Enable polyfills for specific globals and modules
      globals: {
        Buffer: true,
        global: true,
        process: true,
      },
      // Enable polyfills for these Node.js modules
      protocolImports: true,
    }),
    mcpBridgePlugin(),
  ],
  base: process.env.NODE_ENV === 'production' ? '/chat-v4/' : '/',
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  define: {
    global: 'globalThis',
  },
  server: {
    port: 3000,
    open: true
  },
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: false,
    minify: 'esbuild',
    rollupOptions: {
      external: [],
      output: {
        globals: {}
      }
    },
    commonjsOptions: {
      include: [/sql\.js/, /node_modules/]
    }
  },
  optimizeDeps: {
    include: ['@mastra/core/agent', 'sql.js']
  }
})