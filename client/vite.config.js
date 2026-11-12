import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, '.', '')

  return {
    plugins: [react()],
    server: {
      host: '0.0.0.0',
      port: 8888,
      strictPort: true,
      proxy: {
        '/api/incidents': 'http://api-server:8888',
        '/api/teams': 'http://api-server:8888',
        // Live dashboard updates (Socket.IO). Long-polling works through this proxy;
        // websocket upgrades need an httpServer, which Vite's middleware mode doesn't have.
        '/socket.io': { target: 'http://api-server:8888', ws: true },
      },
    },
    define: {
      'import.meta.env.VITE_CLIENT_ID': JSON.stringify(
        env.VITE_CLIENT_ID || env.CLIENT_ID || '',
      ),
    },
  }
})
