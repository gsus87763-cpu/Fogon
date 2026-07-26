import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');

  // On Railway, the backend's public domain is exposed via RAILWAY_PUBLIC_DOMAIN.
  // Prefer an explicitly set VITE_API_URL, falling back to the backend's public
  // domain when available, and finally to localhost for local development.
  const apiUrl =
    env.VITE_API_URL ||
    (env.RAILWAY_PUBLIC_DOMAIN
      ? `https://${env.RAILWAY_PUBLIC_DOMAIN}/api`
      : 'http://localhost:4000/api');

  return {
    plugins: [react()],
    server: {
      port: 5173,
      host: true
    },
    preview: {
      port: 5173,
      host: true
    },
    define: {
      'import.meta.env.VITE_API_URL': JSON.stringify(apiUrl)
    }
  };
});