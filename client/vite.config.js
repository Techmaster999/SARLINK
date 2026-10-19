import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, '.', '')

  return {
    plugins: [react()],
    server: {
      port: 5173,
    },
    define: {
      'import.meta.env.VITE_CLIENT_ID': JSON.stringify(
        env.VITE_CLIENT_ID || env.CLIENT_ID || '',
      ),
    },
  }
})
