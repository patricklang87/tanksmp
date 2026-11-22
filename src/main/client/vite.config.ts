import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

const BACKEND_ORIGIN = 'http://localhost:8080'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    // In development the client talks to the Spring Boot server through the dev server,
    // so the app uses the same relative URLs it uses in production.
    proxy: {
      '/api': BACKEND_ORIGIN,
      '/ws': { target: BACKEND_ORIGIN, ws: true },
    },
  },
})
