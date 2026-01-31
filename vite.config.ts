import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

const buildId = `${process.env.npm_package_version ?? '0.0.0'}-${new Date().toISOString()}`

export default defineConfig({
  base: '/Habitcheck/',
  build: {
    // Keep sourcemaps enabled to debug production-only crashes.
    sourcemap: true
  },
  define: {
    __APP_BUILD_ID__: JSON.stringify(buildId)
  },
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['assets/app-icon.png', 'pwa/favicon-32x32.png', 'pwa/apple-touch-icon.png'],
      manifest: {
        name: 'Habitcheck',
        short_name: 'Habitcheck',
        description: 'Private daily tracker with Green/Yellow/Red check-ins.',
        theme_color: '#0f172a',
        background_color: '#0f172a',
        display: 'standalone',
        start_url: '/Habitcheck/',
        icons: [
          {
            src: '/Habitcheck/pwa/icon-192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: '/Habitcheck/pwa/icon-512.png',
            sizes: '512x512',
            type: 'image/png'
          },
          {
            src: '/Habitcheck/pwa/apple-touch-icon.png',
            sizes: '180x180',
            type: 'image/png',
            purpose: 'any'
          }
        ]
      },
      workbox: {
        cleanupOutdatedCaches: true,
        clientsClaim: true,
        navigateFallback: '/Habitcheck/index.html',
        skipWaiting: true,
        runtimeCaching: [
          {
            urlPattern: ({ request }) => request.destination === 'image',
            handler: 'CacheFirst',
            options: {
              cacheName: 'images',
              expiration: { maxEntries: 60, maxAgeSeconds: 60 * 60 * 24 * 30 }
            }
          }
        ]
      }
    })
  ],
  test: {
    environment: 'node'
  }
})
