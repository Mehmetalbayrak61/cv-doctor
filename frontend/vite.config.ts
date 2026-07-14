import path from 'node:path'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  build: {
    rolldownOptions: {
      output: {
        codeSplitting: {
          groups: [
            {
              name: 'react-vendor',
              test: /node_modules[\\/](react|react-dom|react-router|react-router-dom)[\\/]/,
            },
            {
              name: 'data-vendor',
              test: /node_modules[\\/](@tanstack|axios|zod)[\\/]/,
            },
            {
              name: 'ui-vendor',
              test: /node_modules[\\/](radix-ui|@radix-ui|framer-motion|lucide-react|sonner)[\\/]/,
            },
          ],
        },
      },
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    // Geçici tünel testleri (ör. Cloudflare quick tunnel) rastgele bir
    // *.trycloudflare.com host header'ıyla gelir — Vite'ın host allow-list'i
    // bunu varsayılan olarak reddeder. Yalnızca `vite dev`'i etkiler, build'e
    // yansımaz.
    allowedHosts: true,
  },
})
