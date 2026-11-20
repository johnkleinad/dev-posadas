import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    // Escucha en todas las interfaces (localhost + Tailscale)
    host: true,
    port: 5173,
    strictPort: true,
    // Permite acceder vía nombre MagicDNS de Tailscale (*.ts.net)
    allowedHosts: ['.ts.net'],
  },
  preview: {
    host: true,
    port: 4173,
    strictPort: true,
    allowedHosts: ['.ts.net'],
  },
})
