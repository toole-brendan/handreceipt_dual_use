import { GenerateSW } from 'workbox-webpack-plugin';

export const serviceWorkerConfig: Partial<GenerateSW> = {
  clientsClaim: true,
  skipWaiting: true,
  cleanupOutdatedCaches: true,
  maximumFileSizeToCacheInBytes: 5 * 1024 * 1024, // 5MB
  runtimeCaching: [
    {
      // Cache API requests
      urlPattern: /^https:\/\/api\./,
      handler: 'NetworkFirst',
      options: {
        cacheName: 'api-cache',
        expiration: {
          maxEntries: 100,
          maxAgeSeconds: 24 * 60 * 60 // 24 hours
        },
        cacheableResponse: {
          statuses: [0, 200]
        }
      }
    },
    {
      // Cache static assets
      urlPattern: /\.(js|css|png|jpg|jpeg|svg|gif)$/,
      handler: 'CacheFirst',
      options: {
        cacheName: 'static-assets',
        expiration: {
          maxEntries: 100,
          maxAgeSeconds: 7 * 24 * 60 * 60 // 7 days
        }
      }
    },
    {
      // Cache fonts
      urlPattern: /^https:\/\/fonts\./,
      handler: 'CacheFirst',
      options: {
        cacheName: 'font-cache',
        expiration: {
          maxEntries: 10,
          maxAgeSeconds: 30 * 24 * 60 * 60 // 30 days
        }
      }
    }
  ],
  // Define which routes should have offline support
  navigateFallback: '/offline.html',
  navigateFallbackDenylist: [
    // Exclude API calls from offline fallback
    /^\/api\//,
    // Exclude admin routes from offline support
    /^\/admin\//
  ],
  // Include specific files in the precache
  include: [
    /\.html$/,
    /\.js$/,
    /\.css$/,
    /\.woff2$/,
    /manifest\.json$/
  ],
  // Exclude specific files from the precache
  exclude: [
    /\.map$/,
    /\.DS_Store$/,
    /^admin\//,
    /asset-manifest\.json$/
  ]
};

export const manifestConfig = {
  name: 'Hand Receipt Management System',
  short_name: 'HandReceipt',
  description: 'Manage and track property records digitally',
  start_url: '/',
  display: 'standalone',
  background_color: '#ffffff',
  theme_color: '#000000',
  icons: [
    {
      src: '/icons/icon-72x72.png',
      sizes: '72x72',
      type: 'image/png'
    },
    {
      src: '/icons/icon-96x96.png',
      sizes: '96x96',
      type: 'image/png'
    },
    {
      src: '/icons/icon-128x128.png',
      sizes: '128x128',
      type: 'image/png'
    },
    {
      src: '/icons/icon-144x144.png',
      sizes: '144x144',
      type: 'image/png'
    },
    {
      src: '/icons/icon-152x152.png',
      sizes: '152x152',
      type: 'image/png'
    },
    {
      src: '/icons/icon-192x192.png',
      sizes: '192x192',
      type: 'image/png'
    },
    {
      src: '/icons/icon-384x384.png',
      sizes: '384x384',
      type: 'image/png'
    },
    {
      src: '/icons/icon-512x512.png',
      sizes: '512x512',
      type: 'image/png'
    }
  ]
};
