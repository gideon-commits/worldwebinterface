import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: true,
    port: process.env.PORT || 5173
  },
  preview: {
    host: true,
    port: process.env.PORT || 4173,
    allowedHosts: ['worldwebinterface-frontend.onrender.com']
  }
})
