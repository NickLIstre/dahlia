const cacheName = 'globe-v3';
const assetsToCache = [
  '/dahlia/',
  '/dahlia/index.html',
  '/dahlia/globe.html',
  '/dahlia/landing.html',
  '/dahlia/style.css',
  '/dahlia/landing.css',
  '/dahlia/script.js',
  '/dahlia/icons/icon-192.png',
  '/dahlia/icons/icon-512.png'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(cacheName).then(cache => cache.addAll(assetsToCache))
  );
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request).then(cached => cached || fetch(event.request))
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== cacheName).map(k => caches.delete(k)))
    )
  );
});
