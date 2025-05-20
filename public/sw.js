// public/sw.js
const CACHE_NAME = 'nutritrack-lite-cache-v1';
const urlsToCache = [
  '/', // Cache the main entry point
  '/manifest.json'
  // Add paths to your crucial static assets if any are not handled by Next.js cache.
  // For Next.js, '/_next/static/' assets are versioned and generally well-cached by the browser.
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Service Worker: Caching app shell');
        return cache.addAll(urlsToCache);
      })
      .catch(error => {
        console.error('Service Worker: Failed to cache app shell during install:', error);
      })
  );
});

self.addEventListener('fetch', (event) => {
  // Let Next.js handle its own assets for optimal caching, especially development mode.
  if (event.request.url.includes('/_next/')) {
    return; // Do not intercept Next.js internal requests or HMR.
  }

  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // Cache hit - return response
        if (response) {
          return response;
        }

        // Not in cache - fetch from network
        return fetch(event.request).then(
          (networkResponse) => {
            // Check if we received a valid response to cache
            if (!networkResponse || networkResponse.status !== 200 || networkResponse.type !== 'basic') {
              return networkResponse;
            }

            const responseToCache = networkResponse.clone();

            caches.open(CACHE_NAME)
              .then(cache => {
                // Only cache GET requests for specified URLs or root.
                if (event.request.method === 'GET' && 
                    (urlsToCache.includes(new URL(event.request.url).pathname) || new URL(event.request.url).pathname === '/')) {
                  cache.put(event.request, responseToCache);
                }
              });

            return networkResponse;
          }
        ).catch(() => {
          // Fallback for navigation requests if offline and root is cached.
          if (event.request.mode === 'navigate' && new URL(event.request.url).pathname === '/') {
            return caches.match('/');
          }
          // For other failed fetches, let the browser handle the error.
          // This ensures that if an asset is not in urlsToCache and network fails, it shows a browser error.
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
            console.log('Service Worker: Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      console.log('Service Worker: Activated and old caches cleaned.');
      return self.clients.claim(); // Ensure new SW takes control immediately
    })
  );
});
