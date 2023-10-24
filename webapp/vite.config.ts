import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: "/static",
  build: {
    outDir: "../www"
  },
  server: {
    proxy: {
      "/ws": {
        target: "ws://localhost:9090",
        ws: true,
      }
    },
  },
})
