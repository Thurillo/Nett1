import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Configurazione base per Vite (il bundler per React)
export default defineConfig({
  plugins: [react()],
  server: {
    host: true,
    port: 80,
  }
})