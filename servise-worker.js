self.addEventListener('install', event => {
  console.log('Service Worker installing...');
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  console.log('Service Worker activating...');
  event.waitUntil(clients.claim());
});

self.addEventListener('fetch', event => {
  // Cache-first strategy for static assets
  if (event.request.url.includes('raw.githubusercontent.com')) {
    event.respondWith(
      caches.match(event.request).then(response => {
        return response || fetch(event.request);
      })
    );
  }
});

// Keep alive for background operation
let keepAliveInterval;

self.addEventListener('message', event => {
  if (event.data.type === 'KEEP_ALIVE') {
    keepAliveInterval = setInterval(() => {
      self.clients.matchAll().then(clients => {
        clients.forEach(client => {
          client.postMessage({ type: 'PING' });
        });
      });
    }, 30000);
  }
});

self.addEventListener('sync', event => {
  if (event.tag === 'update-data') {
    console.log('Background sync triggered');
  }
});
