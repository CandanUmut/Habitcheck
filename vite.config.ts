import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  base: '/Habitcheck/',
  plugins: [react()],
  test: {
    environment: 'node'
  }
})
