import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    open: true
  },
  // REMOVE THIS: root: './public',
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    rollupOptions: {
      input: path.resolve(__dirname, 'index.html') // Point to root index.html
    }
  },
  publicDir: 'public' // Specify public assets directory
})