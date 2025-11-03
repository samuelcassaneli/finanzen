import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');
    return {
      base: '/finanzen/',
      server: {
        port: 3000,
        host: '0.0.0.0',
      },
      plugins: [
        react(),
        VitePWA({
          registerType: 'autoUpdate',
          includeAssets: ['vite.svg'],
          manifest: {
            name: 'FinanZen - Personal Finance PWA',
            short_name: 'FinanZen',
            description: 'Your personal finance dashboard.',
            theme_color: '#1a202c',
            background_color: '#1a202c',
            display: 'standalone',
            start_url: '.',
            icons: [
              {
                src: 'https://picsum.photos/192/192?grayscale',
                sizes: '192x192',
                type: 'image/png'
              },
              {
                src: 'https://picsum.photos/512/512?grayscale',
                sizes: '512x512',
                type: 'image/png'
              }
            ]
          },
          devOptions: {
            enabled: true,
            type: 'module',
          }
        })
      ],
      define: {
        'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
        'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY)
      },
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
        }
      }
    };
});