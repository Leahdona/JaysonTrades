const CACHE_NAME = 'tradetracker-v1';
const ASSETS = [
  '/',
  '/index.html',
  '/trades.html',
  '/weekly.html',
  '/withdraw.html',
  '/deposit.html',
  '/style.css',
  '/script.js',
  '/trades.js',
  '/weekly.js',
  '/icons/icon-192.png',
  '/icons/icon-512.png'
];

// Install event
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(ASSETS))
  );
});

// Fetch event
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request).then(res => res || fetch(event.request))
  );
});
