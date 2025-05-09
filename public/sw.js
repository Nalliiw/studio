const CACHE_NAME = 'nutritrack-lite-cache-v1';
const urlsToCache = [
  '/',
  '/login',
  // Add other important static assets and routes you want to cache
  // For example: '/manifest.json', '/icons/icon-192x192.png', etc.
  // Be careful with caching dynamic routes or API calls unless handled properly.
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Opened cache');
        return cache.addAll(urlsToCache);
      })
  );
  self.skipWaiting();
});

self.addEventListener('fetch', (event) => {
  // We only want to cache GET requests.
  if (event.request.method !== 'GET') {
    return;
  }

  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        if (response) {
          return response; // Serve from cache
        }
        // Not in cache, fetch from network
        return fetch(event.request).then(
          (networkResponse) => {
            // Optionally, cache new requests dynamically
            // Be careful with this for non-static assets
            // if (networkResponse && networkResponse.status === 200 && urlsToCache.includes(event.request.url)) {
            //   const responseToCache = networkResponse.clone();
            //   caches.open(CACHE_NAME)
            //     .then(cache => {
            //       cache.put(event.request, responseToCache);
            //     });
            // }
            return networkResponse;
          }
        ).catch(() => {
          // Fallback for offline, e.g. a custom offline page
          // if (event.request.mode === 'navigate') {
          //   return caches.match('/offline.html');
          // }
        });
      })
  );
});

self.addEventListener('activate', (event) => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  return self.clients.claim();
});
