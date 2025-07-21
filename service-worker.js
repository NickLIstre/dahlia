const cacheName = 'globe-v3';
const assetsToCache = [
  '/stephanotis/',
  '/stephanotis/index.html',
  '/stephanotis/globe.html',
  '/stephanotis/landing.html',
  '/stephanotis/style.css',
  '/stephanotis/landing.css',
  '/stephanotis/script.js',
  '/stephanotis/icons/icon-192.png',
  '/stephanotis/icons/icon-512.png'
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
