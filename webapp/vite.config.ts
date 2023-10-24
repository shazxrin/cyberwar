import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      "/ws": {
        target: "game://localhost:9099",
        ws: true,
      }
    },
  },
})
