import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  
  const API_BASE_URL = env.API_BASE_URL;
  const VERSION_NO = env.VERSION_NO || '3.4.0';
  const BASE_URL = env.BASE_URL;
  
  console.log('API_BASE_URL:', API_BASE_URL);
  console.log('VERSION_NO:', VERSION_NO);
  console.log('BASE_URL:', BASE_URL);
  
  return {
    server: {
      host: "::",
      port: 8080,
      allowedHosts: [
        'localhost',
        'c88edc8b-ea86-4055-a204-e306e8130825.lovableproject.com',
        'f1584156-9f38-44e7-8d36-32dc5867852d.lovableproject.com',
        '*.lovableproject.com'
      ]
    },
    plugins: [
      react(),
      mode === 'development' &&
      componentTagger(),
    ].filter(Boolean),
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
    build: {
      rollupOptions: {
        output: {
          manualChunks: {
            'vendor': ['react', 'react-dom', 'react-router-dom'],
            'api': ['@/services/api'],
            'utils': ['@/lib/utils', 'date-fns', 'zod']
          }
        }
      }
    },
    define: {
      // Make env variables available to the application with fallbacks
      'import.meta.env.API_BASE_URL': JSON.stringify(API_BASE_URL),
      'import.meta.env.VERSION_NO': JSON.stringify(VERSION_NO),
      'import.meta.env.BASE_URL': JSON.stringify(BASE_URL),
    }
  };
});
