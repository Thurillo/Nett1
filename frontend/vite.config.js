// frontend/vite.config.js - 21/02/2026 - V 0.13
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: './', // AGGIUNGI QUESTA RIGA
  server: {
    host: true,
    port: 80,
  }
})