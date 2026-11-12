import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// base './' чтобы сборка открывалась из любой папки (GitHub Pages)
export default defineConfig({
  base: './',
  plugins: [react()],
})
