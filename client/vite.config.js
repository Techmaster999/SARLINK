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
        '/api': 'http://api-server:8888',
      },
    },
    define: {
      'import.meta.env.VITE_CLIENT_ID': JSON.stringify(
        env.VITE_CLIENT_ID || env.CLIENT_ID || '',
      ),
    },
  }
})
