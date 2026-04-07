const CACHE_NAME = 'cryptofx-v1';
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/favicon.svg',
  '/icons/icon-192.svg',
  '/icons/icon-512.svg'
];

const API_CACHE_NAME = 'cryptofx-api-v1';
const CACHEABLE_API_ROUTES = [
  '/api/markets',
  '/api/indices',
  '/api/stocks',
  '/api/futures',
  '/api/copytrading'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[SW] Caching static assets');
      return cache.addAll(STATIC_ASSETS);
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME && name !== API_CACHE_NAME)
          .map((name) => caches.delete(name))
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  if (request.method !== 'GET') return;
  if (!url.protocol.startsWith('http')) return;

  if (url.pathname.startsWith('/api/')) {
    const isCacheableRoute = CACHEABLE_API_ROUTES.some(route => url.pathname.startsWith(route));
    
    if (isCacheableRoute) {
      event.respondWith(
        caches.open(API_CACHE_NAME).then((cache) => {
          return cache.match(request).then((cachedResponse) => {
            const fetchPromise = fetch(request).then((networkResponse) => {
              if (networkResponse.ok) {
                cache.put(request, networkResponse.clone());
              }
              return networkResponse;
            }).catch(() => cachedResponse);

            return cachedResponse || fetchPromise;
          });
        })
      );
    } else {
      event.respondWith(
        fetch(request).catch(() => {
          return caches.match(request);
        })
      );
    }
    return;
  }

  event.respondWith(
    fetch(request).then((networkResponse) => {
      if (networkResponse.ok) {
        const responseClone = networkResponse.clone();
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(request, responseClone);
        });
      }
      return networkResponse;
    }).catch(() => {
      return caches.match(request).then((cachedResponse) => {
        if (cachedResponse) return cachedResponse;
        if (request.destination === 'document') {
          return caches.match('/');
        }
        return new Response('Offline', { status: 503 });
      });
    })
  );
});

self.addEventListener('push', (event) => {
  const data = event.data?.json() || {};
  const title = data.title || 'CryptoFX';
  const options = {
    body: data.body || 'You have a new notification',
    icon: '/icons/icon-192.svg',
    badge: '/favicon.svg',
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: data.id || 1
    }
  };

  event.waitUntil(
    self.registration.showNotification(title, options)
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  event.waitUntil(
    clients.openWindow('/')
  );
});
