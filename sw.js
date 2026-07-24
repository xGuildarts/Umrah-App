const CACHE = 'adriaska-v3';
const OFFLINE_URL = './index.html';

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll([OFFLINE_URL])).catch(()=>{}));
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k=>k!==CACHE).map(k=>caches.delete(k)))));
  self.clients.claim();
});

self.addEventListener('fetch', e => {
  if(e.request.mode === 'navigate'){
    e.respondWith(fetch(e.request).catch(() => caches.match(OFFLINE_URL)));
  }
});
