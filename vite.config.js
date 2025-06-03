import { defineConfig } from 'vite';
import { fileURLToPath, URL } from 'node:url';
import { VitePWA } from 'vite-plugin-pwa';
import vue from '@vitejs/plugin-vue';
import basicSsl from '@vitejs/plugin-basic-ssl';

export default defineConfig(({ command, mode }) => ({
  base: '/', // Set to your Netlify site's base URL if using a subdirectory
  optimizeDeps: {
    include: ['vue', 'vue-router', '@supabase/supabase-js', 'pinia']
  },

  plugins: [
    vue(),
    basicSsl()
    // Temporarily disabled PWA plugin to identify build issues
    // VitePWA({
    //   registerType: 'autoUpdate',
    //   includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'masked-icon.svg'],
    //   manifest: {
    //     name: 'Respondr UK',
    //     short_name: 'Respondr',
    //     description: 'CAD System for Medical and Security Teams',
    //     theme_color: '#0d6efd',
    //     background_color: '#ffffff',
    //     display: 'standalone',
    //     icons: [
    //       {
    //         src: '/pwa-192x192.png',
    //         sizes: '192x192',
    //         type: 'image/png',
    //         purpose: 'any maskable'
    //       },
    //       {
    //         src: '/pwa-512x512.png',
    //         sizes: '512x512',
    //         type: 'image/png',
    //         purpose: 'any maskable'
    //       }
    //     ]
    //   },
    //   workbox: {
    //     globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
    //     runtimeCaching: [
    //       {
    //         urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
    //         handler: 'CacheFirst',
    //         options: {
    //           cacheName: 'google-fonts-cache',
    //           expiration: {
    //             maxEntries: 10,
    //             maxAgeSeconds: 60 * 60 * 24 * 365 // 1 year
    //           },
    //           cacheableResponse: {
    //             statuses: [0, 200]
    //           }
    //         }
    //       },
    //       {
    //         urlPattern: /^https:\/\/fonts\.gstatic\.com\/.*/i,
    //         handler: 'CacheFirst',
    //         options: {
    //           cacheName: 'gstatic-fonts-cache',
    //           expiration: {
    //             maxEntries: 10,
    //             maxAgeSeconds: 60 * 60 * 24 * 30 // 30 days
    //           },
    //           cacheableResponse: {
    //             statuses: [0, 200]
    //           }
    //         }
    //       }
    //     ]
    //   },
    //   devOptions: {
    //     enabled: false
    //   }
    // })
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  },
  server: {
    port: 5173,
    strictPort: true,
    open: true
  },
  preview: {
    port: 4173,
    strictPort: true
  },
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: mode !== 'production',
    minify: mode === 'production' ? 'terser' : false,
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor': ['vue', 'vue-router', '@supabase/supabase-js'],
          'chart': ['chart.js'],
          'leaflet': ['leaflet']
        },
        external: ['pinia']
      }
    }
  },
  publicDir: 'public',
  define: {
    'import.meta.env.DEPLOY_ENV': JSON.stringify(process.env.DEPLOY_ENV || 'development')
  },

}));
