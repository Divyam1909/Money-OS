
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  // Load env file based on `mode` in the current working directory.
  // We cast process to any to avoid TypeScript errors with process.cwd() in some environments
  const env = loadEnv(mode, (process as any).cwd(), '');
  return {
    plugins: [react()],
    define: {
      // Polyfill process.env.API_KEY so existing code works without changes in the browser
      'process.env.API_KEY': JSON.stringify(env.API_KEY)
    },
    build: {
        outDir: 'dist',
    }
  };
});
