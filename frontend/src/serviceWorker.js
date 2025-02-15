import { clientsClaim } from 'workbox-core';
import { precacheAndRoute, createHandlerBoundToURL } from 'workbox-precaching';
import { registerRoute, NavigationRoute } from 'workbox-routing';
import { StaleWhileRevalidate, CacheFirst, NetworkFirst } from 'workbox-strategies';
import { ExpirationPlugin } from 'workbox-expiration';
import { CacheableResponsePlugin } from 'workbox-cacheable-response';
import OfflineManager from './utils/OfflineManager';

/* global workbox */
declare const self: ServiceWorkerGlobalScope;

clientsClaim();

// Precache alla statiska tillgångar
precacheAndRoute(workbox.__WB_MANIFEST);

// Hantera alla navigeringsförfrågningar med samma HTML-fil
const handler = createHandlerBoundToURL('/index.html');
registerRoute(new NavigationRoute(handler));

// Cache API-anrop
registerRoute(
  ({ url }) => url.pathname.startsWith('/api/'),
  new NetworkFirst({
    cacheName: 'api-cache',
    plugins: [
      new CacheableResponsePlugin({
        statuses: [0, 200],
      }),
      new ExpirationPlugin({
        maxEntries: 100,
        maxAgeSeconds: 24 * 60 * 60, // 24 timmar
      }),
    ],
  })
);

// Cache statiska tillgångar
registerRoute(
  ({ request }) => request.destination === 'style' ||
                   request.destination === 'script' ||
                   request.destination === 'font',
  new StaleWhileRevalidate({
    cacheName: 'static-resources',
  })
);

// Cache bilder
registerRoute(
  ({ request }) => request.destination === 'image',
  new CacheFirst({
    cacheName: 'images',
    plugins: [
      new CacheableResponsePlugin({
        statuses: [0, 200],
      }),
      new ExpirationPlugin({
        maxEntries: 60,
        maxAgeSeconds: 30 * 24 * 60 * 60, // 30 dagar
      }),
    ],
  })
);

// Hantera offline-fallback
addEventListener('fetch', (event) => {
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request).catch(() => {
        return caches.match('/offline.html');
      })
    );
  }
});

// Synkronisera offline-data när online igen
addEventListener('sync', (event) => {
  if (event.tag === 'sync-pending-tasks') {
    event.waitUntil(syncPendingTasks());
  }
});

async function syncPendingTasks() {
  try {
    const pendingActions = await OfflineManager.getPendingActions();
    await OfflineManager.processPendingActions(pendingActions);
    return true;
  } catch (error) {
    console.error('Failed to sync tasks:', error);
    return false;
  }
}

export {}; 