// Service Worker für Offline-Support und Background Sync

const CACHE_NAME = 'jagdlog-v2.8.0';
const RUNTIME_CACHE = 'jagdlog-runtime';

// Dateien, die beim Install gecacht werden sollen
const PRECACHE_URLS = [
  '/',
  '/dashboard',
  '/map',
  '/shot-analysis',
  '/statistics',
  '/crowdsourcing',
  '/hunt-log',
  '/profile',
  '/settings',
  '/manifest.json',
  '/icon-192.png',
  '/icon-512.png',
  '/sql-wasm.wasm',
  '/marker-icon.png',
  '/marker-icon-2x.png',
  '/marker-shadow.png',
];

// Install Event - Cache vorbereiten
self.addEventListener('install', (event) => {
  console.log('[SW] Installing Service Worker...');
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => {
        console.log('[SW] Precaching app shell');
        return cache.addAll(PRECACHE_URLS);
      })
      .then(() => self.skipWaiting())
  );
});

// Activate Event - Alte Caches löschen
self.addEventListener('activate', (event) => {
  console.log('[SW] Activating Service Worker...');
  event.waitUntil(
    caches
      .keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames
            .filter((name) => name !== CACHE_NAME && name !== RUNTIME_CACHE)
            .map((name) => {
              console.log('[SW] Deleting old cache:', name);
              return caches.delete(name);
            })
        );
      })
      .then(() => self.clients.claim())
  );
});

// Fetch Event - Network First, dann Cache
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Nur same-origin requests cachen
  if (url.origin !== location.origin) {
    return;
  }

  // API requests: Network First
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          // Cache erfolgreiche API responses
          if (response.status === 200) {
            const responseClone = response.clone();
            caches.open(RUNTIME_CACHE).then((cache) => {
              cache.put(request, responseClone);
            });
          }
          return response;
        })
        .catch(() => {
          // Fallback zu gecachter Response
          return caches.match(request).then((cached) => {
            return (
              cached ||
              new Response(
                JSON.stringify({
                  error: 'Offline - Keine gecachte Version verfügbar',
                }),
                {
                  status: 503,
                  headers: { 'Content-Type': 'application/json' },
                }
              )
            );
          });
        })
    );
    return;
  }

  // Static assets: Cache First
  event.respondWith(
    caches.match(request).then((cached) => {
      if (cached) {
        return cached;
      }

      return fetch(request)
        .then((response) => {
          // Cache neue Responses
          if (response.status === 200) {
            const responseClone = response.clone();
            caches.open(RUNTIME_CACHE).then((cache) => {
              cache.put(request, responseClone);
            });
          }
          return response;
        })
        .catch((error) => {
          console.error('[SW] Fetch failed:', error);
          // Fallback zu Offline-Seite
          if (request.mode === 'navigate') {
            return caches.match('/');
          }
          throw error;
        });
    })
  );
});

// Background Sync für Sync Queue
self.addEventListener('sync', (event) => {
  console.log('[SW] Background sync triggered:', event.tag);

  if (event.tag === 'sync-data') {
    event.waitUntil(
      fetch('/api/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'push' }),
      })
        .then((response) => {
          console.log('[SW] Background sync successful');
          // Notify clients
          self.clients.matchAll().then((clients) => {
            clients.forEach((client) => {
              client.postMessage({
                type: 'SYNC_SUCCESS',
                message: 'Synchronisierung erfolgreich',
              });
            });
          });
        })
        .catch((error) => {
          console.error('[SW] Background sync failed:', error);
          // Retry later
          throw error;
        })
    );
  }
});

// Push Notifications
self.addEventListener('push', (event) => {
  console.log('[SW] Push notification received');

  const data = event.data ? event.data.json() : {};
  const title = data.title || 'JagdLog Update';
  const options = {
    body: data.body || 'Neue Aktivität in JagdLog',
    icon: '/icon-192.png',
    badge: '/icon-192.png',
    vibrate: [200, 100, 200],
    data: {
      url: data.url || '/',
    },
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

// Notification Click
self.addEventListener('notificationclick', (event) => {
  console.log('[SW] Notification clicked');

  event.notification.close();

  const url = event.notification.data?.url || '/';

  event.waitUntil(
    clients
      .matchAll({ type: 'window', includeUncontrolled: true })
      .then((clientList) => {
        // Wenn Tab schon offen, fokussieren
        for (const client of clientList) {
          if (client.url === url && 'focus' in client) {
            return client.focus();
          }
        }
        // Sonst neuen Tab öffnen
        if (clients.openWindow) {
          return clients.openWindow(url);
        }
      })
  );
});

// Message Handler
self.addEventListener('message', (event) => {
  console.log('[SW] Message received:', event.data);

  if (event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }

  if (event.data.type === 'CLEAR_CACHE') {
    event.waitUntil(
      caches.keys().then((names) => {
        return Promise.all(names.map((name) => caches.delete(name)));
      })
    );
  }
});

console.log('[SW] Service Worker loaded');
