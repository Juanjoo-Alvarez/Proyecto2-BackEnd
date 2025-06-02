import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss()
  ], server: {
    host: true,
    port: 5173,
  }
})

// Vite port http://localhost:5173
// Flask port http://localhost:5000
